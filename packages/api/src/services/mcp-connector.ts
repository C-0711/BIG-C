import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

export interface MCPServerInfo {
  name: string;
  version: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: any;
}

export interface MCPConfig {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
}

export class MCPConnector extends EventEmitter {
  private process: ChildProcess | null = null;
  private nextId = 1;
  private pending = new Map<number, { 
    resolve: (value: any) => void; 
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
  }>();
  private buffer = Buffer.alloc(0);
  private serverInfo: MCPServerInfo | null = null;
  private initialized = false;

  constructor(private config: MCPConfig) {
    super();
  }

  /**
   * Connect to MCP server and perform initialization handshake
   */
  async connect(timeoutMs = 10000): Promise<MCPServerInfo> {
    if (this.process) {
      throw new Error('Already connected');
    }

    const { command, args = [], cwd, env } = this.config;

    this.process = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.process.stdout?.on('data', (chunk: Buffer) => this.onData(chunk));
    this.process.stderr?.on('data', (chunk: Buffer) => {
      console.error('[MCP stderr]', chunk.toString());
    });

    this.process.on('exit', (code, signal) => {
      this.cleanup(`Process exited: code=${code} signal=${signal}`);
      this.emit('exit', { code, signal });
    });

    this.process.on('error', (err) => {
      this.cleanup(err.message);
      this.emit('error', err);
    });

    // Perform MCP initialization handshake
    try {
      const initResult = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: { listChanged: true },
          sampling: {},
        },
        clientInfo: {
          name: '0711-C-Intelligence',
          version: '1.0.0',
        },
      }, timeoutMs);

      const serverInfo: MCPServerInfo = initResult.serverInfo && typeof initResult.serverInfo === "object" 
        ? initResult.serverInfo 
        : { name: "unknown", version: "unknown" };
      this.serverInfo = serverInfo;
      
      // Send initialized notification
      this.sendNotification('notifications/initialized');
      this.initialized = true;

      return serverInfo;
    } catch (err) {
      this.dispose();
      throw err;
    }
  }

  /**
   * Parse incoming data with Content-Length framing (LSP-style)
   */
  private onData(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      // Look for header terminator
      const headerEnd = this.buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break;

      // Parse Content-Length header
      const header = this.buffer.slice(0, headerEnd).toString();
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) {
        console.error('[MCP] Invalid header:', header);
        this.buffer = this.buffer.slice(headerEnd + 4);
        continue;
      }

      const contentLength = parseInt(match[1], 10);
      const messageStart = headerEnd + 4;
      const messageEnd = messageStart + contentLength;

      // Wait for complete message
      if (this.buffer.length < messageEnd) break;

      // Extract and parse message
      const jsonStr = this.buffer.slice(messageStart, messageEnd).toString();
      this.buffer = this.buffer.slice(messageEnd);

      try {
        const message = JSON.parse(jsonStr);
        this.handleMessage(message);
      } catch (err) {
        console.error('[MCP] Failed to parse JSON:', err, jsonStr);
      }
    }
  }

  private handleMessage(message: any) {
    // Response to a request we sent
    if (message.id !== undefined && (message.result !== undefined || message.error !== undefined)) {
      const pending = this.pending.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(new Error(`MCP Error: ${message.error.message || JSON.stringify(message.error)}`));
        } else {
          pending.resolve(message.result);
        }
      }
      return;
    }

    // Notification from server
    if (message.method) {
      this.emit('notification', message);
      return;
    }

    // Request from server (we need to respond)
    if (message.id !== undefined && message.method) {
      this.emit('request', message);
      // Auto-respond with empty result for now
      this.sendResponse(message.id, {});
    }
  }

  /**
   * Send a JSON-RPC request and wait for response
   */
  public sendRequest<T = any>(method: string, params?: any, timeoutMs = 30000): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        reject(new Error('Not connected'));
        return;
      }

      const id = this.nextId++;
      const request: JsonRpcRequest = { jsonrpc: '2.0', id, method, params };

      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, timeoutMs);

      this.pending.set(id, { resolve, reject, timeout });
      this.sendMessage(request);
    });
  }

  /**
   * Send a JSON-RPC notification (no response expected)
   */
  public sendNotification(method: string, params?: any): void {
    const notification: JsonRpcNotification = { jsonrpc: '2.0', method, params };
    this.sendMessage(notification);
  }

  /**
   * Send a JSON-RPC response
   */
  private sendResponse(id: number, result: any): void {
    this.sendMessage({ jsonrpc: '2.0', id, result });
  }

  /**
   * Send message with Content-Length framing
   */
  private sendMessage(message: object) {
    if (!this.process?.stdin?.writable) {
      console.error('[MCP] Cannot send: stdin not writable');
      return;
    }

    const json = JSON.stringify(message);
    const contentLength = Buffer.byteLength(json, 'utf8');
    const header = `Content-Length: ${contentLength}\r\n\r\n`;

    this.process.stdin.write(header + json);
  }

  /**
   * List available tools from MCP server
   */
  async listTools(): Promise<MCPTool[]> {
    if (!this.initialized) {
      throw new Error('Not initialized - call connect() first');
    }
    const result = await this.sendRequest('tools/list');
    return result.tools || [];
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(name: string, args?: any): Promise<any> {
    if (!this.initialized) {
      throw new Error('Not initialized - call connect() first');
    }
    const result = await this.sendRequest('tools/call', {
      name,
      arguments: args || {},
    });
    return result;
  }

  /**
   * Cleanup pending requests
   */
  private cleanup(reason: string) {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(reason));
    }
    this.pending.clear();
    this.initialized = false;
    this.process = null;
  }

  /**
   * Disconnect and kill the MCP server process
   */
  public dispose() {
    if (this.process) {
      this.cleanup('Disposed');
      try {
        this.process.stdin?.end();
        this.process.kill();
      } catch (e) {
        // Ignore
      }
      this.process = null;
    }
  }

  /**
   * Check if connected and initialized
   */
  public isConnected(): boolean {
    return this.initialized && this.process !== null;
  }

  /**
   * Get server info (after connect)
   */
  public getServerInfo(): MCPServerInfo | null {
    return this.serverInfo;
  }
}
