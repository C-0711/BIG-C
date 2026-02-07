/**
 * Stats Card Widget
 * Displays a single metric with optional subtitle and trend
 */

import React from 'react';

export function StatsCard({ config, data }) {
  const mapping = config?.mapping || {};
  
  const resolvePath = (obj, path) => {
    if (!path || !obj) return obj;
    const cleanPath = path.replace(/^\$\.?/, '');
    if (!cleanPath) return obj;
    return cleanPath.split('.').reduce((acc, key) => acc?.[key], obj);
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('de-DE');
    }
    return String(value ?? '-');
  };

  const value = resolvePath(data, mapping.value);
  const subtitle = mapping.subtitle 
    ? mapping.subtitle.replace(/\{\{(\w+)\}\}/g, (_, key) => data?.[key] ?? '')
    : null;
  const trend = mapping.trend ? resolvePath(data, mapping.trend) : null;
  const trendDirection = mapping.trendDirection || (trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral');

  return (
    <div className="stats-card">
      <div className="stats-value">{formatValue(value)}</div>
      {subtitle && <div className="stats-subtitle">{subtitle}</div>}
      {trend !== null && (
        <div className={`stats-trend ${trendDirection}`}>
          {trendDirection === 'up' && '↑'}
          {trendDirection === 'down' && '↓'}
          {formatValue(Math.abs(trend))}
        </div>
      )}
    </div>
  );
}

export default StatsCard;
