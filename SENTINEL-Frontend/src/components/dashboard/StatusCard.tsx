import { GlassCard } from '@/components/glass/GlassCard';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface StatusCardProps {
  variant: 'at-risk' | 'watch' | 'on-track';
  count: number;
  trend: string;
  delay?: number;
}

export default function StatusCard({ variant, count, trend, delay = 0 }: StatusCardProps) {
  const displayCount = useCountUp(count, 800);

  const styles = {
    'at-risk': {
      borderTop: 'border-t-2 border-risk',
      text: 'text-risk',
      pulse: 'animate-pulse-red',
    },
    'watch': {
      borderTop: 'border-t-2 border-watch',
      text: 'text-watch',
      pulse: '',
    },
    'on-track': {
      borderTop: 'border-t-2 border-safe',
      text: 'text-safe',
      pulse: '',
    },
  };

  const labels = {
    'at-risk': 'AT RISK',
    'watch': 'WATCH',
    'on-track': 'ON TRACK',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard 
        className={cn(
          "p-[22px] h-full flex flex-col justify-between", 
          styles[variant].borderTop,
          variant === 'at-risk' && "animate-[pulse-red_3s_ease-in-out_infinite]"
        )}
        hover
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-mono text-text-tertiary tracking-[0.12em] uppercase">
            {labels[variant]}
          </span>
        </div>
        
        <div className="mt-4">
          <div className={cn("font-display text-[40px] font-bold leading-none", styles[variant].text)}>
            {displayCount}
          </div>
          <div className="text-xs text-text-tertiary mt-2 font-dm-sans">
            {trend}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
