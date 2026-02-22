import { useState } from 'react';

export type DashView = 'brief' | 'graph' | 'table';

export function useDashboardView() {
  const [view, setView] = useState<DashView>('brief');
  return { view, setView };
}
