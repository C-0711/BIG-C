/**
 * MCP Integration tests
 * Sprint 3.3 - Testing & Polish
 */

import { MCPClient, MCPToolSchema } from '../mcp/MCPClient';
import { parseToolSchema, groupToolsByCategory, FormField } from '../mcp/ToolSchemaParser';
import { ToolExecutor } from '../mcp/ToolExecutor';

// Mock tool schemas
const mockSearchTool: MCPToolSchema = {
  name: 'search_products',
  description: 'Search for products',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      limit: { type: 'number', description: 'Max results', minimum: 1, maximum: 100 },
      filters: { type: 'object', description: 'Filter criteria' },
    },
    required: ['query'],
  },
};

const mockGetProductTool: MCPToolSchema = {
  name: 'get_product',
  description: 'Get product details',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string', description: 'Product ID' },
    },
    required: ['productId'],
  },
};

describe('ToolSchemaParser', () => {
  describe('parseToolSchema', () => {
    it('should parse tool schema into form fields', () => {
      const parsed = parseToolSchema(mockSearchTool);
      
      expect(parsed.name).toBe('search_products');
      expect(parsed.description).toBe('Search for products');
      expect(parsed.inputFields.length).toBe(3);
      expect(parsed.category).toBe('Search & Discovery');
    });

    it('should identify required fields', () => {
      const parsed = parseToolSchema(mockSearchTool);
      
      const queryField = parsed.inputFields.find(f => f.name === 'query');
      const limitField = parsed.inputFields.find(f => f.name === 'limit');
      
      expect(queryField?.required).toBe(true);
      expect(limitField?.required).toBe(false);
    });

    it('should parse number constraints', () => {
      const parsed = parseToolSchema(mockSearchTool);
      
      const limitField = parsed.inputFields.find(f => f.name === 'limit');
      
      expect(limitField?.type).toBe('number');
      expect(limitField?.min).toBe(1);
      expect(limitField?.max).toBe(100);
    });

    it('should generate readable labels', () => {
      const parsed = parseToolSchema(mockGetProductTool);
      
      const productIdField = parsed.inputFields.find(f => f.name === 'productId');
      
      expect(productIdField?.label).toBe('Product Id');
    });
  });

  describe('groupToolsByCategory', () => {
    it('should group tools by category', () => {
      const tools = [mockSearchTool, mockGetProductTool];
      const grouped = groupToolsByCategory(tools);
      
      expect(grouped['Search & Discovery']).toBeDefined();
      expect(grouped['Product Details']).toBeDefined();
      expect(grouped['Search & Discovery'].length).toBe(1);
      expect(grouped['Product Details'].length).toBe(1);
    });
  });
});

describe('ToolExecutor', () => {
  let mockClient: MCPClient;
  let executor: ToolExecutor;

  beforeEach(() => {
    // Create mock MCP client
    mockClient = {
      listTools: jest.fn().mockResolvedValue([mockSearchTool, mockGetProductTool]),
      getTool: jest.fn().mockImplementation((name) => {
        if (name === 'search_products') return Promise.resolve(mockSearchTool);
        if (name === 'get_product') return Promise.resolve(mockGetProductTool);
        return Promise.resolve(null);
      }),
      call: jest.fn().mockResolvedValue([{ id: '1', name: 'Test Product' }]),
      callWithMeta: jest.fn().mockResolvedValue({
        success: true,
        data: [{ id: '1', name: 'Test Product' }],
        executionTime: 100,
      }),
      clearCache: jest.fn(),
    } as unknown as MCPClient;

    executor = new ToolExecutor(mockClient, { logging: false, emitEvents: false });
  });

  describe('execute', () => {
    it('should execute a tool and return result', async () => {
      const result = await executor.execute('search_products', { query: 'test' });
      
      expect(result).toEqual([{ id: '1', name: 'Test Product' }]);
    });

    it('should track execution in history', async () => {
      await executor.execute('search_products', { query: 'test' });
      
      const history = executor.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].tool).toBe('search_products');
      expect(history[0].status).toBe('success');
    });

    it('should handle errors gracefully', async () => {
      (mockClient.callWithMeta as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Tool failed',
        executionTime: 50,
      });

      await expect(executor.execute('search_products', { query: 'test' }))
        .rejects.toThrow('Tool failed');
      
      const history = executor.getHistory();
      expect(history[0].status).toBe('error');
    });
  });

  describe('executeSafe', () => {
    it('should return result without throwing', async () => {
      const result = await executor.executeSafe('search_products', { query: 'test' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ id: '1', name: 'Test Product' }]);
    });

    it('should return error without throwing', async () => {
      (mockClient.callWithMeta as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Tool failed',
        executionTime: 50,
      });

      const result = await executor.executeSafe('search_products', { query: 'test' });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Tool failed');
    });
  });

  describe('getStats', () => {
    it('should return execution statistics', async () => {
      await executor.execute('search_products', { query: 'test1' });
      await executor.execute('search_products', { query: 'test2' });
      await executor.execute('get_product', { productId: '1' });

      const stats = executor.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.success).toBe(3);
      expect(stats.error).toBe(0);
      expect(stats.byTool['search_products'].count).toBe(2);
      expect(stats.byTool['get_product'].count).toBe(1);
    });
  });
});
