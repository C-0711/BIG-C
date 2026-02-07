export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Cmd/Ctrl + K', action: 'Open search' },
    { key: 'Cmd/Ctrl + G', action: 'Go to Product Network' },
    { key: '+', action: 'Zoom in' },
    { key: '-', action: 'Zoom out' },
    { key: 'F', action: 'Fit graph to view' },
    { key: 'E', action: 'Export menu' },
    { key: 'R', action: 'Refresh data' },
    { key: 'Escape', action: 'Clear selection / Close modal' },
    { key: '?', action: 'Show this help' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="palantir-entity-card max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="palantir-section-title">KEYBOARD SHORTCUTS</div>
          <button
            onClick={onClose}
            className="text-palantir-text-muted hover:text-palantir-text-primary text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-palantir-border last:border-0"
            >
              <span className="text-palantir-text-secondary text-sm">{s.action}</span>
              <kbd className="px-2 py-1 bg-palantir-bg-tertiary border border-palantir-border rounded text-xs font-mono text-palantir-text-primary">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-palantir-border">
          <button onClick={onClose} className="palantir-btn palantir-btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
