/**
 * Export Utilities
 * Functions for exporting data in various formats (JSON, CSV, PNG)
 */

/**
 * Export graph data as JSON
 */
export function exportGraphAsJSON(nodes, edges, filename = 'graph-export.json') {
  const data = {
    metadata: {
      exported_at: new Date().toISOString(),
      total_nodes: nodes.length,
      total_edges: edges.length,
      version: '1.0',
    },
    nodes: nodes.map(node => ({
      id: node.id,
      label: node.name || node.label,
      type: node.type,
      properties: {
        connections: node.connections,
        ...node,
      },
    })),
    edges: edges.map(edge => ({
      source: edge.source?.id || edge.source,
      target: edge.target?.id || edge.target,
      type: edge.type,
      weight: edge.weight || 1,
    })),
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    filename,
    'application/json'
  );
}

/**
 * Export graph data as CSV (two files: nodes and edges)
 */
export function exportGraphAsCSV(nodes, edges, baseFilename = 'graph-export') {
  // Export nodes
  const nodeHeaders = ['id', 'label', 'type', 'connections'];
  const nodeRows = nodes.map(node => [
    node.id,
    escapeCSV(node.name || node.label || ''),
    node.type || '',
    node.connections || 0,
  ]);

  const nodeCSV = [
    nodeHeaders.join(','),
    ...nodeRows.map(row => row.join(',')),
  ].join('\n');

  downloadFile(nodeCSV, `${baseFilename}-nodes.csv`, 'text/csv');

  // Export edges
  const edgeHeaders = ['source', 'target', 'type', 'weight'];
  const edgeRows = edges.map(edge => [
    edge.source?.id || edge.source,
    edge.target?.id || edge.target,
    edge.type || '',
    edge.weight || 1,
  ]);

  const edgeCSV = [
    edgeHeaders.join(','),
    ...edgeRows.map(row => row.join(',')),
  ].join('\n');

  downloadFile(edgeCSV, `${baseFilename}-edges.csv`, 'text/csv');
}

/**
 * Export SVG element as PNG image
 */
export async function exportSVGAsPNG(svgElement, filename = 'graph-export.png', scale = 2) {
  if (!svgElement) {
    throw new Error('SVG element not found');
  }

  // Get SVG dimensions
  const bbox = svgElement.getBoundingClientRect();
  const width = bbox.width * scale;
  const height = bbox.height * scale;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, width, height);

  // Convert SVG to data URL
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  // Load image and draw to canvas
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(svgUrl);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, filename);
          resolve();
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Failed to load SVG image'));
    };
    img.src = svgUrl;
  });
}

/**
 * Export products as CSV
 */
export function exportProductsAsCSV(products, filename = 'products-export.csv') {
  const headers = [
    'supplier_pid',
    'manufacturer_name',
    'description_short',
    'product_type',
    'product_status',
  ];

  const rows = products.map(product => [
    product.supplier_pid || '',
    escapeCSV(product.manufacturer_name || ''),
    escapeCSV(product.description_short || ''),
    product.product_type || '',
    product.product_status || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export products as JSON
 */
export function exportProductsAsJSON(products, filename = 'products-export.json') {
  const data = {
    metadata: {
      exported_at: new Date().toISOString(),
      total_products: products.length,
      version: '1.0',
    },
    products,
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    filename,
    'application/json'
  );
}

/**
 * Export comparison data as CSV
 */
export function exportComparisonAsCSV(products, filename = 'comparison-export.csv') {
  if (products.length === 0) return;

  // Get all unique feature names
  const allFeatures = new Set();
  products.forEach(product => {
    if (product.features) {
      product.features.forEach(f => allFeatures.add(f.name));
    }
  });

  const headers = ['Feature', ...products.map(p => p.supplier_pid || p.id)];
  const featureRows = Array.from(allFeatures).map(feature => {
    const row = [feature];
    products.forEach(product => {
      const feat = product.features?.find(f => f.name === feature);
      row.push(feat ? feat.value : '');
    });
    return row;
  });

  const csv = [
    headers.join(','),
    ...featureRows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
}

/**
 * Helper: Escape CSV value
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Helper: Download file
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Helper: Download blob
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(data, format = 'json') {
  let text;

  if (format === 'json') {
    text = JSON.stringify(data, null, 2);
  } else if (format === 'csv') {
    // Simple CSV conversion for clipboard
    text = data.map(row => row.join(',')).join('\n');
  } else {
    text = String(data);
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
