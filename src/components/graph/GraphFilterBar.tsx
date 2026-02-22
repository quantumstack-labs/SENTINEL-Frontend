import { GlassCard } from '@/components/glass/GlassCard';
import { cn } from '@/lib/utils';

export type GraphFilter = 'all' | 'at-risk' | 'blocked' | 'my-team';

interface GraphFilterBarProps {
  activeFilter: GraphFilter;
  onFilterChange: (filter: GraphFilter) => void;
}

export default function GraphFilterBar({ activeFilter, onFilterChange }: GraphFilterBarProps) {
  const filters: { id: GraphFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'at-risk', label: 'At Risk' },
    { id: 'blocked', label: 'Blocked' },
    { id: 'my-team', label: 'My Team' },
  ];

  return (
    <div className="absolute top-5 left-5 z-10 flex gap-2">
      {filters.map((filter) => (
        <GlassCard
          key={filter.id}
          variant={activeFilter === filter.id ? 'amber' : 'default'}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200",
            activeFilter === filter.id 
              ? "text-amber-text border-amber-primary/30" 
              : "text-text-secondary hover:text-text-primary hover:border-white/20"
          )}
        >
          {filter.label}
        </GlassCard>
      ))}
    </div>
  );
}
