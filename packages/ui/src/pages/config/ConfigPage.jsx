import { useState } from 'react';
import { useIntelligenceConfig } from '../../hooks/useConfig';
import { 
  Database, Send, Bot, GitBranch, Settings2, Loader2,
  Plus, Trash2, Power, Edit, ChevronRight, AlertCircle
} from 'lucide-react';

const TABS = [
  { id: 'data-sources', label: 'Datenquellen', icon: Database },
  { id: 'outputs', label: 'Ausgaben', icon: Send },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'instance', label: 'Instanz', icon: Settings2 },
];

const TYPE_ICONS = {
  csv: '📄', excel: '📊', bmecat: '🏭', rest: '🌐', mcp: '🔌', database: '🗄️',
  slack: '💬', telegram: '✈️', whatsapp: '📱', email: '✉️',
  webhook: '🔗', 'csv-export': '📤', 'api-push': '🚀', ftp: '📁',
};

export default function ConfigPage() {
  const { config, loading, error, addItem, updateItem, deleteItem, toggleEnabled } = useIntelligenceConfig();
  const [activeTab, setActiveTab] = useState('data-sources');
  const [showAddModal, setShowAddModal] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <span>Fehler: {error}</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Konfiguration</h1>
          <p className="text-gray-500">Datenquellen, Ausgaben und Agents verwalten</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {config?.[tab.id === 'instance' ? 'instance' : tab.id.replace('-', '')]?.length > 0 && (
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {config[tab.id === 'instance' ? 'instance' : tab.id === 'data-sources' ? 'dataSources' : tab.id]?.length || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border">
        {activeTab === 'data-sources' && (
          <ConfigList
            title="Datenquellen"
            description="Verbinde externe Datenquellen"
            items={config?.dataSources || []}
            section="data-sources"
            onAdd={() => setShowAddModal('data-sources')}
            onToggle={(id, enabled) => toggleEnabled('data-sources', id, enabled)}
            onDelete={(id) => deleteItem('data-sources', id)}
            typeIcons={TYPE_ICONS}
          />
        )}
        
        {activeTab === 'outputs' && (
          <ConfigList
            title="Ausgaben"
            description="Definiere Ausgabekanäle für Benachrichtigungen und Exporte"
            items={config?.outputs || []}
            section="outputs"
            onAdd={() => setShowAddModal('outputs')}
            onToggle={(id, enabled) => toggleEnabled('outputs', id, enabled)}
            onDelete={(id) => deleteItem('outputs', id)}
            typeIcons={TYPE_ICONS}
            showTriggers
          />
        )}
        
        {activeTab === 'agents' && (
          <ConfigList
            title="Agents"
            description="AI Agents mit spezifischen Fähigkeiten"
            items={config?.agents || []}
            section="agents"
            onAdd={() => setShowAddModal('agents')}
            onToggle={(id, enabled) => toggleEnabled('agents', id, enabled)}
            onDelete={(id) => deleteItem('agents', id)}
            showSkills
          />
        )}
        
        {activeTab === 'workflows' && (
          <ConfigList
            title="Workflows"
            description="Automatisierte Abläufe und Pipelines"
            items={config?.workflows || []}
            section="workflows"
            onAdd={() => setShowAddModal('workflows')}
            onToggle={(id, enabled) => toggleEnabled('workflows', id, enabled)}
            onDelete={(id) => deleteItem('workflows', id)}
          />
        )}
        
        {activeTab === 'instance' && (
          <InstanceSettings config={config?.instance} />
        )}
      </div>
    </div>
  );
}

function ConfigList({ title, description, items, section, onAdd, onToggle, onDelete, typeIcons, showTriggers, showSkills }) {
  return (
    <div className="divide-y">
      <div className="p-4 flex justify-between items-center">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <Plus size={18} />
          Hinzufügen
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Noch keine {title} konfiguriert</p>
          <button onClick={onAdd} className="text-blue-500 hover:underline mt-2">
            Erste {title.slice(0, -1)} hinzufügen
          </button>
        </div>
      ) : (
        items.map(item => (
          <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
            {/* Icon */}
            <div className="text-2xl w-10 text-center">
              {typeIcons?.[item.type] || '⚙️'}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {item.type || item.model || 'custom'}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
              {showTriggers && item.triggers?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {item.triggers.map(t => (
                    <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {showSkills && item.skills?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {item.skills.map(s => (
                    <span key={s} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggle(item.id, !item.enabled)}
                className={`p-2 rounded-lg ${item.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                title={item.enabled ? 'Aktiv' : 'Inaktiv'}
              >
                <Power size={18} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg" title="Bearbeiten">
                <Edit size={18} className="text-gray-500" />
              </button>
              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                title="Löschen"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function InstanceSettings({ config }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input 
          type="text" 
          value={config?.name || ''} 
          className="w-full border rounded-lg px-3 py-2"
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Primärfarbe</label>
        <div className="flex gap-2">
          <input 
            type="color" 
            value={config?.primaryColor || '#3B82F6'} 
            className="w-12 h-10 rounded border cursor-pointer"
          />
          <input 
            type="text" 
            value={config?.primaryColor || '#3B82F6'} 
            className="border rounded-lg px-3 py-2"
            readOnly
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sprache</label>
        <select className="w-full border rounded-lg px-3 py-2" value={config?.language || 'de'}>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}
