import React from 'react';
import { DocumentTextIcon, CalendarIcon, TagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function DocumentCard({ document, onClick, searchQuery }) {
  const highlightText = (text, query) => {
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown date';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getDocumentTypeColor = (type) => {
    const typeMap = {
      'lawsuit': 'badge-gray',
      'deposition': 'badge-gray',
      'email': 'badge-gray',
      'letter': 'badge-gray',
      'report': 'badge-gray',
      'transcript': 'badge-gray'
    };
    return typeMap[type?.toLowerCase()] || 'badge-gray';
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className="document-card"
      onClick={() => onClick && onClick(document)}
    >
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flexShrink: 0, paddingTop: '0.25rem' }}>
          <DocumentTextIcon
            style={{ width: '2rem', height: '2rem', color: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {highlightText(document.title || document.filename || 'Untitled Document', searchQuery)}
          </h3>

          {/* Metadata */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap'
          }}>
            {document.type && (
              <span className={`badge ${getDocumentTypeColor(document.type)}`}>
                {document.type}
              </span>
            )}
            {document.date && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CalendarIcon style={{ width: '1rem', height: '1rem' }} />
                {formatDate(document.date)}
              </span>
            )}
            {document.page_count && (
              <span>{document.page_count} pages</span>
            )}
          </div>

          {/* Preview Text */}
          {document.preview_text && (
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              marginBottom: '0.5rem'
            }}>
              {highlightText(truncateText(document.preview_text, 250), searchQuery)}
            </p>
          )}

          {/* Entity Tags */}
          {document.entities && document.entities.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <TagIcon style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
              {document.entities.slice(0, 5).map((entity, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '0.25rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {entity}
                </span>
              ))}
              {document.entities.length > 5 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  +{document.entities.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Relevance Score */}
          {document.score && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--accent-primary)',
                    width: `${Math.min(100, document.score * 100)}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {Math.round(document.score * 100)}% match
              </span>
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, paddingTop: '0.25rem' }}>
          <ArrowRightIcon
            style={{ width: '1.25rem', height: '1.25rem', color: 'var(--text-muted)' }}
          />
        </div>
      </div>
    </div>
  );
}
