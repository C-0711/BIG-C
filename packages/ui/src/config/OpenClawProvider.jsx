import React, { createContext, useContext } from 'react';
import { useOpenClaw } from '../hooks/useOpenClaw';

const OpenClawContext = createContext(null);

export function OpenClawProvider({ children }) {
  const openclaw = useOpenClaw();
  
  return (
    <OpenClawContext.Provider value={openclaw}>
      {children}
    </OpenClawContext.Provider>
  );
}

export function useOpenClawContext() {
  const context = useContext(OpenClawContext);
  if (!context) {
    throw new Error('useOpenClawContext must be used within OpenClawProvider');
  }
  return context;
}

export default OpenClawProvider;
