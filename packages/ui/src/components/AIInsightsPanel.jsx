import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export default function AIInsightsPanel({ productId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!productId) return;
    loadInsights();
  }, [productId]);

  const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return data;
      } catch (err) {
        if (i === retries - 1) throw err;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
      }
    }
  };

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = `${window.location.protocol}//${window.location.hostname}:8766`;

      const [lifecycle, demand, market, recommendations] = await Promise.all([
        fetchWithRetry(`${baseUrl}/api/analytics/lifecycle/${productId}`).catch(err => ({ error: err.message })),
        fetchWithRetry(`${baseUrl}/api/analytics/demand/${productId}`).catch(err => ({ error: err.message })),
        fetchWithRetry(`${baseUrl}/api/analytics/market-position/${productId}`).catch(err => ({ error: err.message })),
        fetchWithRetry(`${baseUrl}/api/recommendations/${productId}?type=similar&limit=5`).catch(err => ({ error: err.message })),
      ]);

      setInsights({ lifecycle, demand, market, recommendations });
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to load insights:', error);
      setError(error.message || 'Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadInsights();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton loaders */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="palantir-entity-card animate-pulse">
            <div className="h-4 bg-palantir-bg-tertiary rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-8 bg-palantir-bg-tertiary rounded"></div>
              <div className="h-4 bg-palantir-bg-tertiary rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="palantir-entity-card">
        <div className="text-center py-6">
          <div className="text-palantir-accent-red text-4xl mb-3">⚠</div>
          <div className="text-palantir-text-primary font-semibold mb-2">
            Failed to Load Insights
          </div>
          <div className="text-palantir-text-muted text-sm mb-4">
            {error}
          </div>
          <button
            onClick={handleRetry}
            className="palantir-btn palantir-btn-primary text-xs"
            disabled={retryCount >= MAX_RETRIES}
          >
            {retryCount >= MAX_RETRIES ? 'Max retries reached' : `Retry (${retryCount}/${MAX_RETRIES})`}
          </button>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const getLifecycleColor = (stage) => {
    const colors = {
      introduction: '#9CA3AF',
      growth: '#10B981',
      maturity: '#F59E0B',
      decline: '#EF4444'
    };
    return colors[stage] || '#6B7280';
  };

  const ErrorCard = ({ title, error }) => (
    <div className="palantir-entity-card">
      <div className="palantir-section-title mb-3">{title}</div>
      <div className="text-center py-4">
        <div className="text-palantir-text-muted text-sm">
          ⚠ {error || 'Data unavailable'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Lifecycle Stage */}
      {insights.lifecycle && !insights.lifecycle.error && (
        <div className="palantir-entity-card">
          <div className="palantir-section-title mb-3">LIFECYCLE PREDICTION</div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold" style={{ color: getLifecycleColor(insights.lifecycle.lifecycle_stage) }}>
                {insights.lifecycle.lifecycle_stage?.toUpperCase()}
              </div>
              <div className="text-palantir-text-muted text-xs">
                Confidence: {(insights.lifecycle.confidence * 100).toFixed(0)}%
              </div>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ background: `${getLifecycleColor(insights.lifecycle.lifecycle_stage)}20` }}>
              <span className="text-2xl">
                {insights.lifecycle.lifecycle_stage === 'introduction' && '⬡'}
                {insights.lifecycle.lifecycle_stage === 'growth' && '⬢'}
                {insights.lifecycle.lifecycle_stage === 'maturity' && '◈'}
                {insights.lifecycle.lifecycle_stage === 'decline' && '⬣'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="palantir-entity-field">
              <div className="palantir-field-label">Age</div>
              <div className="palantir-field-value">{insights.lifecycle.metrics?.age_days} days</div>
            </div>
            <div className="palantir-entity-field">
              <div className="palantir-field-label">Relationships</div>
              <div className="palantir-field-value">{insights.lifecycle.metrics?.relationships}</div>
            </div>
            <div className="palantir-entity-field">
              <div className="palantir-field-label">Centrality</div>
              <div className="palantir-field-value">{((insights.lifecycle.metrics?.degree_centrality || 0) * 100).toFixed(1)}%</div>
            </div>
            <div className="palantir-entity-field">
              <div className="palantir-field-label">PageRank</div>
              <div className="palantir-field-value">{(insights.lifecycle.metrics?.pagerank || 0).toFixed(4)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Demand Forecast */}
      {insights.demand && !insights.demand.error && insights.demand.prediction !== 'insufficient_data' && (
        <div className="palantir-entity-card">
          <div className="palantir-section-title mb-3">DEMAND FORECAST</div>

          <div className="flex items-center justify-between mb-2">
            <div className="text-palantir-text-secondary text-sm">30-Day Trend</div>
            <div className={`px-2 py-1 rounded text-xs font-semibold ${
              insights.demand.trend === 'increasing'
                ? 'bg-palantir-accent-green/20 text-palantir-accent-green'
                : insights.demand.trend === 'decreasing'
                  ? 'bg-palantir-accent-red/20 text-palantir-accent-red'
                  : 'bg-palantir-bg-tertiary text-palantir-text-muted'
            }`}>
              {insights.demand.trend === 'increasing' ? '↗' : insights.demand.trend === 'decreasing' ? '↘' : '→'} {insights.demand.trend}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="palantir-entity-field">
              <div className="palantir-field-label">Predicted Avg</div>
              <div className="text-gray-400 font-bold text-lg">
                {(insights.demand.predicted_avg_daily_connections || 0).toFixed(1)}
              </div>
              <div className="text-palantir-text-muted text-xs">connections/day</div>
            </div>
            <div className="palantir-entity-field">
              <div className="palantir-field-label">Historical Avg</div>
              <div className="text-palantir-text-primary font-semibold text-lg">
                {(insights.demand.historical_avg || 0).toFixed(1)}
              </div>
              <div className="text-palantir-text-muted text-xs">connections/day</div>
            </div>
          </div>
        </div>
      )}

      {/* Market Position */}
      {insights.market && !insights.market.error && (
        <div className="palantir-entity-card">
          <div className="palantir-section-title mb-3">MARKET POSITION</div>

          <div className="mb-3">
            <div className="text-palantir-text-secondary text-xs mb-1">Price Tier</div>
            <div className={`inline-flex px-3 py-1 rounded text-sm font-semibold ${
              insights.market.market_position?.price_tier === 'premium'
                ? 'bg-palantir-accent-purple/20 text-palantir-accent-purple'
                : insights.market.market_position?.price_tier === 'budget'
                  ? 'bg-palantir-accent-green/20 text-palantir-accent-green'
                  : 'bg-[#1a1f2e] text-gray-400'
            }`}>
              {insights.market.market_position?.price_tier?.toUpperCase()}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-palantir-text-muted">Your Price</span>
              <span className="text-palantir-text-primary font-semibold">
                €{insights.market.market_position?.price?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-palantir-text-muted">Category Average</span>
              <span className="text-palantir-text-secondary">
                €{insights.market.market_position?.category_avg_price?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-palantir-text-muted">Competitors</span>
              <span className="text-palantir-text-secondary">
                {insights.market.market_position?.competitor_count}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Error */}
      {insights.lifecycle && insights.lifecycle.error && (
        <ErrorCard title="LIFECYCLE PREDICTION" error={insights.lifecycle.error} />
      )}

      {/* Demand Error */}
      {insights.demand && insights.demand.error && (
        <ErrorCard title="DEMAND FORECAST" error={insights.demand.error} />
      )}

      {/* Market Error */}
      {insights.market && insights.market.error && (
        <ErrorCard title="MARKET POSITION" error={insights.market.error} />
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.recommendations && (
        <div className="palantir-entity-card">
          <div className="palantir-section-title mb-3">RECOMMENDED PRODUCTS</div>

          <div className="space-y-2">
            {insights.recommendations.recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="p-2 bg-palantir-bg-tertiary rounded hover:bg-palantir-bg-panel cursor-pointer transition-colors">
                <div className="text-palantir-text-primary text-sm font-medium truncate">
                  {rec.description_short || rec.supplier_pid}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-palantir-text-muted text-xs">{rec.supplier_pid}</span>
                  <span className="text-gray-400 text-xs font-semibold">
                    {((rec.similarity || 0) * 100).toFixed(0)}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Error */}
      {insights.recommendations && insights.recommendations.error && (
        <ErrorCard title="RECOMMENDED PRODUCTS" error={insights.recommendations.error} />
      )}
    </div>
  );
}
