import { Link } from "react-router-dom";

export default function GraphPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-[#e0e0e0] mb-1">Graph Analysis</h1>
          <p className="text-sm text-[#94a3b8]">Explore product relationships and network patterns</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Link to="/global-network" className="p-6 bg-[#ffffff] border border-[#e2e8f0] rounded-lg hover:border-[#0066cc] transition-all group">
            <div className="text-4xl mb-4 opacity-60 group-hover:opacity-100">◈</div>
            <div className="text-lg font-medium text-[#1a2b3c] group-hover:text-[#0066cc] mb-2">Global Network</div>
            <p className="text-sm text-[#94a3b8]">Full network visualization with all products and relationships</p>
          </Link>

          <Link to="/mindmap" className="p-6 bg-[#ffffff] border border-[#e2e8f0] rounded-lg hover:border-[#0066cc] transition-all group">
            <div className="text-4xl mb-4 opacity-60 group-hover:opacity-100">◇</div>
            <div className="text-lg font-medium text-[#1a2b3c] group-hover:text-[#0066cc] mb-2">Mind Map</div>
            <p className="text-sm text-[#94a3b8]">Hierarchical exploration starting from a product</p>
          </Link>

          <Link to="/command" className="p-6 bg-[#ffffff] border border-[#e2e8f0] rounded-lg hover:border-[#0066cc] transition-all group">
            <div className="text-4xl mb-4 opacity-60 group-hover:opacity-100">⌘</div>
            <div className="text-lg font-medium text-[#1a2b3c] group-hover:text-[#0066cc] mb-2">Command Center</div>
            <p className="text-sm text-[#94a3b8]">Unified workspace with search, graph, and details</p>
          </Link>

          <Link to="/supply-chain" className="p-6 bg-[#ffffff] border border-[#e2e8f0] rounded-lg hover:border-[#0066cc] transition-all group">
            <div className="text-4xl mb-4 opacity-60 group-hover:opacity-100">🔗</div>
            <div className="text-lg font-medium text-[#1a2b3c] group-hover:text-[#0066cc] mb-2">Supply Chain</div>
            <p className="text-sm text-[#94a3b8]">Product dependencies and flow analysis</p>
          </Link>
        </div>

        <div className="mt-8 bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-5">
          <h3 className="text-sm font-medium text-[#475569] mb-4">Network Statistics</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { l: "Total Nodes", v: "23,141" },
              { l: "Total Edges", v: "267M" },
              { l: "Avg. Degree", v: "11,574" },
              { l: "Density", v: "0.23" },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-mono text-[#0066cc]">{s.v}</div>
                <div className="text-xs text-[#94a3b8]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
