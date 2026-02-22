import { GraphNode } from '@/types';
import { motion } from 'motion/react';

interface GraphNodeProps {
  node: GraphNode;
  isHovered: boolean;
  isDimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDrag?: (id: string, x: number, y: number) => void;
}

export default function GraphNodeComponent({
  node,
  isHovered,
  isDimmed,
  onMouseEnter,
  onMouseLeave,
  onDrag
}: GraphNodeProps) {
  const statusColors = {
    'on-track': {
      fill: 'rgba(52, 211, 153, 0.15)',
      stroke: '#34D399',
      text: '#34D399',
    },
    'watch': {
      fill: 'rgba(255, 184, 0, 0.15)',
      stroke: '#FFB800',
      text: '#FFB800',
    },
    'at-risk': {
      fill: 'rgba(255, 68, 68, 0.15)',
      stroke: '#FF4444',
      text: '#FF4444',
    },
  };

  const colors = statusColors[node.status];

  return (
    <motion.g
      drag
      dragMomentum={false}
      onDrag={(_, info) => {
        if (onDrag) {
          onDrag(node.id, node.x + info.delta.x, node.y + info.delta.y);
        }
      }}
      animate={{
        x: node.x,
        y: node.y,
        opacity: isDimmed ? 0.2 : 1,
        scale: isHovered ? 1.08 : 1
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onMouseEnter}
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.3 }
      }}
      className="cursor-pointer active:cursor-grabbing"
    >
      {/* Outer Pulse Ring (At Risk only) */}
      {node.status === 'at-risk' && (
        <circle
          r="52"
          stroke={colors.stroke}
          strokeOpacity="0.2"
          fill="none"
          className="animate-[pulse-red_3s_ease-in-out_infinite]"
        />
      )}

      {/* Hover Ring */}
      <motion.circle
        r="52"
        stroke={colors.stroke}
        strokeWidth="1"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.4 : 0 }}
      />

      {/* Border Ring */}
      <circle
        r="40"
        stroke={colors.stroke}
        strokeWidth={node.status === 'at-risk' ? 2.5 : 2}
        fill="none"
      />

      {/* Inner Circle */}
      <circle
        r="40"
        fill={colors.fill}
      />

      {/* Initials */}
      <text
        x="0"
        y="5"
        textAnchor="middle"
        fill={colors.text}
        className="font-mono text-[16px] font-semibold select-none pointer-events-none"
      >
        {node.initials}
      </text>

      {/* Label */}
      <foreignObject x="-60" y="50" width="120" height="60">
        <div className="flex flex-col items-center text-center">
          <span className="font-dm-sans text-[12px] text-text-secondary font-medium bg-bg/80 px-2 rounded-md backdrop-blur-sm">
            {node.name}
          </span>
          {node.status === 'at-risk' && (
            <span className="font-mono text-[10px] text-risk mt-1 bg-risk-dim/80 px-1.5 py-0.5 rounded border border-risk/20 backdrop-blur-sm">
              ⚠ AT RISK
            </span>
          )}
        </div>
      </foreignObject>
    </motion.g>
  );
}
