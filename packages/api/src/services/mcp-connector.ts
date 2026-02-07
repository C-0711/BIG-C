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

export class MCPConnector extends EventEmitter {
  private process: ChildProcess;
  private nextId = 1;
  private pending = new Map<number, { resolve: (value: any) => void; reject: (error: any) => void }>();
  private buffer = '';

  constructor(command: string, args: string[] = []) {
    super();
    this.process = spawn(command, args, { stdio: ['pipe', 'pipe', 'inherit'] });
    this.process.stdout?.on('data', this.onData.bind(this));
    this.process.on('exit', (code, signal) => {
      this.emit('exit', { code, signal });
    });
  }

  private onData(data: Buffer) {
    this.buffer += data.toString();
    let delimiter: number;
    while ((delimiter = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, delimiter).trim();
      this.buffer = this.buffer.slice(delimiter + 1);
      if (!line) continue;
      try {
        const message = JSON.parse(line);
        this.handleMessage(message);
      } catch (err) {
        this.emit('error', new Error(`Failed to parse JSON-RPC message: ${err}`));
      }
    }
  }

  private handleMessage(message: any) {
    if (message.id !== undefined) {
      if (message.result !== undefined || message.error !== undefined) {
        const pending = this.pending.get(message.id);
        if (pending) {
          this.pending.delete(message.id);
          if (message.error) {
            pending.reject(message.error);
          } else {
            pending.resolve(message.result);
          }
        }
      }
    } else if (message.method) {
      this.emit('notification', message as JsonRpcNotification);
    }
  }

  public sendRequest<T = any>(method: string, params?: any): Promise<T> {
    const id = this.nextId++;
    const request: JsonRpcRequest = { jsonrpc: '2.0', id, method, params };
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.sendMessage(request);
    });
  }

  public sendNotification(method: string, params?: any): void {
    const notification: JsonRpcNotification = { jsonrpc: '2.0', method, params };
    this.sendMessage(notification);
  }

  private sendMessage(message: object) {
    const json = JSON.stringify(message);
    this.process.stdin?.write(json + '\n');
  }

  public dispose() {
    this.process.stdin?.end();
    this.process.kill();
  }
}
