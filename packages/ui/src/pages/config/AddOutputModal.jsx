import { useState } from 'react';
import { X } from 'lucide-react';

const OUTPUT_TYPES = [
  { type: 'slack', name: 'Slack', icon: '💬', description: 'Slack Workspace Nachrichten' },
  { type: 'telegram', name: 'Telegram', icon: '✈️', description: 'Telegram Bot Nachrichten' },
  { type: 'whatsapp', name: 'WhatsApp', icon: '📱', description: 'WhatsApp via OpenClaw' },
  { type: 'email', name: 'E-Mail', icon: '✉️', description: 'SMTP E-Mail Versand' },
  { type: 'webhook', name: 'Webhook', icon: '🔗', description: 'HTTP POST Callback' },
  { type: 'csv-export', name: 'CSV Export', icon: '📤', description: 'Datei-Export' },
  { type: 'api-push', name: 'API Push', icon: '🚀', description: 'REST API Update' },
  { type: 'ftp', name: 'FTP Upload', icon: '📁', description: 'FTP/SFTP Transfer' },
];

const TRIGGER_OPTIONS = [
  'import-complete',
  'quality-alert',
  'workflow-error',
  'daily-report',
  'product-update',
  'price-change',
  'critical-alert',
];

export default function AddOutputModal({ onClose, onAdd }) {
  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    config: {},
    triggers: [],
  });

  const handleSubmit = () => {
    onAdd({
      ...formData,
      type: selectedType.type,
    });
    onClose();
  };

  const toggleTrigger = (trigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Ausgabe hinzufügen</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {step === 'type' && (
            <div className="grid grid-cols-2 gap-3">
              {OUTPUT_TYPES.map(type => (
                <button
                  key={type.type}
                  onClick={() => { setSelectedType(type); setStep('config'); }}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left"
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
                  <button onClick={() => setStep('type')} className="text-sm text-blue-500">ändern</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Team Benachrichtigungen"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {selectedType.type === 'slack' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Webhook URL</label>
                  <input type="text" placeholder="https://hooks.slack.com/..." className="w-full border rounded-lg px-3 py-2" />
                </div>
              )}

              {selectedType.type === 'telegram' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bot Token</label>
                    <input type="text" placeholder="123456:ABC-DEF..." className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Chat ID</label>
                    <input type="text" placeholder="-100123456789" className="w-full border rounded-lg px-3 py-2" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Trigger Events</label>
                <div className="flex flex-wrap gap-2">
                  {TRIGGER_OPTIONS.map(trigger => (
                    <button
                      key={trigger}
                      onClick={() => toggleTrigger(trigger)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.triggers.includes(trigger)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {step === 'config' && (
          <div className="flex justify-end gap-2 p-4 border-t">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Abbrechen</button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.name}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              Hinzufügen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
