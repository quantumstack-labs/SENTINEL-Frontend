import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass/GlassCard';
import { useCountUp } from '@/hooks/useCountUp';

interface ScoreBarProps {
  score: number;
  trend?: 'up' | 'down' | 'flat';
  delta: number;
  status: 'stable' | 'watch' | 'at-risk';
}

export default function ScoreBar({ score, trend, delta, status }: ScoreBarProps) {
  const displayScore = useCountUp(score, 800);
  const displayDelta = useCountUp(Math.abs(delta), 600, 400);

  const statusColors = {
    stable: 'text-safe',
    watch: 'text-watch',
    'at-risk': 'text-risk',
  };

  const statusLabels = {
    stable: 'STABLE',
    watch: 'WATCH',
    'at-risk': 'AT RISK',
  };

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <GlassCard className="p-6 relative overflow-hidden group">
      <div className="flex justify-between items-end mb-4 relative z-10">
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-1">Execution Health Score</h3>
          <div className="flex items-baseline gap-3">
            <span className={cn("font-display text-5xl font-bold", statusColors[status])}>
              {displayScore}
            </span>
            <div className="flex flex-col">
              <span className={cn("text-[10px] font-mono tracking-[0.12em] uppercase", statusColors[status])}>
                {statusLabels[status]}
              </span>
              <span className="text-xs text-text-tertiary font-mono mt-0.5">
                {trendIcon} {displayDelta} from yesterday
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-amber-primary"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      
      {/* Markers */}
      <div className="flex justify-between mt-2 text-[10px] font-mono text-text-tertiary">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </GlassCard>
  );
}
