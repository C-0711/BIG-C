import { useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings, User } from 'lucide-react';
import { useIntelligenceConfig } from '../hooks/useConfig';

// Context for sidebar state
const SidebarContext = createContext({ expanded: true, setExpanded: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

// Icon mapping
const ICONS = {
  '🤖': '🤖', '📊': '📊', '✨': '✨', '📚': '📚', '⚡': '⚡', '📁': '📁',
  '🔌': '🔌', '📤': '📤', '🖼️': '🖼️', '📋': '📋', '📣': '📣', '📦': '📦',
  '📈': '📈', '🧠': '🧠', '⚙️': '⚙️',
};

function NavItem({ item, expanded }) {
  const location = useLocation();
  const isActive = item.path === '/' 
    ? location.pathname === '/' 
    : location.pathname.startsWith(item.path);

  return (
    <Link
      to={item.path}
      className={`
        flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all
        ${isActive 
          ? 'bg-green-500/20 text-green-400 font-medium' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }
      `}
      title={!expanded ? item.label : undefined}
    >
      <span className="text-lg flex-shrink-0">{item.icon}</span>
      {expanded && (
        <span className="truncate text-sm">{item.label}</span>
      )}
    </Link>
  );
}

function NavGroup({ title, items, expanded }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-4">
      {expanded && title && (
        <div className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="space-y-0.5">
        {items.map(item => (
          <NavItem key={item.id} item={item} expanded={expanded} />
        ))}
      </div>
    </div>
  );
}

export function DynamicSidebar() {
  const [expanded, setExpanded] = useState(true);
  const { config, connected, getInstance, getBranding, getNavigation } = useIntelligenceConfig();
  
  const instance = getInstance();
  const branding = getBranding();
  const nav = getNavigation();

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      <aside 
        className={`
          flex flex-col bg-[#0f0f0f] border-r border-white/10
          transition-all duration-200 ease-in-out
          ${expanded ? 'w-60' : 'w-16'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          {instance.logo ? (
            <img src={instance.logo} alt="Logo" className="w-8 h-8 rounded" />
          ) : (
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
              style={{ background: branding.primaryColor || '#22c55e' }}
            >
              {instance.name?.charAt(0) || '0'}
            </div>
          )}
          {expanded && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm truncate">
                {instance.name || '0711-C Intelligence'}
              </div>
              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                {connected ? 'Connected' : 'Offline'}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <NavGroup items={nav.main} expanded={expanded} />
          <NavGroup title="Core" items={nav.core} expanded={expanded} />
          <NavGroup title="Data" items={nav.data} expanded={expanded} />
          <NavGroup title="Business" items={nav.business} expanded={expanded} />
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-2">
          <NavItem 
            item={{ id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' }} 
            expanded={expanded} 
          />
          
          {/* Collapse Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            {expanded && <span className="text-xs">Collapse</span>}
          </button>
        </div>

        {/* Admin Link */}
        {expanded && (
          <a
            href="/admin"
            className="m-2 mb-4 px-3 py-2 text-xs text-center text-gray-500 hover:text-gray-400 bg-white/5 rounded-lg transition-colors"
          >
            ⚙️ Admin Dashboard
          </a>
        )}
      </aside>
    </SidebarContext.Provider>
  );
}

export default DynamicSidebar;
