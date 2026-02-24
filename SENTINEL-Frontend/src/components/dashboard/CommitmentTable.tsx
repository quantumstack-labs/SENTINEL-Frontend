import { GlassCard } from '@/components/glass/GlassCard';
import { Badge } from '@/components/primitives/Badge';
import { Avatar } from '@/components/primitives/Avatar';
import { Button } from '@/components/ui/Button';
import { Commitment } from '@/types';
import { ArrowUpDown, Filter, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface CommitmentTableProps {
  commitments: Commitment[];
}

export default function CommitmentTable({ commitments }: CommitmentTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      <GlassCard className="p-0 overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center bg-surface-2/30">
          <h3 className="font-display text-[15px] text-text-primary">All Commitments</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <Filter size={14} className="mr-1.5" /> Filter
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <Download size={14} className="mr-1.5" /> Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {['Owner', 'Commitment', 'Source', 'Due', 'Risk', 'Action'].map((header) => (
                  <th 
                    key={header}
                    className="px-5 py-3 font-mono text-[10px] text-text-tertiary uppercase tracking-[0.10em] font-medium border-b border-border-soft whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1 cursor-pointer hover:text-text-secondary transition-colors">
                      {header}
                      {header === 'Risk' && <ArrowUpDown size={10} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commitments.map((commitment) => (
                <tr 
                  key={commitment.id} 
                  className="group hover:bg-white/[0.03] transition-colors border-b border-border-soft last:border-0"
                >
                  <td className="px-5 py-[14px]">
                    <div className="flex items-center gap-2">
                      <Avatar 
                        initials={commitment.owner.initials} 
                        gradient={commitment.owner.avatarGradient} 
                        size="sm" 
                      />
                      <span className="text-[13px] font-medium text-text-primary whitespace-nowrap">
                        {commitment.owner.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-[14px]">
                    <div className="text-[13px] text-text-secondary truncate max-w-[240px]">
                      {commitment.description}
                    </div>
                  </td>
                  <td className="px-5 py-[14px]">
                    <span className="font-mono text-[11px] text-text-tertiary">
                      {commitment.source === 'slack' ? '#' : ''}{commitment.sourceChannel}
                    </span>
                  </td>
                  <td className="px-5 py-[14px]">
                    <span className={cn(
                      "font-mono text-[12px]",
                      commitment.risk === 'at-risk' ? "text-risk" : 
                      commitment.risk === 'watch' ? "text-watch" : "text-text-tertiary"
                    )}>
                      {new Date(commitment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-5 py-[14px]">
                    <Badge 
                      variant={commitment.risk === 'at-risk' ? 'risk' : commitment.risk === 'watch' ? 'watch' : 'ok'} 
                      label={commitment.risk === 'at-risk' ? 'At Risk' : commitment.risk === 'watch' ? 'Watch' : 'On Track'} 
                    />
                  </td>
                  <td className="px-5 py-[14px]">
                    {commitment.risk !== 'on-track' ? (
                      <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2">
                        Nudge
                      </Button>
                    ) : (
                      <span className="text-text-tertiary text-xs pl-2">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// Helper for cn
import { cn } from '@/lib/utils';
