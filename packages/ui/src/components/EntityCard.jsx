import React from 'react';
import { UserCircleIcon, DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function EntityCard({ entity, onViewNetwork, onViewDocuments, compact = false }) {
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getEntityTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'person': return 'badge-gray';
      case 'organization': return 'badge-gray';
      case 'location': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  if (compact) {
    return (
      <div className="document-card" style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {entity.photo_url ? (
            <img
              src={entity.photo_url}
              alt={entity.name}
              className="entity-avatar"
              style={{ width: '48px', height: '48px' }}
            />
          ) : (
            <div className="entity-avatar-fallback" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>
              {getInitials(entity.name)}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {entity.name}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span className={`badge ${getEntityTypeColor(entity.type)}`}>
                {entity.type || 'Person'}
              </span>
              {entity.mention_count && (
                <span>{entity.mention_count} mentions</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="entity-card">
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ flexShrink: 0 }}>
          {entity.photo_url ? (
            <img
              src={entity.photo_url}
              alt={entity.name}
              className="entity-avatar"
            />
          ) : (
            <div className="entity-avatar-fallback">
              {getInitials(entity.name)}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            {entity.name}
          </h2>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className={`badge ${getEntityTypeColor(entity.type)}`}>
              {entity.type || 'Person'}
            </span>
            {entity.mention_count && (
              <span className="badge badge-gray">
                {entity.mention_count} mentions
              </span>
            )}
            {entity.document_count && (
              <span className="badge badge-gray">
                {entity.document_count} documents
              </span>
            )}
          </div>

          {entity.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              {entity.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {entity.mention_count || 0}
          </div>
          <div className="stat-label">Total Mentions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {entity.document_count || 0}
          </div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {entity.connections || 0}
          </div>
          <div className="stat-label">Connections</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {onViewNetwork && (
          <button
            className="btn btn-primary"
            onClick={() => onViewNetwork(entity.name)}
          >
            <LinkIcon style={{ width: '1rem', height: '1rem' }} />
            View Network
          </button>
        )}
        {onViewDocuments && (
          <button
            className="btn btn-secondary"
            onClick={() => onViewDocuments(entity.name)}
          >
            <DocumentTextIcon style={{ width: '1rem', height: '1rem' }} />
            View Documents
          </button>
        )}
      </div>

      {/* Recent Documents */}
      {entity.recent_documents && entity.recent_documents.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-primary)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            RECENT MENTIONS
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {entity.recent_documents.slice(0, 3).map((doc, idx) => (
              <div key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                • {doc.title || doc.filename || 'Untitled Document'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
