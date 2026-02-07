import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV = [
  { id: "marketing", icon: "M", label: "Marketing", path: "/marketing" },
  { id: "product", icon: "P", label: "Product", path: "/product" },
  { id: "analytics", icon: "A", label: "Analytics", path: "/analytics" },
  { id: "intelligence", icon: "I", label: "Intelligence", path: "/intelligence" },
  { id: "research", icon: "R", label: "Research", path: "/research" },
  { id: "service", icon: "S", label: "Service", path: "/service" },
];

export default function Sidebar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  const isActive = (s) => {
    const p = location.pathname;
    if (s.id === "product") return p.includes("product") || p.includes("catalog") || p.includes("comparison");
    if (s.id === "analytics") return p.includes("analytics") || p.includes("stats") || p.includes("supply");
    if (s.id === "intelligence") return p.includes("intelligence") || p.includes("network") || p.includes("graph") || p.includes("mind");
    if (s.id === "research") return p.includes("research") || p.includes("search") || p.includes("command");
    return p.includes(s.id);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-14 bg-[#363a42] border-r border-[#484e58] flex flex-col items-center py-4 z-50">
      <Link to="/dashboard" className="w-9 h-9 bg-[#3a3f48] border border-[#4e545e] rounded flex items-center justify-center mb-6 hover:border-[#b08050] transition-colors">
        <span className="text-[#999] font-bold text-sm">B</span>
      </Link>

      <nav className="flex flex-col items-center gap-1">
        {NAV.map((s) => {
          const active = isActive(s);
          return (
            <div key={s.id} className="relative">
              <Link
                to={s.path}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                className={`w-9 h-9 rounded flex items-center justify-center text-xs font-medium transition-all
                  ${active ? "bg-[#484e58] text-[#b08050] border border-[#565c66]" : "text-[#666] hover:text-[#999] hover:bg-[#3e434c]"}`}
              >
                {s.icon}
              </Link>
              {hovered === s.id && (
                <div className="absolute left-12 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#484e58] border border-[#565c66] rounded text-xs text-[#ccc] whitespace-nowrap z-50">{s.label}</div>
              )}
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#b08050] rounded-r" />}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto w-9 h-9 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#7a9060]" />
      </div>
    </aside>
  );
}
