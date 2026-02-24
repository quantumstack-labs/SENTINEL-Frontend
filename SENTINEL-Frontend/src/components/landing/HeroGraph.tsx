import { motion } from 'motion/react';

export default function HeroGraph() {
  // Simplified nodes for landing page
  const nodes = [
    { id: 'AK', x: 230, y: 60, color: '#FFB800', delay: 0 }, // Top Center (Watch)
    { id: 'SM', x: 100, y: 150, color: '#34D399', delay: 0.3 }, // Left Middle
    { id: 'PR', x: 360, y: 150, color: '#34D399', delay: 0.6 }, // Right Middle
    { id: 'DV', x: 230, y: 220, color: '#FF4444', delay: 0.9 }, // Center (Risk)
    { id: 'NA', x: 100, y: 350, color: '#34D399', delay: 1.2 }, // Bottom Left
    { id: 'KS', x: 230, y: 350, color: '#34D399', delay: 1.5 }, // Bottom Center
    { id: 'RT', x: 360, y: 350, color: '#34D399', delay: 1.8 }, // Bottom Right
  ];

  const edges = [
    { from: 'AK', to: 'SM', color: '#FFB800', type: 'normal' },
    { from: 'AK', to: 'PR', color: '#FFB800', type: 'normal' },
    { from: 'AK', to: 'DV', color: '#FF4444', type: 'blocked' }, // The drama
    { from: 'DV', to: 'NA', color: '#FF4444', type: 'blocked' }, // Cascade
    { from: 'SM', to: 'KS', color: '#34D399', type: 'normal' },
    { from: 'PR', to: 'RT', color: '#34D399', type: 'normal' },
  ];

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 460 480" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="hero-risk-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,68,68,0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from)!;
          const to = nodes.find(n => n.id === edge.to)!;
          
          // Simple curve logic
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2 - 40;
          const d = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;

          return (
            <g key={i}>
              <path
                d={d}
                stroke={edge.color}
                strokeWidth={edge.type === 'blocked' ? 2 : 1.5}
                strokeOpacity={edge.type === 'blocked' ? 0.6 : 0.3}
                fill="none"
                strokeDasharray={edge.type === 'blocked' ? '5 5' : '8 5'}
                className={edge.type === 'blocked' ? 'animate-[dash-flow_2s_linear_infinite]' : 'animate-[dash-flow_3s_linear_infinite]'}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.g 
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: node.delay }}
          >
            <motion.g
              animate={{ y: [-8, 0, -8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
            >
              {/* Risk Glow */}
              {node.color === '#FF4444' && (
                <circle cx={node.x} cy={node.y} r="80" fill="url(#hero-risk-glow)" className="animate-pulse" />
              )}

              {/* Node Body */}
              <circle cx={node.x} cy={node.y} r="28" fill={node.color} fillOpacity="0.1" stroke={node.color} strokeWidth="1.5" />
              <text x={node.x} y={node.y + 5} textAnchor="middle" fill={node.color} className="font-mono text-[12px] font-bold">
                {node.id}
              </text>
            </motion.g>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
