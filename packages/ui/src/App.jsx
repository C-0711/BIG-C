import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, useConfig } from './config/ConfigProvider';
import DynamicSidebar from './components/DynamicSidebar';

// Config-Driven Pages
import Dashboard from './pages/Dashboard';
import ConfigSettings from './pages/ConfigSettings';
import Reports from './pages/Reports';
import AgentChat from './pages/AgentChat';
import Integrations from './pages/Integrations';
import Publishing from './pages/Publishing';
import Automation from './pages/Automation';

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>
      <h2>{title}</h2>
      <p>Diese Seite wird noch entwickelt.</p>
    </div>
  );
}

function AppContent() {
  const { config, loading, error } = useConfig();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Lade Konfiguration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>⚠️ Fehler</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Neu laden</button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <DynamicSidebar />
      <main className="main-content">
        <Routes>
          {/* Core Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<ConfigSettings />} />
          
          {/* Data Pages */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/publishing" element={<Publishing />} />
          
          {/* Agent Chat - Dynamic per Agent */}
          <Route path="/agent/:agentId" element={<AgentChat />} />
          
          {/* Placeholder Pages */}
          <Route path="/products" element={<PlaceholderPage title="📦 Produkte" />} />
          <Route path="/quality" element={<PlaceholderPage title="✅ Qualität" />} />
          <Route path="/analytics" element={<PlaceholderPage title="📊 Analytics" />} />
          <Route path="/knowledge" element={<PlaceholderPage title="📚 Knowledge Base" />} />
          <Route path="/skills" element={<PlaceholderPage title="🛠️ Skills" />} />
          
          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/app">
      <ConfigProvider>
        <AppContent />
      </ConfigProvider>
    </BrowserRouter>
  );
}
