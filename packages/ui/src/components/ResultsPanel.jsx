import React, { useState } from 'react';
import DocumentCard from './DocumentCard';
import EntityCard from './EntityCard';
import { SkeletonResultsList } from './Skeletons';
import {
  DocumentTextIcon,
  UserGroupIcon,
  LinkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function ResultsPanel({
  results,
  loading,
  onDocumentClick,
  onEntityClick,
  searchQuery
}) {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Results', icon: DocumentTextIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'entities', label: 'Entities', icon: UserGroupIcon },
    { id: 'graph', label: 'Connections', icon: LinkIcon }
  ];

  const getCounts = () => {
    if (!results) return {};
    return {
      documents: results.documents?.length || 0,
      entities: results.entities?.length || 0,
      graph: results.graph?.length || 0,
      all: (results.documents?.length || 0) + (results.entities?.length || 0) + (results.graph?.length || 0)
    };
  };

  const counts = getCounts();

  const renderDocuments = () => {
    const docs = results?.documents || [];
    if (docs.length === 0) {
      return (
        <div className="empty-state">
          <DocumentTextIcon className="empty-state-icon" />
          <p>No documents found</p>
        </div>
      );
    }

    return (
      <div>
        {docs.map((doc, idx) => (
          <DocumentCard
            key={idx}
            document={doc}
            onClick={onDocumentClick}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    );
  };

  const renderEntities = () => {
    const entities = results?.entities || [];
    if (entities.length === 0) {
      return (
        <div className="empty-state">
          <UserGroupIcon className="empty-state-icon" />
          <p>No entities found</p>
        </div>
      );
    }

    return (
      <div>
        {entities.map((entity, idx) => (
          <EntityCard
            key={idx}
            entity={entity}
            compact={true}
            onViewNetwork={() => onEntityClick && onEntityClick(entity)}
          />
        ))}
      </div>
    );
  };

  const renderGraph = () => {
    const graphResults = results?.graph || [];
    if (graphResults.length === 0) {
      return (
        <div className="empty-state">
          <LinkIcon className="empty-state-icon" />
          <p>No connections found</p>
        </div>
      );
    }

    return (
      <div>
        {graphResults.map((item, idx) => (
          <div key={idx} className="document-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <LinkIcon style={{ width: '2rem', height: '2rem', color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  {item.from} → {item.to}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {item.relationship} • {item.strength} shared documents
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAll = () => {
    const hasDocuments = results?.documents && results.documents.length > 0;
    const hasEntities = results?.entities && results.entities.length > 0;
    const hasGraph = results?.graph && results.graph.length > 0;

    if (!hasDocuments && !hasEntities && !hasGraph) {
      return (
        <div className="empty-state">
          <p>No results found</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Try a different search term or adjust your filters
          </p>
        </div>
      );
    }

    return (
      <div>
        {hasEntities && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Entities ({results.entities.length})
            </h3>
            <div>
              {results.entities.slice(0, 5).map((entity, idx) => (
                <EntityCard
                  key={idx}
                  entity={entity}
                  compact={true}
                  onViewNetwork={() => onEntityClick && onEntityClick(entity)}
                />
              ))}
            </div>
            {results.entities.length > 5 && (
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={() => setActiveTab('entities')}
              >
                View all {results.entities.length} entities
              </button>
            )}
          </div>
        )}

        {hasDocuments && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Documents ({results.documents.length})
            </h3>
            <div>
              {results.documents.slice(0, 10).map((doc, idx) => (
                <DocumentCard
                  key={idx}
                  document={doc}
                  onClick={onDocumentClick}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
            {results.documents.length > 10 && (
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={() => setActiveTab('documents')}
              >
                View all {results.documents.length} documents
              </button>
            )}
          </div>
        )}

        {hasGraph && (
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Connections ({results.graph.length})
            </h3>
            {renderGraph()}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <SkeletonResultsList count={5} />;
    }

    switch (activeTab) {
      case 'documents':
        return renderDocuments();
      case 'entities':
        return renderEntities();
      case 'graph':
        return renderGraph();
      case 'all':
      default:
        return renderAll();
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon style={{ width: '1rem', height: '1rem', display: 'inline-block', marginRight: '0.5rem' }} />
              {tab.label}
              {counts[tab.id] > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)'
                }}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem'
      }}>
        {renderContent()}
      </div>
    </div>
  );
}
