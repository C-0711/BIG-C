import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastProvider from "./components/ToastProvider";
import { ConfigProvider, useConfig } from './config/ConfigProvider';
import { OpenClawProvider } from './config/OpenClawProvider';
import { DynamicSidebar } from './components/DynamicSidebar';

// Config-driven Pages
import Dashboard from "./pages/Dashboard";
import ConfigSettings from "./pages/ConfigSettings";

// Legacy Pages (will be made config-driven later)
import IntelligenceAssistant from "./pages/IntelligenceAssistant";
import SkillsPage from "./pages/SkillsPage";
import KnowledgeBase from "./pages/KnowledgeBase";
import AutomationHub from "./pages/AutomationHub";
import Workspaces from "./pages/Workspaces";
import Integrations from "./pages/Integrations";
import Publishing from "./pages/Publishing";
import Reports from "./pages/Reports";
import Gallery from "./pages/Gallery";
import MarketingPage from "./pages/MarketingPage";
import ProductPage from "./pages/ProductPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import IntelligencePage from "./pages/IntelligencePage";
import DigitalProductPass from "./pages/DigitalProductPass";
import ServicePage from "./pages/ServicePage";

// ─── LAYOUT ────────────────────────────────────────────────────────────────
function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden">
      <DynamicSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

// ─── LOADING STATE ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading configuration...</p>
      </div>
    </div>
  );
}

// ─── ROUTES ────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { loading } = useConfig();

  if (loading) return <LoadingScreen />;

  return (
    <Layout>
      <Routes>
        {/* Main */}
        <Route path="/" element={<IntelligenceAssistant />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Core */}
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/automation" element={<AutomationHub />} />
        <Route path="/workspaces" element={<Workspaces />} />
        
        {/* Data */}
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/publishing" element={<Publishing />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/reports" element={<Reports />} />
        
        {/* Business */}
        <Route path="/marketing" element={<MarketingPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/dpp/*" element={<DigitalProductPass />} />
        <Route path="/service" element={<ServicePage />} />
        
        {/* Settings */}
        <Route path="/settings" element={<ConfigSettings />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfigProvider>
          <OpenClawProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </OpenClawProvider>
        </ConfigProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
