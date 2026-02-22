import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

type GlassCardVariant = 'default' | 'elevated' | 'amber';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  hover?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function GlassCard({
  variant = 'default',
  className,
  children,
  onClick,
  hover = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      {...props}
      className={cn(
        // Base
        'backdrop-blur-xl',
        'transition-[border-color,background-color,transform,box-shadow]',
        'duration-150',

        // Default
        variant === 'default' && [
          'bg-glass-bg',
          'border border-glass-border',
          'rounded-2xl',
          hover && [
            'hover:bg-white/[0.06]',
            'hover:border-white/[0.14]',
            'hover:-translate-y-0.5',
            'cursor-pointer',
          ],
        ],

        // Elevated
        variant === 'elevated' && [
          'bg-white/[0.07]',
          'backdrop-blur-2xl',
          'border border-white/[0.12]',
          'rounded-[20px]',
        ],

        // Amber active
        variant === 'amber' && [
          'bg-glass-amber',
          'border border-glass-amber-border',
          'rounded-2xl',
        ],

        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
