/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Use the same host as the UI to avoid CORS issues
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Use the same hostname as the current page, but port 8766
    return `http://${window.location.hostname}:8766`;
  }
  return 'http://localhost:8766';
};

const API_BASE_URL = import.meta.env.VITE_API_URL || getApiBaseUrl();
const MCP_BASE_URL = import.meta.env.VITE_MCP_URL || 'http://localhost:8765';

// Export dynamic API URL for direct use
export const API_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Product endpoints
  searchProducts: `${API_BASE_URL}/api/products/search`,
  searchSimilar: `${API_BASE_URL}/api/products/similar`,
  getProduct: (id) => `${API_BASE_URL}/api/products/${id}`,
  getProductByPid: (pid) => `${API_BASE_URL}/api/products/pid/${pid}`,
  getRelated: (id) => `${API_BASE_URL}/api/products/${id}/related`,

  // Graph endpoints
  getGraph: `${API_BASE_URL}/api/graph`,
  getProductNetwork: (pid) => `${API_BASE_URL}/api/graph/network/${pid}`,
  getGlobalNetwork: `${API_BASE_URL}/api/graph/global`,

  // Statistics & Analytics
  getStatistics: `${API_BASE_URL}/api/statistics`,
  getCoverageMetrics: `${API_BASE_URL}/api/analytics/coverage`,

  // Classification
  getETIMGroups: `${API_BASE_URL}/api/etim/groups`,
  getECLASSGroups: `${API_BASE_URL}/api/eclass/groups`,
  searchByETIM: (groupId) => `${API_BASE_URL}/api/etim/${groupId}/products`,

  // Media
  getProductMedia: (pid) => `${API_BASE_URL}/api/products/${pid}/media`,
  getProductImages: (pid) => `${API_BASE_URL}/api/products/${pid}/images`,
  getProductDocuments: (pid) => `${API_BASE_URL}/api/products/${pid}/documents`,

  // Custom queries
  executeSQL: `${API_BASE_URL}/api/query/sql`,
  executeCypher: `${API_BASE_URL}/api/query/cypher`,
};

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Fetch wrapper with error handling and timeout
 */
export async function apiFetch(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

/**
 * API helper functions
 */
export const api = {
  // Search products
  searchProducts: async (query, options = {}) => {
    const { limit = 20, offset = 0, filters = {} } = options;
    return apiFetch(API_ENDPOINTS.searchProducts, {
      method: 'POST',
      body: JSON.stringify({ query, limit, offset, filters }),
    });
  },

  // Search similar products (semantic)
  searchSimilar: async (query, options = {}) => {
    const { threshold = 0.7, limit = 10 } = options;
    return apiFetch(API_ENDPOINTS.searchSimilar, {
      method: 'POST',
      body: JSON.stringify({ query, threshold, limit }),
    });
  },

  // Get single product
  getProduct: async (identifier) => {
    // Try as ID first, then as supplier_pid
    const isNumeric = /^\d+$/.test(identifier);
    const url = isNumeric
      ? API_ENDPOINTS.getProduct(identifier)
      : API_ENDPOINTS.getProductByPid(identifier);
    return apiFetch(url);
  },

  // Get related products
  getRelated: async (productId, relationshipType = null) => {
    const url = API_ENDPOINTS.getRelated(productId);
    const params = relationshipType ? `?type=${relationshipType}` : '';
    return apiFetch(url + params);
  },

  // Get product network for graph visualization
  getProductNetwork: async (supplierPid, options = {}) => {
    const { limit = 50, depth = 1, relationshipTypes = [] } = options;
    return apiFetch(API_ENDPOINTS.getProductNetwork(supplierPid), {
      method: 'POST',
      body: JSON.stringify({ limit, depth, relationshipTypes }),
    });
  },

  // Get global network
  getGlobalNetwork: async (options = {}) => {
    const {
      limit = 500,
      minConnections = 10,
      entityType = 'all',
      productType = null,
      etimGroup = null
    } = options;
    return apiFetch(API_ENDPOINTS.getGlobalNetwork, {
      method: 'POST',
      body: JSON.stringify({
        limit,
        min_connections: minConnections,
        entity_type: entityType,
        product_type: productType,
        etim_group: etimGroup
      }),
    });
  },

  // Get statistics
  getStatistics: async () => {
    return apiFetch(API_ENDPOINTS.getStatistics);
  },

  // Get ETIM groups
  getETIMGroups: async (limit = 50) => {
    return apiFetch(`${API_ENDPOINTS.getETIMGroups}?limit=${limit}`);
  },

  // Execute custom SQL
  executeSQL: async (query, limit = 100) => {
    return apiFetch(API_ENDPOINTS.executeSQL, {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });
  },

  // Execute Cypher query
  executeCypher: async (query) => {
    return apiFetch(API_ENDPOINTS.executeCypher, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
};

export default api;
