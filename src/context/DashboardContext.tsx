import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DashView = 'brief' | 'graph' | 'table';

interface DashboardContextType {
  view: DashView;
  setView: (view: DashView) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<DashView>('brief');

  return (
    <DashboardContext.Provider value={{ view, setView }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
