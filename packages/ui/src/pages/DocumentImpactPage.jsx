import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const API = 'http://localhost:8766';

export default function DocumentImpactPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('mentions');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Get all documents and calculate impact score
      const res = await fetch(`${API}/api/documents?limit=100`);
      const data = await res.json();

      // Calculate impact scores
      const scored = (data || []).map(doc => {
        const mentions = (doc.metadata?.people_mentioned?.length || 0) +
                        (doc.metadata?.organizations?.length || 0);
        const impactScore = (mentions * 10) + (doc.page_count || 0);

        return {
          ...doc,
          impact_score: impactScore,
          entity_count: mentions,
          // Simulated news coverage (would come from GDELT in real version)
          news_articles: Math.floor(Math.random() * 500),
          social_shares: Math.floor(Math.random() * 50000),
        };
      });

      // Sort by impact
      scored.sort((a, b) => b.impact_score - a.impact_score);
      setDocuments(scored.slice(0, 50));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#F59E0B'; // Gold
    if (rank === 2) return '#9CA3AF'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#9CA3AF'; // Blue
  };

  const getDocIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('lawsuit') || t.includes('court')) return '⚖️';
    if (t.includes('fbi')) return '🔍';
    if (t.includes('flight')) return '✈️';
    if (t.includes('deposition')) return '📝';
    if (t.includes('email')) return '📧';
    return '📄';
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <header className="palantir-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="palantir-logo">INTELLIGENCE PLATFORM</span>
          <div style={{ width: 1, height: 20, background: '#2A3140' }} />
          <nav className="palantir-breadcrumb">
            <Link to="/">Intelligence</Link>
            <span>/</span>
            <span>Document Impact Ranking</span>
          </nav>
        </div>
      </header>

      <Navigation />

      {/* Metrics */}
      <div className="palantir-metrics" style={{ flexShrink: 0 }}>
        <div className="palantir-metric">
          <div className="palantir-metric-value">{documents.length}</div>
          <div className="palantir-metric-label">Top Documents</div>
        </div>
        <div className="palantir-metric">
          <div className="palantir-metric-value" style={{ color: '#F59E0B' }}>
            {documents.reduce((sum, d) => sum + d.news_articles, 0).toLocaleString()}
          </div>
          <div className="palantir-metric-label">News Articles</div>
          <div className="palantir-metric-sublabel">Total Coverage</div>
        </div>
        <div className="palantir-metric">
          <div className="palantir-metric-value" style={{ color: '#10B981' }}>
            {documents.reduce((sum, d) => sum + d.social_shares, 0).toLocaleString()}
          </div>
          <div className="palantir-metric-label">Social Shares</div>
        </div>
        <div className="palantir-metric">
          <div className="palantir-metric-value">
            {documents.reduce((sum, d) => sum + (d.page_count || 0), 0).toLocaleString()}
          </div>
          <div className="palantir-metric-label">Total Pages</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={s.main}>
        {loading ? (
          <div className="palantir-loading">
            <div className="palantir-spinner" />
            <span className="palantir-loading-text">ANALYZING DOCUMENT IMPACT</span>
          </div>
        ) : (
          <div style={s.list}>
            {documents.map((doc, idx) => {
              const rank = idx + 1;
              const rankColor = getRankColor(rank);

              return (
                <div key={doc.id} style={s.row}>
                  {/* Rank */}
                  <div style={{ ...s.rank, color: rankColor }}>
                    #{rank}
                  </div>

                  {/* Icon */}
                  <div style={s.icon}>
                    {getDocIcon(doc.document_type)}
                  </div>

                  {/* Document Info */}
                  <div style={s.docInfo}>
                    <div style={s.docTitle}>
                      {doc.title || doc.filename}
                    </div>
                    <div style={s.docMeta}>
                      <span style={s.metaItem}>
                        <span style={s.metaIcon}>📄</span>
                        {doc.page_count || 0} pages
                      </span>
                      <span style={s.metaItem}>
                        <span style={s.metaIcon}>👥</span>
                        {doc.entity_count || 0} entities
                      </span>
                      <span style={s.metaItem}>
                        <span style={s.metaIcon}>📰</span>
                        {doc.news_articles} articles
                      </span>
                      <span style={s.metaItem}>
                        <span style={s.metaIcon}>📱</span>
                        {doc.social_shares.toLocaleString()} shares
                      </span>
                    </div>
                  </div>

                  {/* Impact Score */}
                  <div style={s.impactSection}>
                    <div style={s.impactScore}>{doc.impact_score}</div>
                    <div style={s.impactLabel}>IMPACT</div>
                  </div>

                  {/* Actions */}
                  <div style={s.actions}>
                    <button style={s.btnView} onClick={() => window.open(`/document/${doc.id}`, '_blank')}>
                      View Doc
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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

  list: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  row: {
    display: 'grid',
    gridTemplateColumns: '60px 40px 1fr 120px 100px',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    background: '#141921',
    border: '1px solid transparent',
    borderRadius: 6,
    transition: 'all 0.2s',
    cursor: 'pointer',
  },

  rank: {
    fontSize: 24,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
  },

  icon: {
    fontSize: 28,
    textAlign: 'center',
  },

  docInfo: {
    flex: 1,
    minWidth: 0,
  },

  docTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#E4E7EB',
    marginBottom: 6,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  docMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
  },

  metaItem: {
    fontSize: 11,
    color: '#9BA3AF',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },

  metaIcon: {
    fontSize: 12,
  },

  impactSection: {
    textAlign: 'center',
  },

  impactScore: {
    fontSize: 28,
    fontWeight: 700,
    color: '#9CA3AF',
    fontVariantNumeric: 'tabular-nums',
    textShadow: '0 0 12px rgba(74, 158, 255, 0.3)',
  },

  impactLabel: {
    fontSize: 9,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: 4,
  },

  actions: {
    display: 'flex',
    gap: 8,
  },

  btnView: {
    padding: '8px 16px',
    background: 'rgba(74, 158, 255, 0.1)',
    border: '1px solid rgba(74, 158, 255, 0.3)',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    color: '#9CA3AF',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
