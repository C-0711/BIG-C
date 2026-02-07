/**
 * Data Table Widget
 * Displays data in a table format
 */

import React from 'react';

export function DataTable({ config, data }) {
  const mapping = config?.mapping || {};
  
  const resolvePath = (obj, path) => {
    if (!path || !obj) return obj;
    const cleanPath = path.replace(/^\$\.?/, '');
    if (!cleanPath) return obj;
    return cleanPath.split('.').reduce((acc, key) => acc?.[key], obj);
  };

  const columns = mapping.columns || [];
  const rows = resolvePath(data, mapping.rows) || (Array.isArray(data) ? data : []);

  // If no columns defined, auto-generate from first row
  const autoColumns = columns.length > 0 ? columns : (
    rows[0] ? Object.keys(rows[0]).slice(0, 5).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    })) : []
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return <div className="widget-empty">Keine Daten</div>;
  }

  return (
    <div className="data-table-widget">
      <table>
        <thead>
          <tr>
            {autoColumns.map((col, i) => (
              <th key={i}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((row, i) => (
            <tr key={i}>
              {autoColumns.map((col, j) => (
                <td key={j}>{formatCell(row[col.key], col.type)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 20 && (
        <div className="table-footer">
          + {rows.length - 20} weitere Einträge
        </div>
      )}
    </div>
  );
}

function formatCell(value, type) {
  if (value === null || value === undefined) return '-';
  
  switch (type) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString('de-DE') : value;
    case 'date':
      return new Date(value).toLocaleDateString('de-DE');
    case 'badge':
      return <span className="badge">{value}</span>;
    default:
      return String(value).substring(0, 100);
  }
}

export default DataTable;
