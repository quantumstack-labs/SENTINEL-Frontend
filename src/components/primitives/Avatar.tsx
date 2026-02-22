import { cn } from '@/lib/utils';

export type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  gradient?: string; // Tailwind gradient classes
  size?: AvatarSize;
  className?: string;
}

export function Avatar({
  initials,
  gradient = 'from-amber-400 to-orange-500',
  size = 'md',
  className,
}: AvatarProps) {
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center',
      'font-mono font-bold text-black flex-shrink-0',
      `bg-gradient-to-br ${gradient}`,
      size === 'sm' && 'w-7 h-7 text-[11px]',
      size === 'md' && 'w-8 h-8 text-[12px]',
      size === 'lg' && 'w-10 h-10 text-[14px]',
      className
    )}>
      {initials}
    </div>
  );
}
