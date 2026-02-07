import { useState } from 'react';
import { X, Database, FileSpreadsheet, Globe, Plug } from 'lucide-react';

const DATA_SOURCE_TYPES = [
  { type: 'csv', name: 'CSV Datei', icon: '📄', description: 'Import aus CSV Dateien' },
  { type: 'excel', name: 'Excel', icon: '📊', description: 'Import aus .xlsx/.xls Dateien' },
  { type: 'bmecat', name: 'BMEcat', icon: '🏭', description: 'B2B Produktkataloge (XML)' },
  { type: 'rest', name: 'REST API', icon: '🌐', description: 'Beliebige REST Schnittstelle' },
  { type: 'mcp', name: 'MCP Server', icon: '🔌', description: 'PostgreSQL, GitHub, Slack...' },
  { type: 'database', name: 'Datenbank', icon: '🗄️', description: 'Direkte DB-Verbindung' },
];

export default function AddDataSourceModal({ onClose, onAdd }) {
  const [step, setStep] = useState('type'); // type, config
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    config: {},
  });

  const handleSelectType = (type) => {
    setSelectedType(type);
    setStep('config');
  };

  const handleSubmit = () => {
    onAdd({
      ...formData,
      type: selectedType.type,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Datenquelle hinzufügen</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {step === 'type' && (
            <div className="grid grid-cols-2 gap-3">
              {DATA_SOURCE_TYPES.map(type => (
                <button
                  key={type.type}
                  onClick={() => handleSelectType(type)}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'config' && selectedType && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{selectedType.icon}</span>
                <div>
                  <div className="font-medium">{selectedType.name}</div>
                  <button onClick={() => setStep('type')} className="text-sm text-blue-500">
                    Typ ändern
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Produkt-Import"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Type-specific fields */}
              {selectedType.type === 'csv' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Dateipfad</label>
                  <input
                    type="text"
                    placeholder="/data/imports/products.csv"
                    className="w-full border rounded-lg px-3 py-2"
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      config: { ...formData.config, path: e.target.value } 
                    })}
                  />
                </div>
              )}

              {selectedType.type === 'rest' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Base URL</label>
                    <input
                      type="text"
                      placeholder="https://api.example.com/v1"
                      className="w-full border rounded-lg px-3 py-2"
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        config: { ...formData.config, baseUrl: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Auth Type</label>
                    <select className="w-full border rounded-lg px-3 py-2">
                      <option value="none">Keine</option>
                      <option value="api-key">API Key</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                    </select>
                  </div>
                </>
              )}

              {selectedType.type === 'mcp' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">MCP Server</label>
                    <select className="w-full border rounded-lg px-3 py-2">
                      <option value="postgres">PostgreSQL</option>
                      <option value="sqlite">SQLite</option>
                      <option value="github">GitHub</option>
                      <option value="slack">Slack</option>
                      <option value="filesystem">Filesystem</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Connection String</label>
                    <input
                      type="text"
                      placeholder="postgresql://user:pass@host:5432/db"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Sync Schedule (optional)</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option value="">Manuell</option>
                  <option value="0 * * * *">Stündlich</option>
                  <option value="0 6 * * *">Täglich (6:00)</option>
                  <option value="0 6 * * 1">Wöchentlich (Mo 6:00)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'config' && (
          <div className="flex justify-end gap-2 p-4 border-t">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Abbrechen
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.name}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Hinzufügen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
