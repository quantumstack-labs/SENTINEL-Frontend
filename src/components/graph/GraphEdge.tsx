import { GraphEdge } from '@/types';
import { motion } from 'motion/react';

interface GraphEdgeProps {
  edge: GraphEdge;
  from: { x: number; y: number };
  to: { x: number; y: number };
  isDimmed: boolean;
}

export default function GraphEdgeComponent({ edge, from, to, isDimmed }: GraphEdgeProps) {
  // Calculate quadratic bezier control point
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Pull control point perpendicular to the edge
  // For edges going downward, pull up. For sideways, adjust.
  const curvature = Math.min(dist * 0.3, 80);
  // Simple logic: if mostly vertical, curve horizontal. If mostly horizontal, curve vertical.
  // The PDF example uses a specific calculation, let's approximate "pull upward for arc"
  // midY = (y1 + y2) / 2 - 60

  // Using the PDF's specific hardcoded paths logic might be better if we had exact coords,
  // but since we have dynamic coords in mock-data, let's use a consistent curve function.
  // PDF says: "Control point pulled toward the center and upward"

  // Let's implement the `calculateEdgePath` logic from PDF page 129
  // const cpX = midX - (dy / dist) * curvature
  // const cpY = midY + (dx / dist) * curvature
  // But simpler: just pull Y up for a nice arc
  const cpX = midX;
  const cpY = midY - 60;

  // Special case for straight line AK -> DV (e3 in mock data)
  const isStraight = edge.type === 'blocked' && edge.id === 'e3';

  const path = isStraight
    ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`;

  // Calculate midpoint for blocked indicator
  // De Casteljau at t=0.5
  const t = 0.5;
  const mpX = isStraight
    ? (from.x + to.x) / 2
    : (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cpX + t * t * to.x;
  const mpY = isStraight
    ? (from.y + to.y) / 2
    : (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cpY + t * t * to.y;

  return (
    <g className="transition-opacity duration-300" style={{ opacity: isDimmed ? 0.08 : 1 }}>
      {/* Base Line */}
      <path
        d={path}
        stroke={edge.type === 'blocked' ? 'rgba(255, 68, 68, 0.65)' : 'rgba(245, 166, 35, 0.40)'}
        strokeWidth={edge.type === 'blocked' ? 2 : 1.5}
        fill="none"
        strokeDasharray={edge.type === 'blocked' ? '5 5' : '8 5'}
        className={edge.type === 'blocked' ? 'animate-[dash-flow_2s_linear_infinite]' : 'animate-[dash-flow_3s_linear_infinite]'}
      />

      {/* Flow Animation (only for normal edges) */}
      {edge.type !== 'blocked' && !isDimmed && (
        <motion.path
          d={path}
          stroke="rgba(245, 166, 35, 0.8)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 20"
          initial={{ strokeDashoffset: 24 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Blocked Indicator */}
      {edge.type === 'blocked' && (
        <circle
          cx={mpX}
          cy={mpY}
          r={7}
          fill="none"
          stroke="#FF4444"
          strokeWidth={2}
          className="animate-[edge-break-pulse_1.5s_ease-in-out_infinite]"
        />
      )}
    </g>
  );
}
