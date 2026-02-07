import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const API = 'http://localhost:8766';

export default function GovernmentConnectionsPage() {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    loadOfficials();
  }, []);

  const loadOfficials = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/graph/current-government-connections`);
      const data = await res.json();

      // Fetch images for all officials
      const officialsWithImages = await Promise.all(
        (data.officials || []).map(async (official) => {
          try {
            const imgRes = await fetch(`${API}/api/entities/${official.entity_id || official.canonical_id}/fetch-image`);
            const imgData = await imgRes.json();
            return { ...official, image_url: imgData.image_url };
          } catch {
            return official;
          }
        })
      );

      setOfficials(officialsWithImages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (official) => {
    setSelectedOfficial(official);
    setLoadingNews(true);

    try {
      // Fetch news articles about this person + Epstein
      const newsRes = await fetch(`${API}/api/news/person/${encodeURIComponent(official.official_name)}`);
      const newsData = await newsRes.json();
      setNewsArticles(newsData.articles || []);
    } catch (err) {
      console.error(err);
      setNewsArticles([]);
    } finally {
      setLoadingNews(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <header className="palantir-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="palantir-logo">INTELLIGENCE PLATFORM</span>
          <div style={{ width: 1, height: 20, background: '#2A3140' }} />
          <nav className="palantir-breadcrumb">
            <span>Analysis</span>
            <span>/</span>
            <span>Government Connections</span>
          </nav>
        </div>
        <div style={{ fontSize: 10, color: '#6B7280', fontFamily: 'monospace' }}>
          {new Date().toISOString().slice(0, 10)}
        </div>
      </header>

      <Navigation />

      {/* Alert Banner */}
      <div className="palantir-alert" style={{ flexShrink: 0 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span className="palantir-alert-text">
          <span className="palantir-alert-count">{officials.length}</span> ACTIVE GOVERNMENT OFFICIALS IDENTIFIED IN EPSTEIN DOCUMENTS
        </span>
      </div>

      {/* Main Content */}
      <div style={s.main}>
        {loading ? (
          <div className="palantir-loading">
            <div className="palantir-spinner" />
            <span className="palantir-loading-text">LOADING OFFICIALS DATA</span>
          </div>
        ) : (
          <div style={s.grid}>
            {officials.map((official) => (
              <div key={official.entity_id} style={s.card} onClick={() => viewDetails(official)}>
                {/* Official Photo */}
                <div style={s.photoSection}>
                  {official.image_url ? (
                    <img src={official.image_url} alt={official.official_name} style={s.photo} />
                  ) : (
                    <div style={s.photoPlaceholder}>
                      {official.official_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Official Info */}
                <div style={s.info}>
                  <h3 style={s.name}>{official.official_name}</h3>

                  <div style={s.positionBox}>
                    <span style={s.positionBadge}>🔴 GOVERNMENT</span>
                    <div style={s.position}>{official.position}</div>
                    <div style={s.department}>{official.department}</div>
                  </div>

                  {/* Stats */}
                  <div style={s.stats}>
                    <div style={s.stat}>
                      <div style={s.statValue}>{official.total_mentions || 0}</div>
                      <div style={s.statLabel}>MENTIONS</div>
                    </div>
                    <div style={s.stat}>
                      <div style={s.statValue}>{official.document_count || 0}</div>
                      <div style={s.statLabel}>DOCUMENTS</div>
                    </div>
                    <div style={s.stat}>
                      <div style={s.statValue}>{official.alias_count || 0}</div>
                      <div style={s.statLabel}>ALIASES</div>
                    </div>
                  </div>

                  {/* Significance */}
                  {official.significance && (
                    <div style={s.significance(official.significance)}>
                      SIGNIFICANCE: {official.significance}
                    </div>
                  )}

                  {/* Action */}
                  <button style={s.btn} onClick={(e) => { e.stopPropagation(); window.open(`/trump-epstein?person=${official.official_name}`, '_blank'); }}>
                    View Network →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOfficial && (
        <div style={s.modal} onClick={() => setSelectedOfficial(null)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelectedOfficial(null)}>✕</button>

            {/* Official Header */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              <img
                src={selectedOfficial.image_url || `https://ui-avatars.com/api/?name=${selectedOfficial.official_name}&size=120&background=4A9EFF&color=fff`}
                alt={selectedOfficial.official_name}
                style={{ width: 120, height: 120, borderRadius: 8, objectFit: 'cover', border: '2px solid #EF4444' }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#E4E7EB', marginBottom: 8 }}>
                  {selectedOfficial.official_name}
                </h2>
                <div style={{ fontSize: 14, color: '#EF4444', fontWeight: 600, marginBottom: 4 }}>
                  🔴 {selectedOfficial.position}
                </div>
                <div style={{ fontSize: 12, color: '#9BA3AF', marginBottom: 12 }}>
                  {selectedOfficial.department}
                </div>
                <a
                  href={`https://en.wikipedia.org/wiki/${selectedOfficial.official_name.replace(/ /g, '_')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.wikiLink}
                >
                  📖 View Wikipedia →
                </a>
              </div>
            </div>

            {/* Document Evidence */}
            <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 6, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#FCA5A5', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
                Document Evidence
              </div>
              <div style={{ fontSize: 13, color: '#E4E7EB' }}>
                <strong>{selectedOfficial.total_mentions}</strong> mentions across <strong>{selectedOfficial.document_count}</strong> documents in DOJ/SDNY/SDFL case files
              </div>
            </div>

            {/* News Articles */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#E4E7EB', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📰 News Coverage ({newsArticles.length} articles)
              </div>

              {loadingNews ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#6B7280' }}>
                  <div className="palantir-spinner" style={{ margin: '0 auto', marginBottom: 12 }} />
                  Loading news articles...
                </div>
              ) : newsArticles.length > 0 ? (
                <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {newsArticles.map((article, idx) => (
                    <a
                      key={idx}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={s.newsCard}
                    >
                      <div style={{ display: 'flex', gap: 12 }}>
                        {article.thumbnail && (
                          <img src={article.thumbnail} alt="" style={{ width: 60, height: 60, borderRadius: 4, objectFit: 'cover' }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#E4E7EB', marginBottom: 4, lineHeight: 1.4 }}>
                            {article.title}
                          </div>
                          <div style={{ fontSize: 10, color: '#9BA3AF', marginBottom: 4 }}>
                            {article.source} · {article.date}
                          </div>
                          {article.snippet && (
                            <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>
                              {article.snippet.slice(0, 100)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 24, color: '#6B7280', fontSize: 12 }}>
                  No recent news articles found
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={s.btnPrimary} onClick={() => window.open(`/trump-epstein?person=${selectedOfficial.official_name}`, '_blank')}>
                View Network Graph
              </button>
              <button style={s.btnSecondary} onClick={() => window.open(`/search?q=${selectedOfficial.official_name}`, '_blank')}>
                Search Documents
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
  },

  main: {
    flex: 1,
    padding: 32,
    overflowY: 'auto',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
    maxWidth: 1400,
    margin: '0 auto',
  },

  card: {
    background: '#141921',
    border: '1px solid #2A3140',
    borderRadius: 8,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#9CA3AF',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(74, 158, 255, 0.15)',
    }
  },

  photoSection: {
    height: 200,
    background: 'linear-gradient(135deg, #1e2430 0%, #141921 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #2A3140',
  },

  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    fontWeight: 700,
    color: '#0a0a0a',
  },

  info: {
    padding: 20,
  },

  name: {
    fontSize: 18,
    fontWeight: 700,
    color: '#E4E7EB',
    marginBottom: 12,
  },

  positionBox: {
    marginBottom: 16,
  },

  positionBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #EF4444',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    color: '#FCA5A5',
    letterSpacing: '0.05em',
    marginBottom: 8,
  },

  position: {
    fontSize: 14,
    fontWeight: 600,
    color: '#E4E7EB',
    marginTop: 8,
    marginBottom: 4,
  },

  department: {
    fontSize: 12,
    color: '#9BA3AF',
  },

  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 12,
    marginBottom: 16,
    padding: '16px 0',
    borderTop: '1px solid #2A3140',
    borderBottom: '1px solid #2A3140',
  },

  stat: {
    textAlign: 'center',
  },

  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#9CA3AF',
    fontVariantNumeric: 'tabular-nums',
  },

  statLabel: {
    fontSize: 9,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: 4,
  },

  significance: (level) => ({
    padding: '8px 12px',
    background: level === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(74, 158, 255, 0.1)',
    border: `1px solid ${level === 'HIGH' ? '#EF4444' : '#9CA3AF'}`,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    color: level === 'HIGH' ? '#FCA5A5' : '#E5E7EB',
    textAlign: 'center',
    marginBottom: 16,
  }),

  btn: {
    width: '100%',
    padding: '10px 16px',
    background: '#9CA3AF',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#0a0a0a',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  modalContent: {
    background: '#141921',
    border: '1px solid #2A3140',
    borderRadius: 12,
    padding: 32,
    maxWidth: 600,
    width: '90%',
    position: 'relative',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
  },

  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    border: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#9BA3AF',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 16,
  },

  btnPrimary: {
    flex: 1,
    padding: '12px 16px',
    background: '#9CA3AF',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#0a0a0a',
    cursor: 'pointer',
  },

  btnSecondary: {
    flex: 1,
    padding: '12px 16px',
    background: 'rgba(74, 158, 255, 0.1)',
    border: '1px solid #9CA3AF',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#9CA3AF',
    cursor: 'pointer',
  },

  wikiLink: {
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
    transition: 'all 0.2s',
  },

  newsCard: {
    display: 'block',
    padding: 12,
    background: 'rgba(74, 158, 255, 0.03)',
    border: '1px solid #2A3140',
    borderRadius: 6,
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
};
