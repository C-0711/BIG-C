import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import UnifiedSearch from '../components/UnifiedSearch';
import ResultsPanel from '../components/ResultsPanel';
import ProfessionalGraph from '../components/ProfessionalGraph';
import EntityCard from '../components/EntityCard';
import TimelineChart from '../components/TimelineChart';
import '../styles/investigation.css';
import {
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';

export default function InvestigationDashboard() {
  const [searchResults, setSearchResults] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [centerPerson, setCenterPerson] = useState('Epstein');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('all');
  const [loading, setLoading] = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(true);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  useEffect(() => {
    // Load initial data
    loadInitialEntity('Epstein');
  }, []);

  const loadInitialEntity = async (name) => {
    try {
      const response = await fetch(`http://localhost:8766/api/entities?search=${encodeURIComponent(name)}&limit=1`);
      const data = await response.json();
      if (data.entities && data.entities.length > 0) {
        setSelectedEntity(data.entities[0]);
      }
    } catch (error) {
      console.error('Error loading initial entity:', error);
    }
  };

  const handleSearch = async (query, mode) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setSearchMode(mode);
    setLoading(true);

    try {
      // Try unified endpoint first
      try {
        const unifiedResponse = await fetch(
          `http://localhost:8766/api/search/unified?query=${encodeURIComponent(query)}&mode=${mode}`
        );
        if (unifiedResponse.ok) {
          const data = await unifiedResponse.json();
          setSearchResults(data);
          toast.success(`Found ${(data.documents?.length || 0) + (data.entities?.length || 0)} results`);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log('Unified endpoint not available, falling back to individual calls');
      }

      // Fallback to individual API calls
      const results = {
        documents: [],
        entities: [],
        graph: []
      };

      if (mode === 'all' || mode === 'documents') {
        const docResponse = await fetch(`http://localhost:8766/api/search?query=${encodeURIComponent(query)}&limit=20`);
        if (docResponse.ok) {
          const docData = await docResponse.json();
          results.documents = docData.results || [];
        }
      }

      if (mode === 'all' || mode === 'entities') {
        const entityResponse = await fetch(`http://localhost:8766/api/entities?search=${encodeURIComponent(query)}&limit=20`);
        if (entityResponse.ok) {
          const entityData = await entityResponse.json();
          results.entities = entityData.entities || [];
        }
      }

      setSearchResults(results);
      const totalResults = results.documents.length + results.entities.length + results.graph.length;
      if (totalResults > 0) {
        toast.success(`Found ${totalResults} results`);
      } else {
        toast.error('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEntityClick = async (entity) => {
    setSelectedEntity(entity);
    setCenterPerson(entity.name);
    toast.success(`Loading network for ${entity.name}`);
  };

  const handleDocumentClick = (document) => {
    // Open document in new tab or modal
    if (document.id) {
      window.open(`/document/${document.id}`, '_blank');
    } else {
      toast.error('Document viewer not yet implemented');
    }
  };

  const handleViewDocuments = async (entityName) => {
    handleSearch(entityName, 'documents');
  };

  const gridTemplate = () => {
    const cols = [
      leftPanelVisible ? '350px' : '0',
      '1fr',
      rightPanelVisible ? '350px' : '0'
    ].join(' ');

    const rows = [
      '80px',
      '1fr',
      timelineVisible ? '250px' : '0'
    ].join(' ');

    return { cols, rows };
  };

  const template = gridTemplate();

  return (
    <div className="investigation-dashboard">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)'
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'white'
            }
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: 'white'
            }
          }
        }}
      />

      <div
        className="dashboard-container"
        style={{
          gridTemplateColumns: template.cols,
          gridTemplateRows: template.rows
        }}
      >
        {/* Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <SparklesIcon style={{ width: '2rem', height: '2rem', color: 'var(--accent-primary)' }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.125rem' }}>
                Epstein Investigation Dashboard
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                15,000 documents • 107K entities • 50K graph nodes
              </p>
            </div>
          </div>

          <UnifiedSearch
            onSearch={handleSearch}
            onModeChange={setSearchMode}
            initialMode={searchMode}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/trump-epstein">
              <button className="btn" style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}>
                <FireIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                Trump-Epstein Analysis
              </button>
            </Link>
            <button
              className="btn btn-secondary"
              onClick={() => setLeftPanelVisible(!leftPanelVisible)}
              title={leftPanelVisible ? 'Hide results' : 'Show results'}
            >
              <Bars3Icon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setRightPanelVisible(!rightPanelVisible)}
              title={rightPanelVisible ? 'Hide entity' : 'Show entity'}
            >
              <Bars3Icon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
        </div>

        {/* Left Panel - Results */}
        <AnimatePresence>
          {leftPanelVisible && (
            <motion.div
              className="dashboard-left"
              initial={{ x: -350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -350, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsPanel
                results={searchResults}
                loading={loading}
                onDocumentClick={handleDocumentClick}
                onEntityClick={handleEntityClick}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Panel - Graph */}
        <div className="dashboard-center">
          {centerPerson ? (
            <ProfessionalGraph
              personName={centerPerson}
              onNodeClick={(node) => {
                if (node.label) {
                  loadInitialEntity(node.label);
                  setCenterPerson(node.label);
                }
              }}
            />
          ) : (
            <div className="empty-state">
              <p>Select an entity to visualize their network</p>
            </div>
          )}
        </div>

        {/* Right Panel - Entity Details */}
        <AnimatePresence>
          {rightPanelVisible && (
            <motion.div
              className="dashboard-right"
              initial={{ x: 350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 350, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ padding: '1rem' }}>
                {selectedEntity ? (
                  <EntityCard
                    entity={selectedEntity}
                    onViewNetwork={handleEntityClick}
                    onViewDocuments={handleViewDocuments}
                  />
                ) : (
                  <div className="empty-state">
                    <p>Select an entity to view details</p>
                  </div>
                )}

                {/* Quick Links */}
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Quick Search
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Epstein', 'Trump', 'Maxwell', 'Giuffre', 'Prince Andrew', 'Bill Clinton'].map(name => (
                      <button
                        key={name}
                        className="btn btn-secondary"
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                        onClick={() => {
                          loadInitialEntity(name);
                          setCenterPerson(name);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Panel - Timeline */}
        <AnimatePresence>
          {timelineVisible && (
            <motion.div
              className="dashboard-timeline"
              initial={{ y: 250, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 250, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '1rem',
                zIndex: 10
              }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem' }}
                  onClick={() => setTimelineVisible(false)}
                  title="Hide timeline"
                >
                  <ChevronDownIcon style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
              <TimelineChart entityName={selectedEntity?.name || centerPerson} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline Toggle (when hidden) */}
        {!timelineVisible && (
          <button
            className="btn btn-primary"
            style={{
              position: 'fixed',
              bottom: '1rem',
              right: '1rem',
              zIndex: 100
            }}
            onClick={() => setTimelineVisible(true)}
          >
            <ChevronUpIcon style={{ width: '1rem', height: '1rem' }} />
            Show Timeline
          </button>
        )}
      </div>
    </div>
  );
}
