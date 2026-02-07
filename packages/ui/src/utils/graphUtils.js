/**
 * Graph Utilities
 * Helper functions for graph analysis and manipulation
 */

/**
 * Calculate node centrality (importance in network)
 */
export function calculateCentrality(nodes, edges) {
  const centrality = {};

  // Initialize all nodes with 0
  nodes.forEach(node => {
    centrality[node.id] = 0;
  });

  // Count connections (degree centrality)
  edges.forEach(edge => {
    const sourceId = edge.source?.id || edge.source;
    const targetId = edge.target?.id || edge.target;

    if (centrality[sourceId] !== undefined) centrality[sourceId]++;
    if (centrality[targetId] !== undefined) centrality[targetId]++;
  });

  return centrality;
}

/**
 * Detect clusters/communities in graph
 */
export function detectClusters(nodes, edges, threshold = 0.5) {
  const clusters = {};
  const visited = new Set();

  // Simple clustering based on connection density
  nodes.forEach(node => {
    if (visited.has(node.id)) return;

    const cluster = [node.id];
    visited.add(node.id);

    // Find connected nodes
    const queue = [node.id];
    while (queue.length > 0) {
      const currentId = queue.shift();
      const connected = edges
        .filter(e => {
          const sourceId = e.source?.id || e.source;
          const targetId = e.target?.id || e.target;
          return sourceId === currentId || targetId === currentId;
        })
        .map(e => {
          const sourceId = e.source?.id || e.source;
          const targetId = e.target?.id || e.target;
          return sourceId === currentId ? targetId : sourceId;
        });

      connected.forEach(connectedId => {
        if (!visited.has(connectedId) && (e.weight || 1) >= threshold) {
          visited.add(connectedId);
          cluster.push(connectedId);
          queue.push(connectedId);
        }
      });
    }

    if (cluster.length > 0) {
      clusters[`cluster_${Object.keys(clusters).length + 1}`] = cluster;
    }
  });

  return clusters;
}

/**
 * Find shortest path between two nodes
 */
export function findShortestPath(nodes, edges, startId, endId) {
  const adjacency = {};

  // Build adjacency list
  nodes.forEach(node => {
    adjacency[node.id] = [];
  });

  edges.forEach(edge => {
    const sourceId = edge.source?.id || edge.source;
    const targetId = edge.target?.id || edge.target;

    if (adjacency[sourceId]) adjacency[sourceId].push(targetId);
    if (adjacency[targetId]) adjacency[targetId].push(sourceId);
  });

  // BFS to find shortest path
  const queue = [[startId]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === endId) {
      return path;
    }

    const neighbors = adjacency[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null; // No path found
}

/**
 * Get graph statistics
 */
export function getGraphStats(nodes, edges) {
  const centrality = calculateCentrality(nodes, edges);

  // Find most connected node
  const maxCentrality = Math.max(...Object.values(centrality));
  const hubNode = nodes.find(n => centrality[n.id] === maxCentrality);

  // Calculate average degree
  const avgDegree = Object.values(centrality).reduce((a, b) => a + b, 0) / nodes.length;

  // Count isolated nodes (no connections)
  const isolatedNodes = nodes.filter(n => centrality[n.id] === 0).length;

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    density: (2 * edges.length) / (nodes.length * (nodes.length - 1)),
    avgDegree: avgDegree.toFixed(2),
    maxDegree: maxCentrality,
    hubNode: hubNode?.name || hubNode?.id,
    isolatedNodes,
  };
}

/**
 * Filter nodes by search text
 */
export function filterNodesByText(nodes, searchText) {
  if (!searchText) return nodes;

  const search = searchText.toLowerCase();
  return nodes.filter(node => {
    const name = (node.name || '').toLowerCase();
    const id = String(node.id || '').toLowerCase();
    const pid = (node.supplier_pid || '').toLowerCase();

    return name.includes(search) || id.includes(search) || pid.includes(search);
  });
}

/**
 * Filter edges by strength/weight
 */
export function filterEdgesByStrength(edges, minStrength) {
  if (minStrength === 0) return edges;

  return edges.filter(edge => {
    const weight = edge.weight || 1;
    return weight * 100 >= minStrength;
  });
}

/**
 * Export graph in Gephi format
 */
export function exportAsGephi(nodes, edges, filename = 'graph-gephi.gexf') {
  const gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
  <meta lastmodifieddate="${new Date().toISOString()}">
    <creator>Bosch Intelligence UI</creator>
    <description>Product relationship graph</description>
  </meta>
  <graph mode="static" defaultedgetype="directed">
    <nodes>
      ${nodes.map(node => `
      <node id="${node.id}" label="${escapeXML(node.name || node.label || '')}">
        <attvalues>
          <attvalue for="type" value="${escapeXML(node.type || '')}"/>
          <attvalue for="connections" value="${node.connections || 0}"/>
        </attvalues>
      </node>`).join('')}
    </nodes>
    <edges>
      ${edges.map((edge, i) => `
      <edge id="${i}" source="${edge.source?.id || edge.source}" target="${edge.target?.id || edge.target}" weight="${edge.weight || 1}">
        <attvalues>
          <attvalue for="type" value="${escapeXML(edge.type || '')}"/>
        </attvalues>
      </edge>`).join('')}
    </edges>
  </graph>
</gexf>`;

  const blob = new Blob([gexf], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
