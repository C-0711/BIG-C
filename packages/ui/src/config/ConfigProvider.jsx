import React, { createContext, useContext } from 'react';
import instanceConfig from './instance';

const ConfigContext = createContext(instanceConfig);

export const ConfigProvider = ({ children, config = instanceConfig }) => {
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return config;
};

// Helper hooks
export const useBranding = () => useConfig().branding;
export const useModules = () => useConfig().modules;
export const useFeatures = () => useConfig().features;

export default ConfigProvider;
