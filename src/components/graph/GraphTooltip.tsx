import { GlassCard } from '@/components/glass/GlassCard';
import { Badge } from '@/components/primitives/Badge';
import { Avatar } from '@/components/primitives/Avatar';
import { GraphNode, Commitment } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

interface GraphTooltipProps {
  node: GraphNode;
  commitment?: Commitment; // highest risk commitment
  position: { x: number; y: number };
}

export default function GraphTooltip({ node, commitment, position }: GraphTooltipProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -8, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          position: 'absolute', 
          left: position.x + 16, 
          top: position.y,
          transform: 'translateY(-50%)',
          zIndex: 50,
          pointerEvents: 'none'
        }}
      >
        <GlassCard variant="elevated" className="w-[220px] p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar initials={node.initials} size="sm" />
            <div>
              <div className="text-sm font-bold text-text-primary">{node.name}</div>
              <Badge 
                variant={node.status === 'at-risk' ? 'risk' : node.status === 'watch' ? 'watch' : 'ok'} 
                label={node.status === 'at-risk' ? 'At Risk' : node.status === 'watch' ? 'Watch' : 'On Track'} 
                className="mt-1"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 my-3" />

          {/* Stats */}
          <div className="space-y-2">
            <div className="font-mono text-xs text-text-secondary">
              {node.commitmentCount} open commitments
            </div>
            {node.highestRiskItem && (
              <div className="text-[13px] text-text-secondary leading-snug">
                {node.highestRiskItem}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
