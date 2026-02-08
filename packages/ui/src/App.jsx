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

function PlaceholderPage({ title, icon, description }) {
  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{icon}</span>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        <p className="text-gray-400 mb-6">{description || 'This page is under development.'}</p>
        <div className="bg-[#1e1e28] border border-[#2a2a3a] rounded-lg p-6">
          <p className="text-gray-500 text-sm">
            Configure this feature in the <a href="/admin" className="text-green-400 hover:underline">Admin Dashboard</a>
          </p>
        </div>
      </div>
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
          <Route path="/assistant" element={<Navigate to="/agent/product-expert" replace />} />
          
          {/* Core - Placeholder Pages */}
          <Route path="/skills" element={<PlaceholderPage title="Skills" icon="🛠️" description="Available skills and automations for your agents." />} />
          <Route path="/knowledge" element={<PlaceholderPage title="Knowledge Base" icon="📚" description="Knowledge base and documentation for your products." />} />
          <Route path="/workspaces" element={<PlaceholderPage title="Workspaces" icon="📁" description="Workspaces for different projects and teams." />} />
          
          {/* Business - Placeholder Pages */}
          <Route path="/marketing" element={<PlaceholderPage title="Marketing" icon="📢" description="Manage marketing content and campaigns." />} />
          <Route path="/product" element={<PlaceholderPage title="Product" icon="📦" description="Product catalog and product management." />} />
          <Route path="/intelligence" element={<PlaceholderPage title="Intelligence" icon="🧠" description="AI-powered analytics and insights." />} />
          
          {/* Legacy routes */}
          <Route path="/products" element={<Navigate to="/product" replace />} />
          <Route path="/quality" element={<PlaceholderPage title="Quality" icon="✅" description="Quality checks and audit tools." />} />
          <Route path="/analytics" element={<PlaceholderPage title="Analytics" icon="📊" description="Analytics and statistics." />} />
          
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
