import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'full' | 'icon' | 'vertical';
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className,
    size = 'md',
    variant = 'full',
    showText = true,
}) => {
    const sizeMap = {
        sm: { icon: 24, text: 'text-lg' },
        md: { icon: 32, text: 'text-2xl' },
        lg: { icon: 48, text: 'text-4xl' },
        xl: { icon: 64, text: 'text-6xl' },
    };

    const { icon: iconSize, text: textSize } = sizeMap[size];

    const IconSvg = () => (
        <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
        >
            {/* Hexagon Base */}
            <path
                d="M50 5L89.5 27.5V72.5L50 95L10.5 72.5V27.5L50 5Z"
                fill="#0A0A0A"
                stroke="#8B5CF6"
                strokeWidth="2"
            />

            {/* Hexagon Inner Details */}
            <path
                d="M50 15L80 32V68L50 85L20 68V32L50 15Z"
                stroke="#8B5CF6"
                strokeOpacity="0.2"
                strokeWidth="1"
            />

            {/* Eye Shape */}
            <path
                d="M25 50C25 50 35 35 50 35C65 35 75 50 75 50C75 50 65 65 50 65C35 65 25 50 25 50Z"
                stroke="#8B5CF6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Pupil Pupil Glow */}
            <circle cx="50" cy="50" r="12" fill="#F59E0B" fillOpacity="0.2" />
            <circle cx="50" cy="50" r="8" fill="#F59E0B" />

            {/* Pupil Highlight */}
            <circle cx="47" cy="47" r="2" fill="white" fillOpacity="0.6" />

            {/* Crosshair Lines */}
            <line x1="50" y1="38" x2="50" y2="42" stroke="#F59E0B" strokeWidth="1" />
            <line x1="50" y1="58" x2="50" y2="62" stroke="#F59E0B" strokeWidth="1" />
            <line x1="38" y1="50" x2="42" y2="50" stroke="#F59E0B" strokeWidth="1" />
            <line x1="58" y1="50" x2="62" y2="50" stroke="#F59E0B" strokeWidth="1" />
        </svg>
    );

    if (variant === 'icon') {
        return <div className={cn("inline-flex items-center justify-center", className)}><IconSvg /></div>;
    }

    if (variant === 'vertical') {
        return (
            <div className={cn("inline-flex flex-col items-center gap-4 text-center", className)}>
                <IconSvg />
                {showText && (
                    <div className="flex flex-col items-center">
                        <span className={cn("font-display font-bold tracking-[0.15em] text-white uppercase", textSize)}>
                            SENTINEL
                        </span>
                        <div className="flex flex-col items-center mt-1">
                            <span className="text-[10px] tracking-[0.3em] font-medium text-text-tertiary uppercase">
                                EXECUTION INTELLIGENCE
                            </span>
                            <div className="w-12 h-[2px] bg-amber-primary mt-0.5" />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default: Horizontal 'full'
    return (
        <div className={cn("inline-flex items-center gap-4", className)}>
            <IconSvg />
            {showText && (
                <div className="flex flex-col leading-none">
                    <span className={cn("font-display font-bold tracking-[0.1em] text-white uppercase", textSize)}>
                        SENTINEL
                    </span>
                    <div className="flex flex-col mt-1">
                        <span className="text-[8px] tracking-[0.2em] font-medium text-text-tertiary uppercase">
                            EXECUTION INTELLIGENCE
                        </span>
                        <div className="w-full h-[1.5px] bg-amber-primary mt-0.5" />
                    </div>
                </div>
            )}
        </div>
    );
};
