import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Network } from 'vis-network/standalone';
import { toast } from 'react-hot-toast';
import DocumentEvidence from '../components/DocumentEvidence';
import Navigation from '../components/Navigation';

const API = 'http://localhost:8766';

const TrumpEpsteinAnalysis = () => {
  const [networkData, setNetworkData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [nodeDocuments, setNodeDocuments] = useState(null);
  const [govConnections, setGovConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [viewMode, setViewMode] = useState('profile');
  const [newsArticles, setNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [filters, setFilters] = useState({
    showGovernment: true,
    showBusiness: true,
    showDeceased: true,
    showConvicted: true,
  });
  const [networkInstance, setNetworkInstance] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadNetworkData();
    loadGovernmentConnections();
  }, []);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/graph/trump-epstein-network?limit_per_person=30`);
      setNetworkData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGovernmentConnections = async () => {
    try {
      const res = await fetch(`${API}/api/graph/current-government-connections`);
      setGovConnections(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const loadEvidence = async (p1, p2) => {
    try {
      setLoadingDocuments(true);
      const res = await fetch(`${API}/api/graph/relationship-evidence?person1=${encodeURIComponent(p1)}&person2=${encodeURIComponent(p2)}&limit=50`);
      setEvidence(await res.json());
      setViewMode('documents');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadNodeDocuments = async (name) => {
    try {
      setLoadingDocuments(true);
      const searchRes = await fetch(`${API}/api/entities/search?q=${encodeURIComponent(name)}&limit=1`);
      const searchData = await searchRes.json();
      if (!searchData?.length) {
        setNodeDocuments({ person: name, documents: [], total_mentions: 0 });
        return;
      }
      const entity = searchData[0];
      const detRes = await fetch(`${API}/api/entities/${entity.id}`);
      const det = await detRes.json();
      setNodeDocuments({
        person: name,
        documents: det.documents || [],
        total_mentions: entity.mention_count,
        entity_id: entity.id,
      });
      setViewMode('documents');
    } catch (err) {
      console.error(err);
      setNodeDocuments({ person: name, documents: [], total_mentions: 0 });
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadNewsForPerson = async (name) => {
    try {
      setLoadingNews(true);
      const newsRes = await fetch(`${API}/api/news/person/${encodeURIComponent(name)}`);
      const newsData = await newsRes.json();
      setNewsArticles(newsData.articles || []);
    } catch (err) {
      console.error(err);
      setNewsArticles([]);
    } finally {
      setLoadingNews(false);
    }
  };

  // Build vis-network
  useEffect(() => {
    if (!networkData || !networkData.nodes?.length) return;
    const container = containerRef.current;
    if (!container) return;

    const filteredNodes = networkData.nodes.filter((n) => {
      if (!filters.showGovernment && n.government_role) return false;
      if (!filters.showBusiness && n.business_connection) return false;
      if (!filters.showDeceased && n.enrichment?.enrichment?.status_2026 === 'deceased') return false;
      if (!filters.showConvicted && n.enrichment?.enrichment?.status_2026 === 'convicted') return false;
      return true;
    });
    const ids = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = networkData.edges.filter((e) => ids.has(e.from) && ids.has(e.to));

    // Enterprise palette — muted, functional
    const colorMap = (node) => {
      if (node.government_role) return { background: '#c0392b', border: '#96281b', font: '#fff' };
      if (node.business_connection) return { background: '#d4a017', border: '#b8860b', font: '#000' };
      const status = node.enrichment?.enrichment?.status_2026;
      if (status === 'deceased') return { background: '#7f8c8d', border: '#5d6d6e', font: '#fff' };
      if (status === 'convicted') return { background: '#6c3483', border: '#4a235a', font: '#fff' };
      return { background: '#2c3e50', border: '#1a252f', font: '#fff' };
    };

    const styledNodes = filteredNodes.map((n) => {
      const c = colorMap(n);

      // Use circular image if available, otherwise dot
      const nodeConfig = {
        ...n,
        color: { background: c.background, border: c.border, highlight: { background: c.background, border: '#9CA3AF' } },
        font: { color: c.font, size: 11, face: 'Inter, system-ui, sans-serif' },
        size: Math.max(15, Math.min(40, (n.value || 1) * 1.5)),
        borderWidth: 2,
        borderWidthSelected: 4,
      };

      // If node has image, use circularImage shape
      if (n.image) {
        nodeConfig.shape = 'circularImage';
        nodeConfig.image = n.image;
        nodeConfig.size = Math.max(25, Math.min(50, (n.value || 1) * 1.5));
        nodeConfig.brokenImage = undefined; // Fallback to dot if image fails
      } else {
        nodeConfig.shape = 'dot';
      }

      return nodeConfig;
    });

    const net = new Network(
      container,
      {
        nodes: styledNodes,
        edges: filteredEdges.map((e) => ({
          ...e,
          color: { color: '#9CA3AF', highlight: '#E5E7EB', hover: '#E5E7EB', opacity: 0.4 },
          width: Math.max(1, Math.min(4, e.value || 1)),
          smooth: { type: 'continuous' }
        }))
      },
      {
        physics: {
          stabilization: { iterations: 300 },
          barnesHut: {
            gravitationalConstant: -30000,
            centralGravity: 0.2,
            springLength: 200,
            springConstant: 0.03,
            avoidOverlap: 0.2
          }
        },
        interaction: { hover: true, tooltipDelay: 100, navigationButtons: false, keyboard: true, selectConnectedEdges: false },
      }
    );

    net.on('click', (params) => {
      if (params.edges.length > 0 && params.nodes.length === 0) {
        const edgeId = params.edges[0];
        const edge = filteredEdges.find((e) => `${e.from}_${e.to}` === edgeId || e.id === edgeId);
        if (edge) {
          const from = filteredNodes.find((n) => n.id === edge.from);
          const to = filteredNodes.find((n) => n.id === edge.to);
          if (from && to) {
            setSelectedEdge({ from, to, sharedDocs: edge.value || edge.weight, edge });
            setSelectedNode(null);
            setNodeDocuments(null);
            loadEvidence(from.label, to.label);
          }
        }
      } else if (params.nodes.length > 0) {
        const node = filteredNodes.find((n) => n.id === params.nodes[0]);
        if (node) {
          setSelectedNode(node);
          setSelectedEdge(null);
          setEvidence(null);
          loadNodeDocuments(node.label);
          loadNewsForPerson(node.label);  // Also load news
        }
      } else {
        setSelectedNode(null);
        setSelectedEdge(null);
        setEvidence(null);
        setNodeDocuments(null);
        setViewMode('profile');
      }
    });

    setNetworkInstance(net);
    return () => net.destroy();
  }, [networkData, filters]);

  // --- Utility sub-components (inline, enterprise style) ---

  const Metric = ({ label, value, accent }) => (
    <div style={s.metricBox}>
      <div style={{ ...s.metricValue, color: accent || '#2c3e50' }}>{value}</div>
      <div style={s.metricLabel}>{label}</div>
    </div>
  );

  const Tag = ({ children, color = '#2c3e50', bg = '#ecf0f1' }) => (
    <span style={{ ...s.tag, color, backgroundColor: bg }}>{children}</span>
  );

  const renderDocPurpose = (doc) => {
    const map = {
      fbi_report: 'FBI Investigation Report',
      deposition: 'Sworn Deposition',
      lawsuit: 'Court Complaint / Lawsuit',
      flight_log: 'Flight Passenger Manifest',
      court_filing: 'Court Filing',
      volume_document: 'Evidence Collection',
      contact_list: 'Contact / Address Book',
      email: 'Email Correspondence',
      affidavit: 'Sworn Affidavit',
      transcript: 'Proceeding Transcript',
      exhibit: 'Case Exhibit',
    };
    const t = (doc.document_type || '').toLowerCase();
    for (const [k, v] of Object.entries(map)) if (t.includes(k)) return v;
    const fn = (doc.title || doc.filename || '').toLowerCase();
    if (fn.includes('deposition')) return 'Legal Deposition';
    if (fn.includes('fbi')) return 'FBI Document';
    if (fn.includes('flight')) return 'Flight Records';
    return 'Case Document';
  };

  // --- RENDER ---

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      {/* Top bar - Palantir style */}
      <header className="palantir-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="palantir-logo">INTELLIGENCE PLATFORM</span>
          <div style={{ width: 1, height: 20, background: 'var(--palantir-border)' }} />
          <nav className="palantir-breadcrumb">
            <a href="/">Analysis</a>
            <span>/</span>
            <span>Network Analysis · Trump — Epstein</span>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 10, color: 'var(--palantir-text-muted)', letterSpacing: '0.05em' }}>
            SOURCE: DOJ/SDNY/SDFL
          </span>
          <span style={{ fontSize: 10, color: 'var(--palantir-text-muted)', fontFamily: 'monospace' }}>
            {new Date().toISOString().slice(0, 10)}
          </span>
        </div>
      </header>

      <Navigation />

      {loading ? (
        <div className="palantir-loading" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div className="palantir-spinner" />
          <span className="palantir-loading-text">LOADING NETWORK DATA</span>
        </div>
      ) : (
        <>
          {/* Metrics strip - Palantir style */}
          <div className="palantir-metrics" style={{ flexShrink: 0 }}>
            <div className="palantir-metric">
              <div className="palantir-metric-value">{networkData?.metadata?.total_nodes || 0}</div>
              <div className="palantir-metric-label">Network Nodes</div>
            </div>
            <div className="palantir-metric">
              <div className="palantir-metric-value" style={{ color: 'var(--palantir-accent-red)' }}>
                {networkData?.metadata?.government_officials || 0}
              </div>
              <div className="palantir-metric-label">Gov. Officials</div>
              <div className="palantir-metric-sublabel">Active 2026</div>
            </div>
            <div className="palantir-metric">
              <div className="palantir-metric-value" style={{ color: 'var(--palantir-accent-yellow)' }}>
                {networkData?.metadata?.business_associates || 0}
              </div>
              <div className="palantir-metric-label">Business Assoc.</div>
            </div>
            <div className="palantir-metric">
              <div className="palantir-metric-value">{networkData?.metadata?.total_edges || 0}</div>
              <div className="palantir-metric-label">Connections</div>
            </div>

          </div>

          {/* Alert Banner - Palantir style */}
          {govConnections?.total_government_officials > 0 && (
            <div className="palantir-alert" style={{ flexShrink: 0 }}>
              <span className="palantir-alert-icon">⚠</span>
              <span className="palantir-alert-text">
                <span className="palantir-alert-count">{govConnections.total_government_officials}</span> ACTIVE GOVERNMENT OFFICIAL{govConnections.total_government_officials > 1 ? 'S' : ''} IDENTIFIED IN NETWORK
                {govConnections.officials?.slice(0, 3).map((o, i) => (
                  <span key={i} style={{ marginLeft: 8, color: 'var(--palantir-accent-yellow)' }}>
                    · {o.official_name} ({o.position})
                  </span>
                ))}
              </span>
            </div>
          )}

          {/* Full-screen graph with overlay panels */}
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
            {/* Graph canvas - takes ALL space (no header) */}
            <div ref={containerRef} style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(ellipse at center, #141921 0%, #0a0a0a 100%)'
            }} />

            {/* Graph instructions overlay */}
            <div style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 16px',
              background: 'rgba(20, 25, 33, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #2A3140',
              borderRadius: 6,
              fontSize: 11,
              color: '#9BA3AF',
              zIndex: 5
            }}>
              Click nodes for details · Click edges for documents · Scroll to zoom
            </div>

            {/* LEFT: Filters - Floating overlay */}
            <aside style={{ position: 'absolute', left: 16, top: 60, width: 200, maxHeight: 'calc(100% - 80px)', zIndex: 10, ...s.sidebar }}>
              <div style={s.sidebarSection}>
                <div style={s.sidebarHeading}>Filters</div>
                {[
                  { key: 'showGovernment', label: 'Government Officials', color: '#c0392b' },
                  { key: 'showBusiness', label: 'Business Associates', color: '#d4a017' },
                  { key: 'showDeceased', label: 'Deceased', color: '#7f8c8d' },
                  { key: 'showConvicted', label: 'Convicted', color: '#6c3483' },
                ].map(({ key, label, color }) => (
                  <label key={key} style={s.filterRow}>
                    <input
                      type="checkbox"
                      checked={filters[key]}
                      onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
                      style={s.checkbox}
                    />
                    <span style={{ ...s.legendDot, backgroundColor: color }} />
                    <span style={s.filterLabel}>{label}</span>
                  </label>
                ))}
              </div>

              <div style={s.sidebarSection}>
                <div style={s.sidebarHeading}>Legend</div>
                {[
                  { label: 'Government Official', color: '#c0392b' },
                  { label: 'Business Associate', color: '#d4a017' },
                  { label: 'Deceased', color: '#7f8c8d' },
                  { label: 'Convicted', color: '#6c3483' },
                  { label: 'Other', color: '#2c3e50' },
                ].map(({ label, color }) => (
                  <div key={label} style={s.legendRow}>
                    <span style={{ ...s.legendDot, backgroundColor: color }} />
                    <span style={s.legendLabel}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Timeline summary */}
              <div style={s.sidebarSection}>
                <div style={s.sidebarHeading}>Timeline</div>
                {[
                  ['1990s', 'Social relationship begins, NYC / Palm Beach'],
                  ['2002', 'Trump praises Epstein in New York Magazine'],
                  ['~2004', 'Trump claims relationship ended'],
                  ['2008', 'Epstein convicted, FL'],
                  ['2019', 'Epstein re-arrested; dies in custody'],
                  ['2025', 'DOJ releases 3.5M+ pages'],
                ].map(([yr, desc]) => (
                  <div key={yr} style={s.timelineRow}>
                    <span style={s.timelineYear}>{yr}</span>
                    <span style={s.timelineDesc}>{desc}</span>
                  </div>
                ))}
              </div>
            </aside>

            {/* RIGHT: Detail panel - Floating overlay, only visible when node selected */}
            {(selectedNode || selectedEdge) && (
              <aside style={{ position: 'absolute', right: 16, top: 16, width: 400, maxHeight: 'calc(100% - 32px)', zIndex: 10, ...s.detailPanel, borderRadius: 6, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)' }}>
              {/* Tabs */}
              {(selectedNode || selectedEdge) && (
                <div style={s.tabBar}>
                  <button onClick={() => setViewMode('profile')} style={viewMode === 'profile' ? s.tabActive : s.tab}>
                    Profile
                  </button>
                  <button onClick={() => setViewMode('documents')} style={viewMode === 'documents' ? s.tabActive : s.tab}>
                    Documents
                    {(nodeDocuments?.documents?.length || evidence?.shared_documents_count) ? (
                      <span style={s.tabBadge}>
                        {nodeDocuments?.documents?.length || evidence?.shared_documents_count}
                      </span>
                    ) : null}
                  </button>
                  <button onClick={() => setViewMode('news')} style={viewMode === 'news' ? s.tabActive : s.tab}>
                    News
                    {newsArticles.length > 0 && (
                      <span style={s.tabBadge}>{newsArticles.length}</span>
                    )}
                  </button>
                </div>
              )}

              <div style={s.detailBody}>
                {/* --- Edge profile --- */}
                {selectedEdge && viewMode === 'profile' ? (
                  <div>
                    <div style={s.detailHeading}>Connection</div>
                    <div style={s.connectionCard}>
                      <div style={s.connectionName}>{selectedEdge.from.label}</div>
                      <div style={s.connectionArrow}>↕</div>
                      <div style={s.connectionName}>{selectedEdge.to.label}</div>
                    </div>
                    <div style={s.sharedDocsBox}>
                      <div style={s.sharedDocsNum}>{selectedEdge.sharedDocs}</div>
                      <div style={s.sharedDocsLabel}>shared documents</div>
                    </div>
                    {loadingDocuments && <div style={s.miniSpinnerWrap}><div style={s.miniSpinner} /></div>}
                    <button onClick={() => setViewMode('documents')} style={s.btnPrimary}>
                      View Documents →
                    </button>
                  </div>

                /* --- Edge documents --- */
                ) : selectedEdge && viewMode === 'documents' ? (
                  <div>
                    {loadingDocuments ? (
                      <div style={s.miniSpinnerWrap}><div style={s.miniSpinner} /><span style={s.loadText}>Loading…</span></div>
                    ) : evidence ? (
                      <DocumentEvidence
                        documents={evidence.evidence || []}
                        person1={evidence.person1}
                        person2={evidence.person2}
                        onDocumentClick={(doc) => window.open(`/document/${doc.id}`, '_blank')}
                      />
                    ) : (
                      <div style={s.emptyState}>No documents found.</div>
                    )}
                  </div>

                /* --- Node profile --- */
                ) : selectedNode && viewMode === 'profile' ? (
                  <div>
                    <div style={s.detailHeading}>{selectedNode.label}</div>

                    {/* Wikipedia Link */}
                    <a
                      href={`https://en.wikipedia.org/wiki/${selectedNode.label.replace(/ /g, '_')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        background: 'rgba(74, 158, 255, 0.1)',
                        border: '1px solid rgba(74, 158, 255, 0.3)',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#9CA3AF',
                        textDecoration: 'none',
                        marginBottom: 16,
                      }}
                    >
                      📖 View Wikipedia →
                    </a>

                    {selectedNode.enrichment?.enrichment && (
                      <div style={s.fieldGroup}>
                        {selectedNode.enrichment.enrichment.role_2026 && (
                          <Field label="Current Role" value={selectedNode.enrichment.enrichment.role_2026} />
                        )}
                        {selectedNode.enrichment.enrichment.occupation && (
                          <Field label="Occupation" value={selectedNode.enrichment.enrichment.occupation} />
                        )}
                        {selectedNode.enrichment.enrichment.relationship_to_trump && (
                          <Field label="Rel. to Trump" value={selectedNode.enrichment.enrichment.relationship_to_trump.replace(/_/g, ' ')} />
                        )}
                        {selectedNode.enrichment.enrichment.relationship_to_epstein && (
                          <Field label="Rel. to Epstein" value={selectedNode.enrichment.enrichment.relationship_to_epstein.replace(/_/g, ' ')} />
                        )}
                        {selectedNode.enrichment.enrichment.summary && (
                          <div style={s.summaryBlock}>{selectedNode.enrichment.enrichment.summary}</div>
                        )}
                      </div>
                    )}

                    {selectedNode.government_role && (
                      <div style={s.flagBox('#c0392b')}>
                        <div style={s.flagTitle}>Government Position</div>
                        <div style={s.flagValue}>{selectedNode.government_role.position}</div>
                        <div style={s.flagSub}>{selectedNode.government_role.department}</div>
                      </div>
                    )}

                    {selectedNode.business_connection && (
                      <div style={s.flagBox('#d4a017')}>
                        <div style={s.flagTitle}>Business Connection</div>
                        <div style={s.flagValue}>{selectedNode.business_connection.connection}</div>
                        <div style={s.flagSub}>{selectedNode.business_connection.active ? 'Active' : 'Historic'}</div>
                      </div>
                    )}

                    {nodeDocuments && (
                      <button onClick={() => setViewMode('documents')} style={{ ...s.btnPrimary, marginTop: 16 }}>
                        View {nodeDocuments.documents.length} Documents →
                      </button>
                    )}
                  </div>

                /* --- Node documents --- */
                ) : selectedNode && viewMode === 'documents' ? (
                  <div>
                    {loadingDocuments ? (
                      <div style={s.miniSpinnerWrap}><div style={s.miniSpinner} /><span style={s.loadText}>Loading…</span></div>
                    ) : nodeDocuments?.documents?.length > 0 ? (
                      <div>
                        <div style={s.docSummaryBar}>
                          <strong>{nodeDocuments.person}</strong> — {nodeDocuments.documents.length} document{nodeDocuments.documents.length !== 1 ? 's' : ''}
                        </div>
                        {nodeDocuments.documents.map((doc, idx) => (
                          <div key={doc.id || idx} style={s.docRow}>
                            <div style={s.docFilename}>{doc.filename || doc.title || 'Untitled'}</div>
                            <div style={s.docTagRow}>
                              {doc.document_type && <Tag bg="#eaf2f8" color="#2471a3">{doc.document_type.replace(/_/g, ' ').toUpperCase()}</Tag>}
                              {doc.page_count && <Tag>{doc.page_count} pg</Tag>}
                              {doc.mention_count && <Tag bg="#fef9e7" color="#b7950b">{doc.mention_count}× mentioned</Tag>}
                            </div>
                            <div style={s.docPurpose}>{renderDocPurpose(doc)}</div>
                            <button onClick={() => window.open(`/document/${doc.id}`, '_blank')} style={s.btnSmall}>
                              Open ↗
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={s.emptyState}>No documents found for {selectedNode?.label}.</div>
                    )}
                  </div>

                /* --- Node news --- */
                ) : selectedNode && viewMode === 'news' ? (
                  <div>
                    <div style={s.detailHeading}>News Coverage</div>
                    <div style={{ fontSize: 12, color: '#9BA3AF', marginBottom: 16 }}>
                      Articles about {selectedNode.label} + Epstein
                    </div>
                    {loadingNews ? (
                      <div style={s.miniSpinnerWrap}><div style={s.miniSpinner} /><span style={s.loadText}>Loading news...</span></div>
                    ) : newsArticles.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {newsArticles.map((article, idx) => (
                          <a key={idx} href={article.link} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'block', padding: 12, background: 'rgba(74, 158, 255, 0.03)', border: '1px solid #2A3140', borderRadius: 6, textDecoration: 'none' }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                              {article.thumbnail && <img src={article.thumbnail} alt="" style={{ width: 60, height: 60, borderRadius: 4, objectFit: 'cover' }} />}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#E4E7EB', marginBottom: 4, lineHeight: 1.4 }}>{article.title}</div>
                                <div style={{ fontSize: 10, color: '#9BA3AF', marginBottom: 4 }}>{article.source} · {article.date}</div>
                                {article.snippet && <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>{article.snippet.slice(0, 120)}...</div>}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div style={s.emptyState}>No recent news articles</div>
                    )}
                  </div>

                /* --- Nothing selected --- */
                ) : (
                  <div style={s.emptyState}>
                    <div style={{ fontSize: 13, color: '#95a5a6', lineHeight: 1.6 }}>
                      Select a node to view entity profile and associated documents.
                      Select an edge to view shared documentary evidence.
                    </div>
                  </div>
                )}
              </div>
              </aside>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Simple field row
const Field = ({ label, value }) => (
  <div style={s.fieldRow}>
    <span style={s.fieldLabel}>{label}</span>
    <span style={s.fieldValue}>{value}</span>
  </div>
);

// ── Styles ──────────────────────────────────────────────────────────
// Palantir-style: dark bg, intelligence-grade aesthetic
const s = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#E4E7EB',
    fontSize: 13,
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: 48,
    backgroundColor: '#141921',
    borderBottom: '1px solid #2A3140',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  backLink: { color: '#9CA3AF', textDecoration: 'none', fontSize: 12, fontWeight: 500 },
  headerDivider: { width: 1, height: 20, backgroundColor: '#2A3140' },
  title: { fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' },
  headerMeta: { fontSize: 11, color: '#6B7280' },

  // Loading
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 48px)', backgroundColor: '#0a0a0a' },
  spinner: { width: 28, height: 28, border: '3px solid #2A3140', borderTopColor: '#9CA3AF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  // Body
  body: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' },

  // Metrics strip
  metricsStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    padding: '0 0',
    borderBottom: '1px solid #2A3140',
    backgroundColor: '#1a1f2e',
    flexShrink: 0,
  },
  metricBox: {
    padding: '10px 20px',
    borderRight: '1px solid #2A3140',
    minWidth: 100,
  },
  metricValue: { fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#9CA3AF' },
  metricLabel: { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 },

  alertStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
    padding: '6px 16px',
    fontSize: 11,
    color: '#922b21',
    backgroundColor: '#fdedec',
    borderLeft: '3px solid #c0392b',
  },
  alertDot: { width: 6, height: 6, borderRadius: '50%', backgroundColor: '#c0392b', flexShrink: 0 },
  alertName: { fontWeight: 500, color: '#6c3483' },

  // Main 3-col - Better space utilization
  main: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr 420px',
    flex: 1,
    overflow: 'hidden',
  },

  // Sidebar - Floating
  sidebar: {
    backgroundColor: 'rgba(20, 25, 33, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid #2A3140',
    borderRadius: 6,
    overflowY: 'auto',
    padding: 0,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  },
  sidebarSection: {
    padding: '14px 16px',
    borderBottom: '1px solid #2A3140',
  },
  sidebarHeading: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#6B7280',
    marginBottom: 10,
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
    cursor: 'pointer',
    fontSize: 12,
  },
  checkbox: { accentColor: '#9CA3AF' },
  filterLabel: { color: '#E4E7EB' },
  legendRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 11 },
  legendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { color: '#9BA3AF' },

  // Timeline in sidebar
  timelineRow: { display: 'flex', gap: 10, padding: '4px 0', fontSize: 11, lineHeight: 1.4 },
  timelineYear: { fontWeight: 600, color: '#9CA3AF', minWidth: 38, flexShrink: 0, fontVariantNumeric: 'tabular-nums' },
  timelineDesc: { color: '#9BA3AF' },

  // Graph
  graphCol: { display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0a0a0a' },
  graphHeader: {
    padding: '6px 16px',
    borderBottom: '1px solid #2A3140',
    backgroundColor: '#141921',
    flexShrink: 0,
  },
  graphHeaderText: { fontSize: 11, color: '#9BA3AF' },
  graphCanvas: { flex: 1, width: '100%', background: 'radial-gradient(ellipse at center, #141921 0%, #0a0a0a 100%)' },

  // Detail panel - Floating
  detailPanel: {
    backgroundColor: 'rgba(20, 25, 33, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid #2A3140',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #2A3140',
    flexShrink: 0,
    backgroundColor: '#1e2430',
  },
  tab: {
    padding: '10px 16px',
    fontSize: 12,
    fontWeight: 500,
    color: '#6B7280',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  tabActive: {
    padding: '10px 16px',
    fontSize: 12,
    fontWeight: 600,
    color: '#9CA3AF',
    background: 'rgba(74, 158, 255, 0.08)',
    border: 'none',
    borderBottom: '2px solid #9CA3AF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  tabBadge: {
    fontSize: 10,
    fontWeight: 600,
    backgroundColor: '#9CA3AF',
    color: '#0a0a0a',
    padding: '1px 6px',
    borderRadius: 8,
  },
  detailBody: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
  },
  detailHeading: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 14,
    color: '#E4E7EB',
  },

  // Fields
  fieldGroup: { marginBottom: 16 },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: 12,
  },
  fieldLabel: { color: '#6B7280', fontWeight: 500 },
  fieldValue: { color: '#E4E7EB', fontWeight: 500, textTransform: 'capitalize', textAlign: 'right', maxWidth: '60%' },
  summaryBlock: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#9BA3AF',
    padding: '10px 0',
    borderTop: '1px solid #2A3140',
    marginTop: 8,
  },

  // Flags
  flagBox: (accentColor) => ({
    borderLeft: `3px solid ${accentColor}`,
    padding: '10px 12px',
    marginBottom: 12,
    backgroundColor: 'rgba(74, 158, 255, 0.05)',
    border: '1px solid #2A3140',
    borderLeftWidth: '3px',
  }),
  flagTitle: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.05em', marginBottom: 4 },
  flagValue: { fontSize: 13, fontWeight: 600, color: '#E4E7EB' },
  flagSub: { fontSize: 11, color: '#9BA3AF', marginTop: 2 },

  // Connection
  connectionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '12px 0',
    marginBottom: 12,
    backgroundColor: 'rgba(74, 158, 255, 0.05)',
    borderRadius: 4,
    border: '1px solid #2A3140',
  },
  connectionName: { fontSize: 13, fontWeight: 600, color: '#E4E7EB' },
  connectionArrow: { fontSize: 16, color: '#9CA3AF' },

  sharedDocsBox: { textAlign: 'center', padding: '12px 0', marginBottom: 12 },
  sharedDocsNum: { fontSize: 28, fontWeight: 700, color: '#9CA3AF', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 16px rgba(74, 158, 255, 0.3)' },
  sharedDocsLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase', marginTop: 2 },

  // Documents
  docSummaryBar: {
    fontSize: 12,
    padding: '8px 0',
    borderBottom: '1px solid #2A3140',
    marginBottom: 12,
    color: '#E4E7EB',
  },
  docRow: {
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  docFilename: { fontSize: 11, fontFamily: "'SF Mono', Menlo, Consolas, monospace", color: '#9BA3AF', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  docTagRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  docPurpose: { fontSize: 12, color: '#9BA3AF', lineHeight: 1.5, marginBottom: 6 },

  // Buttons
  btnPrimary: {
    display: 'inline-block',
    padding: '8px 16px',
    fontSize: 12,
    fontWeight: 600,
    color: '#0a0a0a',
    backgroundColor: '#9CA3AF',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  btnSmall: {
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 500,
    color: '#9CA3AF',
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    border: '1px solid rgba(74, 158, 255, 0.3)',
    borderRadius: 3,
    cursor: 'pointer',
  },

  // Tags
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },

  // Empty
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
  },

  // Mini spinner
  miniSpinnerWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 },
  miniSpinner: { width: 20, height: 20, border: '2px solid #2A3140', borderTopColor: '#9CA3AF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadText: { fontSize: 11, color: '#6B7280', marginTop: 8 },
};

export default TrumpEpsteinAnalysis;
