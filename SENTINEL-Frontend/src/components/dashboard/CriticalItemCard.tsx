import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/primitives/Badge';
import { Avatar } from '@/components/primitives/Avatar';
import { Commitment } from '@/types';
import { Clock, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface CriticalItemCardProps {
  commitment: Commitment;
}

export default function CriticalItemCard({ commitment }: CriticalItemCardProps) {
  const queryClient = useQueryClient();

  const nudgeMutation = useMutation({
    mutationFn: () => api.post(`/commitments/${commitment.id}/nudge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Nudge sent to ${commitment.owner.name}`, {
        style: { background: '#F5A623', color: '#000000', fontFamily: 'DM Sans', fontWeight: 500 },
        iconTheme: { primary: '#000000', secondary: '#F5A623' },
      });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to send nudge'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="p-6 border-l-[3px] border-l-risk relative overflow-hidden animate-[pulse-red_4s_ease-in-out_infinite]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-risk to-transparent opacity-50" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="risk" label="Critical" />
          <h3 className="font-display text-lg font-bold text-text-primary flex-1 truncate">
            {commitment.description}
          </h3>
          <div className="flex items-center gap-1.5 text-risk font-mono text-[13px]">
            <Clock size={14} />
            <span>4h left</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 mb-5">
          <div className="flex items-center gap-2">
            <Avatar initials={commitment.owner.initials} gradient={commitment.owner.avatarGradient} size="sm" />
            <span className="text-[13px] font-medium text-text-primary">{commitment.owner.name}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-text-secondary">
            <MessageSquare size={14} />
            <span>Source: Slack {commitment.sourceChannel}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-text-secondary">
            <span>⛓ {commitment.dependencyCount} people blocked</span>
          </div>
        </div>

        <div className="bg-surface-2 border-l-2 border-border-medium rounded-r-lg p-3 pl-4 mb-5">
          <p className="font-dm-sans text-[14px] italic text-text-secondary leading-[1.6]">
            "{commitment.quote}"
          </p>
          <p className="font-mono text-[12px] text-text-tertiary mt-2">
            — {commitment.owner.name} in [ {commitment.sourceChannel} ] · Today 10:30 AM
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => nudgeMutation.mutate()}
            disabled={nudgeMutation.isPending}
          >
            {nudgeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            {nudgeMutation.isPending ? 'Sending...' : 'Send Nudge'}
          </Button>
          <Button variant="primary" size="sm">
            View Full Context
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
