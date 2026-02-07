/**
 * Graph Performance Optimization Utilities
 * For handling large networks (10K+ nodes) efficiently
 */

/**
 * Level-of-Detail (LOD) for massive graphs
 * Downsample nodes based on importance when network is too large
 */
export const createLODGraph = (data, maxNodes = 2000) => {
  if (data.nodes.length <= maxNodes) {
    return data;
  }

  // Sort nodes by importance (connection count)
  const sortedNodes = [...data.nodes].sort((a, b) => (b.connections || 0) - (a.connections || 0));

  // Keep top N most connected nodes
  const keptNodes = sortedNodes.slice(0, maxNodes);
  const keptNodeIds = new Set(keptNodes.map(n => n.id));

  // Filter edges to only include edges between kept nodes
  const filteredEdges = data.links.filter(edge =>
    keptNodeIds.has(edge.source.id || edge.source) &&
    keptNodeIds.has(edge.target.id || edge.target)
  );

  return {
    nodes: keptNodes,
    links: filteredEdges,
    metadata: {
      original_node_count: data.nodes.length,
      original_edge_count: data.links.length,
      filtered_node_count: keptNodes.length,
      filtered_edge_count: filteredEdges.length,
      reduction_ratio: (keptNodes.length / data.nodes.length).toFixed(2)
    }
  };
};

/**
 * Cluster nodes by type and connection range for massive graphs
 */
export const clusterLargeGraph = (nodes, edges, threshold = 5000) => {
  if (nodes.length < threshold) return { nodes, edges };

  // Cluster nodes by product type and connection count range
  const clusters = {};
  nodes.forEach(node => {
    const connectionBucket = Math.floor((node.connections || 0) / 10) * 10;
    const key = `${node.type}_${connectionBucket}`;

    if (!clusters[key]) {
      clusters[key] = {
        id: `cluster_${key}`,
        name: `${node.type} (${connectionBucket}+ connections)`,
        type: node.type,
        connections: 0,
        nodeCount: 0,
        nodes: []
      };
    }

    clusters[key].connections += node.connections || 0;
    clusters[key].nodeCount++;
    clusters[key].nodes.push(node);
  });

  // Create cluster nodes
  const clusterNodes = Object.values(clusters).map(cluster => ({
    id: cluster.id,
    name: cluster.name,
    type: cluster.type,
    connections: cluster.connections,
    isCluster: true,
    nodeCount: cluster.nodeCount
  }));

  // Aggregate edges between clusters
  const clusterEdges = [];
  const edgeMap = new Map();

  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === (edge.source.id || edge.source));
    const targetNode = nodes.find(n => n.id === (edge.target.id || edge.target));

    if (!sourceNode || !targetNode) return;

    const sourceCluster = `cluster_${sourceNode.type}_${Math.floor((sourceNode.connections || 0) / 10) * 10}`;
    const targetCluster = `cluster_${targetNode.type}_${Math.floor((targetNode.connections || 0) / 10) * 10}`;

    if (sourceCluster === targetCluster) return; // Skip intra-cluster edges

    const edgeKey = [sourceCluster, targetCluster].sort().join('_');

    if (!edgeMap.has(edgeKey)) {
      edgeMap.set(edgeKey, {
        source: sourceCluster,
        target: targetCluster,
        weight: 0,
        count: 0
      });
    }

    const edgeData = edgeMap.get(edgeKey);
    edgeData.weight += edge.weight || 1;
    edgeData.count++;
  });

  return {
    nodes: clusterNodes,
    links: Array.from(edgeMap.values())
  };
};

/**
 * Debounce function for expensive operations
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Memoize expensive graph calculations
 */
export const memoizeGraphData = (() => {
  const cache = new Map();

  return (key, computeFn) => {
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = computeFn();
    cache.set(key, result);

    // Limit cache size to 10 entries
    if (cache.size > 10) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
})();
