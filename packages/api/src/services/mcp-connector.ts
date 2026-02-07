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
  private buffer = '';
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

    // Set PYTHONUNBUFFERED for Python MCP servers
    const processEnv = { 
      ...process.env, 
      ...env,
      PYTHONUNBUFFERED: '1'
    };

    this.process = spawn(command, args, {
      cwd,
      env: processEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.process.stdout?.on('data', (chunk: Buffer) => this.onData(chunk));
    this.process.stderr?.on('data', (chunk: Buffer) => {
      const msg = chunk.toString();
      // Only log non-warning stderr
      if (!msg.includes('UserWarning') && !msg.includes('pkg_resources')) {
        console.error('[MCP stderr]', msg);
      }
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

      const serverInfo: MCPServerInfo = initResult.serverInfo && typeof initResult.serverInfo === 'object' 
        ? initResult.serverInfo 
        : { name: 'unknown', version: 'unknown' };
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
   * Parse incoming data - NDJSON format (newline-delimited JSON)
   * This is what the Python MCP SDK uses
   */
  private onData(chunk: Buffer) {
    this.buffer += chunk.toString();

    // Process complete lines
    let newlineIndex: number;
    while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);

      if (!line) continue;

      // Skip Content-Length headers if present (some servers send both)
      if (line.startsWith('Content-Length:')) continue;

      try {
        const message = JSON.parse(line);
        this.handleMessage(message);
      } catch (err) {
        // Not valid JSON - might be partial or log output
        console.error('[MCP] Failed to parse:', line.substring(0, 100));
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

    // Notification from server (like error messages)
    if (message.method) {
      this.emit('notification', message);
      // Log error notifications
      if (message.method === 'notifications/message' && message.params?.level === 'error') {
        console.error('[MCP Server Error]', message.params.data);
      }
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
   * Send message as NDJSON (newline-delimited JSON)
   * This is the format expected by the Python MCP SDK
   */
  private sendMessage(message: object) {
    if (!this.process?.stdin?.writable) {
      console.error('[MCP] Cannot send: stdin not writable');
      return;
    }

    const json = JSON.stringify(message);
    this.process.stdin.write(json + '\n');
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
