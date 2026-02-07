export default function CitationDetailPanel({ node }) {
  if (!node || !node.metadata) return null;

  const { metadata } = node;

  if (metadata.type === 'center') {
    // Show product details
    return (
      <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Produkt</div>
        <div className="space-y-2 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Supplier PID</div>
            <div className="text-gray-200 font-mono">{metadata.supplier_pid}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Beschreibung</div>
            <div className="text-gray-200">{node.label}</div>
          </div>
        </div>
      </div>
    );
  }

  if (metadata.type === 'source') {
    // Show citation source details
    return (
      <div className="space-y-4">
        {/* Source Header */}
        <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Datenquelle
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-gray-500 text-xs mb-1">Typ</div>
              <div className="text-gray-200 text-sm font-medium">
                {metadata.source_type?.replace(/_/g, ' ')}
              </div>
            </div>

            {metadata.document_filename && (
              <div>
                <div className="text-gray-500 text-xs mb-1">Dokument</div>
                <div className="text-gray-200 text-sm font-mono break-all">
                  {metadata.document_filename}
                </div>
              </div>
            )}

            <div>
              <div className="text-gray-500 text-xs mb-1">Konfidenz</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#4B5563] transition-all"
                    style={{ width: `${(metadata.confidence || 0) * 100}%` }}
                  />
                </div>
                <span className="text-gray-200 text-sm font-semibold">
                  {((metadata.confidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {metadata.citation_count && (
              <div>
                <div className="text-gray-500 text-xs mb-1">Verwendungen</div>
                <div className="text-gray-200 text-sm">
                  {metadata.citation_count} Felder
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Status */}
        {metadata.validation_status && (
          <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Validierung
            </div>
            <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
              metadata.validation_status === 'validated'
                ? 'bg-green-500/20 text-green-400'
                : metadata.validation_status === 'pending_review'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400'
            }`}>
              {metadata.validation_status || 'unvalidated'}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
