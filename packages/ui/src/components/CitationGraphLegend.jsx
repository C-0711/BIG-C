export default function CitationGraphLegend() {
  const legendItems = [
    { shape: 'star', color: '#FFD700', label: 'Produkt (Zentrum)', symbol: '★' },
    { shape: 'box', color: '#4B5563', label: 'Dokument', symbol: '▭' },
    { shape: 'diamond', color: '#10B981', label: 'Technische Specs', symbol: '◆' },
    { shape: 'triangle', color: '#F59E0B', label: 'Katalog-Daten', symbol: '▲' },
    { shape: 'hexagon', color: '#8B5CF6', label: 'Knowledge Graph', symbol: '⬡' },
    { shape: 'ellipse', color: '#EC4899', label: 'AI-Analyse', symbol: '⬭' },
    { shape: 'square', color: '#6B7280', label: 'Manuelle Eingabe', symbol: '◼' }
  ];

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Datenquellen</div>
      <div className="space-y-2">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <div
              className="w-4 h-4 flex items-center justify-center"
              style={{ color: item.color, fontSize: '14px' }}
            >
              {item.symbol}
            </div>
            <span className="text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Kantenfarben</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500" />
            <span className="text-gray-400">Hohe Konfidenz (&gt;90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#4B5563]" />
            <span className="text-gray-400">Mittel (70-90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-orange-500" />
            <span className="text-gray-400">Niedrig-Mittel (50-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-red-500" />
            <span className="text-gray-400">Niedrig (&lt;50%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
