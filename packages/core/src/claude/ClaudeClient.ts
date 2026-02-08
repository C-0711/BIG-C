/**
 * ClaudeClient - Anthropic Claude API client
 * Sprint 4.1 - Claude Integration
 */

export interface ClaudeConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  baseUrl?: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  messages: ClaudeMessage[];
  system?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ClaudeResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string;
}

export interface ClaudeStreamChunk {
  type: 'content_block_delta' | 'message_start' | 'message_stop';
  delta?: { text: string };
}

export class ClaudeClient {
  private config: Required<ClaudeConfig>;

  constructor(config: ClaudeConfig) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'claude-sonnet-4-20250514',
      maxTokens: config.maxTokens || 4096,
      baseUrl: config.baseUrl || 'https://api.anthropic.com/v1',
    };
  }

  /**
   * Send a message to Claude and get a response
   */
  async chat(request: ClaudeRequest): Promise<ClaudeResponse> {
    const response = await fetch(`${this.config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: request.maxTokens || this.config.maxTokens,
        system: request.system,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      content: data.content[0]?.text || '',
      model: data.model,
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
      },
      stopReason: data.stop_reason,
    };
  }

  /**
   * Stream a response from Claude
   */
  async *chatStream(request: ClaudeRequest): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: request.maxTokens || this.config.maxTokens,
        system: request.system,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const chunk = JSON.parse(data) as ClaudeStreamChunk;
            if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
              yield chunk.delta.text;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Simple completion helper
   */
  async complete(prompt: string, system?: string): Promise<string> {
    const response = await this.chat({
      messages: [{ role: 'user', content: prompt }],
      system,
    });
    return response.content;
  }

  /**
   * JSON completion with parsing
   */
  async completeJSON<T = unknown>(prompt: string, system?: string): Promise<T> {
    const jsonSystem = (system || '') + '\n\nRespond with valid JSON only. No markdown, no explanation.';
    const response = await this.complete(prompt, jsonSystem);
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(jsonStr) as T;
  }
}
