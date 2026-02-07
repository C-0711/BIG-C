/**
 * List Widget
 * Displays data as a simple list
 */

import React from 'react';

export function ListWidget({ config, data }) {
  const mapping = config?.mapping || {};
  
  const resolvePath = (obj, path) => {
    if (!path || !obj) return obj;
    const cleanPath = path.replace(/^\$\.?/, '');
    if (!cleanPath) return obj;
    return cleanPath.split('.').reduce((acc, key) => acc?.[key], obj);
  };

  const items = resolvePath(data, mapping.items) || (Array.isArray(data) ? data : []);
  const itemTemplate = mapping.itemTemplate;

  if (!Array.isArray(items) || items.length === 0) {
    return <div className="widget-empty">Keine Einträge</div>;
  }

  const renderItem = (item) => {
    if (itemTemplate && typeof item === 'object') {
      return itemTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => item[key] ?? '');
    }
    if (typeof item === 'object') {
      return Object.values(item).slice(0, 3).join(' - ');
    }
    return String(item);
  };

  return (
    <div className="list-widget">
      <ul>
        {items.slice(0, 15).map((item, i) => (
          <li key={i}>{renderItem(item)}</li>
        ))}
      </ul>
      {items.length > 15 && (
        <div className="list-footer">
          + {items.length - 15} weitere
        </div>
      )}
    </div>
  );
}

export default ListWidget;
