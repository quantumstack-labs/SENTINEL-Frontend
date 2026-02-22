import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

export type BadgeVariant = 'risk' | 'watch' | 'ok' | 'cyan' | 'locked';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

export function Badge({ variant, label, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5',
      'px-2.5 py-[3px] rounded-full',
      'text-[11px] font-mono font-medium',
      'tracking-[0.06em] uppercase',
      'border',
      variant === 'risk' && [
        'bg-risk-dim text-risk border-risk/20',
      ],
      variant === 'watch' && [
        'bg-watch-dim text-watch border-watch/20',
      ],
      variant === 'ok' && [
        'bg-safe-dim text-safe border-safe/20',
      ],
      variant === 'cyan' && [
        'bg-cyan-400/10 text-cyan-400',
        'border-cyan-400/20',
      ],
      variant === 'locked' && [
        'bg-safe-dim text-safe border-safe/20',
      ],
      className
    )}>
      {variant === 'locked' && <Lock size={9} />}
      {label}
    </span>
  );
}
