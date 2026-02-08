/**
 * Lightweight MCP client for API server
 * Simplified version for testing and discovery only
 */

import { spawn, ChildProcess } from 'child_process';

interface MCPConfig {
  command: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export class MCPClient {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pending = new Map<number, { resolve: any; reject: any; timeout: NodeJS.Timeout }>();
  private buffer = '';
  private timeout: number;

  constructor(timeout: number = 30000) {
    this.timeout = timeout;
  }

  spawn(config: MCPConfig): void {
    // Resolve environment variables
    const env = this.resolveEnv(config.env);

    this.process = spawn(config.command, config.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: config.cwd || process.cwd(),
      env: { ...process.env, ...env },
    });

    // Handle stdout (JSON-RPC responses)
    this.process.stdout?.on('data', (chunk) => {
      this.buffer += chunk.toString();
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const msg = JSON.parse(line);
            this.handleResponse(msg);
          } catch (err) {
            console.warn('[MCP] Invalid JSON:', line);
          }
        }
      }
    });

    // Handle stderr
    this.process.stderr?.on('data', (data) => {
      const message = data.toString();
      if (!message.includes('INFO') && !message.includes('DEBUG')) {
        console.error('[MCP stderr]:', message);
      }
    });

    // Handle exit
    this.process.on('exit', (code) => {
      console.log(`[MCP] Process exited with code ${code}`);
      this.cleanup(new Error(`Process exited with code ${code}`));
    });

    this.process.on('error', (err) => {
      console.error('[MCP] Process error:', err);
      this.cleanup(err);
    });
  }

  async request(method: string, params?: any): Promise<any> {
    if (!this.process || !this.process.stdin) {
      throw new Error('MCP process not started');
    }

    const id = ++this.requestId;
    const message = {
      jsonrpc: '2.0',
      id,
      method,
      params: params || {},
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.timeout);

      this.pending.set(id, { resolve, reject, timeout: timer });

      try {
        this.process!.stdin!.write(JSON.stringify(message) + '\n');
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(err);
      }
    });
  }

  private handleResponse(msg: any): void {
    const pending = this.pending.get(msg.id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pending.delete(msg.id);

      if (msg.error) {
        pending.reject(new Error(`MCP Error: ${msg.error.message}`));
      } else {
        pending.resolve(msg.result);
      }
    }
  }

  private cleanup(error?: Error): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timeout);
      pending.reject(error || new Error('Connection closed'));
    }
    this.pending.clear();
  }

  kill(): void {
    if (this.process) {
      this.process.kill('SIGTERM');
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill('SIGKILL');
        }
      }, 5000);
    }
    this.cleanup();
  }

  private resolveEnv(env?: Record<string, string>): Record<string, string> {
    if (!env) return {};

    const resolved: Record<string, string> = {};
    for (const [key, value] of Object.entries(env)) {
      resolved[key] = value.replace(/\$\{(\w+)\}/g, (_, varName) => {
        return process.env[varName] || '';
      });
    }
    return resolved;
  }
}

/**
 * Helper function to connect, discover tools, and disconnect
 */
export async function discoverMCPTools(config: MCPConfig): Promise<{
  tools: MCPTool[];
  serverInfo: any;
}> {
  const client = new MCPClient(config.timeout || 30000);

  try {
    client.spawn(config);

    // Wait for process to start
    await new Promise(resolve => setTimeout(resolve, 500));

    // Initialize
    const initResult = await client.request('initialize', {
      protocolVersion: '2024-11-05',
      clientInfo: {
        name: '0711-c-intelligence',
        version: '1.0.0',
      },
      capabilities: {},
    });

    // Send initialized notification
    await client.request('initialized', {});

    // List tools
    const toolsResult = await client.request('tools/list', {});

    return {
      tools: toolsResult.tools || [],
      serverInfo: initResult.serverInfo,
    };
  } finally {
    client.kill();
  }
}
