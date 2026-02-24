import { GlassCard } from '@/components/glass/GlassCard';

export default function GraphLegend() {
  return (
    <div className="absolute bottom-5 left-5 z-10">
      <GlassCard className="px-4 py-3 flex gap-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe" />
          <span className="font-mono text-[11px] text-text-secondary">On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-watch" />
          <span className="font-mono text-[11px] text-text-secondary">Watch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-risk animate-pulse" />
          <span className="font-mono text-[11px] text-text-secondary">At Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-risk border-t border-b border-risk/50 border-dashed" />
          <span className="font-mono text-[11px] text-text-secondary">Blocked</span>
        </div>
      </GlassCard>
    </div>
  );
}
