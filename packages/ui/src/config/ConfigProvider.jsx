import React, { createContext, useContext, useEffect, useState } from 'react';
import { useIntelligenceConfig } from '../hooks/useConfig';

// Static fallback config
const fallbackConfig = {
  instance: { name: '0711-C Intelligence', locale: 'de-DE' },
  ui: {
    theme: 'dark',
    branding: { primaryColor: '#22c55e', accentColor: '#3b82f6' },
    dashboard: { showKPIs: true, showRecentActivity: true, showQuickActions: true },
  },
  agents: { list: [] },
  workflows: { list: [] },
  skills: { bundled: [], workspace: [] },
  dataSources: { providers: {} },
  outputs: { providers: {} },
};

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const configHook = useIntelligenceConfig();
  const { config, loading, error, connected } = configHook;

  // Merge with fallback
  const mergedConfig = config || fallbackConfig;

  // Derived values for compatibility with existing code
  const value = {
    // Raw config
    ...mergedConfig,
    
    // Hook functions
    ...configHook,
    
    // Legacy compatibility
    branding: mergedConfig.ui?.branding || {},
    modules: {
      assistant: true,
      dashboard: true,
      skills: (mergedConfig.skills?.bundled?.length || 0) > 0,
      knowledgeBase: Object.keys(mergedConfig.dataSources?.providers || {}).length > 0,
      automation: mergedConfig.workflows?.list?.filter(w => w.enabled !== false).length > 0,
      workspaces: mergedConfig.agents?.list?.filter(a => a.enabled !== false).length > 0,
      integrations: Object.keys(mergedConfig.dataSources?.providers || {}).length > 0,
      publishing: Object.keys(mergedConfig.outputs?.providers || {}).length > 0,
      gallery: mergedConfig.skills?.bundled?.includes('image-gallery'),
      reports: mergedConfig.workflows?.list?.filter(w => w.type === 'report').length > 0,
      marketing: mergedConfig.agents?.list?.find(a => a.id === 'content-writer')?.enabled !== false,
      product: mergedConfig.agents?.list?.find(a => a.id === 'product-expert')?.enabled !== false,
      analytics: true,
      intelligence: true,
      productPass: mergedConfig.skills?.bundled?.includes('product-pass'),
      service: true,
      settings: true,
    },
    features: {
      darkMode: mergedConfig.ui?.theme === 'dark',
      semanticSearch: true,
      graphVisualization: true,
      aiAssistant: true,
    },
    
    // Status
    loading,
    error,
    connected,
  };

  // Apply theme colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const branding = mergedConfig.ui?.branding || {};
    
    if (branding.primaryColor) {
      root.style.setProperty('--color-primary', branding.primaryColor);
    }
    if (branding.accentColor) {
      root.style.setProperty('--color-accent', branding.accentColor);
    }
  }, [mergedConfig.ui?.branding]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Helper hooks
export const useBranding = () => useConfig().branding;
export const useModules = () => useConfig().modules;
export const useFeatures = () => useConfig().features;
export const useInstance = () => useConfig().instance;
export const useAgents = () => useConfig().getAgents?.() || [];
export const useWorkflows = () => useConfig().getWorkflows?.() || [];
export const useNavigation = () => useConfig().getNavigation?.() || { main: [], core: [], data: [], business: [] };

export default ConfigProvider;
