import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';

/**
 * useGraphData Hook
 * Fetches and manages graph network data
 */
export function useGraphData(options = {}) {
  const {
    autoLoad = false,
    limit = 500,
    minConnections = 10,
    entityType = 'all',
    productType = null,
    etimGroup = null,
  } = options;

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const loadGraph = useCallback(async (customOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getGlobalNetwork({
        limit,
        minConnections,
        entityType,
        productType,
        etimGroup,
        ...customOptions,
      });

      // Transform data for visualization
      const nodes = (result.nodes || []).map(node => ({
        id: node.id,
        name: node.name || node.label,
        type: node.type || 'product',
        connections: node.connections || 0,
        ...node,
      }));

      const links = (result.edges || result.links || []).map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type || edge.relationship_type,
        weight: edge.weight || 1,
        ...edge,
      }));

      setGraphData({ nodes, links });
      setStats(result.stats || null);
    } catch (err) {
      setError(err);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  }, [limit, minConnections, entityType, productType, etimGroup]);

  useEffect(() => {
    if (autoLoad) {
      loadGraph();
    }
  }, [autoLoad, loadGraph]);

  const refresh = useCallback(() => {
    loadGraph();
  }, [loadGraph]);

  return {
    graphData,
    loading,
    error,
    stats,
    loadGraph,
    refresh,
  };
}

/**
 * useProductNetwork Hook
 * Fetches network centered on a specific product
 */
export function useProductNetwork(supplierPid, options = {}) {
  const {
    autoLoad = true,
    limit = 50,
    depth = 1,
    relationshipTypes = [],
  } = options;

  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [centerProduct, setCenterProduct] = useState(null);

  const loadNetwork = useCallback(async (pid = supplierPid, customOptions = {}) => {
    if (!pid) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.getProductNetwork(pid, {
        limit,
        depth,
        relationshipTypes,
        ...customOptions,
      });

      setNetworkData({
        nodes: result.nodes || [],
        edges: result.edges || [],
      });
      setCenterProduct(result.center_product || null);
    } catch (err) {
      setError(err);
      setNetworkData({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  }, [supplierPid, limit, depth, relationshipTypes]);

  useEffect(() => {
    if (autoLoad && supplierPid) {
      loadNetwork();
    }
  }, [autoLoad, supplierPid, loadNetwork]);

  return {
    networkData,
    loading,
    error,
    centerProduct,
    loadNetwork,
    refresh: () => loadNetwork(supplierPid),
  };
}

/**
 * useGraphStats Hook
 * Fetches graph statistics and metrics
 */
export function useGraphStats(autoLoad = true) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getStatistics();
      setStats(result);
    } catch (err) {
      setError(err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadStats();
    }
  }, [autoLoad, loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats,
    refresh: loadStats,
  };
}
