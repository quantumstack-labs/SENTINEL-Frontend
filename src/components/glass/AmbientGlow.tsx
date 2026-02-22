import { cn } from '@/lib/utils';

type GlowColor = 'amber' | 'red' | 'green';

interface AmbientGlowProps {
  color?: GlowColor;
  size?: number; // diameter in px
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

const glowColors = {
  amber: 'rgba(245, 166, 35,',
  red: 'rgba(255, 68, 68,',
  green: 'rgba(52, 211, 153,',
};

export function AmbientGlow({
  color = 'amber',
  size = 600,
  opacity = 0.06,
  className,
  style,
}: AmbientGlowProps) {
  const colorBase = glowColors[color];
  
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute rounded-full pointer-events-none -z-10',
        className
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(
          circle,
          ${colorBase}${opacity}) 0%,
          transparent 70%
        )`,
        ...style,
      }}
    />
  );
}
