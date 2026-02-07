import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * SupplyChainFlow Component
 * Visualizes supply chain and product relationships as a flow diagram
 */
export default function SupplyChainFlow({ centerProduct, relationships, depth = 2 }) {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (centerProduct && relationships && svgRef.current) {
      renderFlow();
    }
  }, [centerProduct, relationships, depth]);

  const renderFlow = () => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    // Enable zoom/pan
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Build hierarchical data structure
    const root = {
      id: centerProduct.id,
      name: centerProduct.description_short || centerProduct.supplier_pid,
      type: 'center',
      children: []
    };

    // Group relationships by type
    const relationshipGroups = {};
    relationships.forEach(rel => {
      const type = rel.relationship_type || 'related';
      if (!relationshipGroups[type]) {
        relationshipGroups[type] = [];
      }
      relationshipGroups[type].push(rel);
    });

    // Build tree structure
    Object.entries(relationshipGroups).forEach(([type, rels]) => {
      root.children.push({
        id: `${type}-group`,
        name: type.replace('_', ' ').toUpperCase(),
        type: 'group',
        children: rels.slice(0, 10).map(rel => ({
          id: rel.id,
          name: rel.description_short || rel.supplier_pid,
          type: 'product',
          data: rel
        }))
      });
    });

    // Create tree layout
    const treeLayout = d3.tree()
      .size([height - 100, width - 200]);

    const hierarchy = d3.hierarchy(root);
    const treeData = treeLayout(hierarchy);

    // Draw links
    const links = g.selectAll('.link')
      .data(treeData.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y + 100)
        .y(d => d.x + 50))
      .attr('fill', 'none')
      .attr('stroke', '#9CA3AF')
      .attr('stroke-width', 2)
      .attr('opacity', 0.3);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y + 100},${d.x + 50})`);

    // Node circles
    nodes.append('circle')
      .attr('r', d => d.data.type === 'center' ? 12 : d.data.type === 'group' ? 8 : 6)
      .attr('fill', d => {
        if (d.data.type === 'center') return '#EF4444';
        if (d.data.type === 'group') return '#F59E0B';
        return '#4B5563';
      })
      .attr('stroke', '#1a1f2e')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d.data);
      })
      .on('mouseover', function() {
        d3.select(this)
          .attr('stroke', '#9CA3AF')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#1a1f2e')
          .attr('stroke-width', 2);
      });

    // Node labels
    nodes.append('text')
      .attr('dy', 4)
      .attr('x', d => d.data.type === 'center' ? 20 : 15)
      .text(d => d.data.name.substring(0, 30))
      .attr('font-size', d => d.data.type === 'center' ? 14 : 12)
      .attr('fill', '#E4E7EB')
      .style('pointer-events', 'none');

    // Center view on root
    const rootNode = treeData;
    const initialTransform = d3.zoomIdentity
      .translate(50, height / 2 - rootNode.x)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full bg-gray-800 rounded-lg border border-gray-700"
        style={{ height: '500px' }}
      />

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-gray-900/95 border border-gray-700 rounded-lg p-4 max-w-xs backdrop-blur-sm">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-white font-semibold text-sm">Selected Node</h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <p className="text-white font-medium">{selectedNode.name}</p>
            </div>
            <div>
              <span className="text-gray-400">Type:</span>
              <p className="text-white capitalize">{selectedNode.type?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Center Product</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Relationship Group</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4B5563]"></div>
          <span>Related Product</span>
        </div>
      </div>
    </div>
  );
}
