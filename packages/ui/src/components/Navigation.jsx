import { Link, useLocation } from "react-router-dom";
import {
  CubeIcon,
  Square3Stack3DIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  SquaresPlusIcon,
  LinkIcon,
  Squares2X2Icon,
  DocumentChartBarIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { path: "/mindmap", label: "Mind Map", Icon: CubeIcon, featured: true },
  { path: "/command", label: "Command Center", Icon: CubeIcon },
  { path: "/dashboard", label: "Intelligence Hub", Icon: CubeIcon },
  { path: "/global-network", label: "Product Network", Icon: Square3Stack3DIcon, featured: true }, // Hero feature
  { path: "/product-intelligence/7739617395", label: "Citations Graph", Icon: BeakerIcon, featured: true }, // New Citations feature
  { path: "/search", label: "Search", Icon: MagnifyingGlassIcon },
  { path: "/graph", label: "Graph Analysis", Icon: ChartBarIcon },
  { path: "/products", label: "Catalog", Icon: SquaresPlusIcon },
  { path: "/supply-chain", label: "Supply Chain", Icon: LinkIcon },
  { path: "/product-comparison", label: "Compare", Icon: Squares2X2Icon },
  { path: "/catalogs", label: "Categories", Icon: Squares2X2Icon },
  { path: "/stats", label: "Analytics", Icon: DocumentChartBarIcon },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="palantir-header">
      <div className="flex items-center gap-4">
        {/* Palantir-style logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[#374151] border border-[#4B5563] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <span className="palantir-logo">BOSCH INTELLIGENCE PLATFORM</span>
          </div>
        </Link>

        <div className="w-px h-5 bg-palantir-border" />

        {/* Breadcrumb-style nav */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isFeatured = item.featured;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-3 py-1.5 text-xs font-semibold transition-all duration-200 font-mono uppercase
                  ${isActive
                    ? 'bg-[#374151] text-white border border-[#4B5563]'
                    : isFeatured
                      ? 'text-gray-400 border border-[#374151] hover:bg-[#1a1f2e]'
                      : 'text-palantir-text-muted hover:text-palantir-text-primary hover:bg-palantir-bg-tertiary'
                  }
                `}
              >
                <item.Icon className="w-4 h-4 mr-1.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-3 text-xs text-palantir-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-palantir-accent-green rounded-full animate-pulse" />
          <span>SYSTEM ACTIVE</span>
        </div>
        <div className="w-px h-4 bg-palantir-border" />
        <span className="font-mono">{new Date().toISOString().slice(0, 10)}</span>
      </div>
    </nav>
  );
}
