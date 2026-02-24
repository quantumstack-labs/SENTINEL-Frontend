import { GlassCard } from '@/components/glass/GlassCard';
import { cn } from '@/lib/utils';
import { DashView } from '@/hooks/useDashboardView';

interface DashboardTabsProps {
  currentView: DashView;
  onChange: (view: DashView) => void;
}

export default function DashboardTabs({ currentView, onChange }: DashboardTabsProps) {
  const tabs: { id: DashView; label: string }[] = [
    { id: 'brief', label: 'Brief' },
    { id: 'graph', label: 'Graph' },
    { id: 'table', label: 'All Commitments' },
  ];

  return (
    <GlassCard className="p-1 flex gap-1 bg-surface-2/50 rounded-lg border border-border-medium w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
            currentView === tab.id
              ? "bg-surface-3 text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          )}
        >
          {tab.label}
        </button>
      ))}
    </GlassCard>
  );
}
