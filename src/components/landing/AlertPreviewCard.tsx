import { GlassCard } from '@/components/glass/GlassCard';
import { motion } from 'motion/react';

export default function AlertPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-10 -left-5 z-20"
    >
      <motion.div
        animate={{ y: [-8, 0, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <GlassCard variant="elevated" className="w-[280px] p-[18px] border-t border-t-risk/30 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-2 h-2 rounded-full bg-risk animate-[pulse-red_1.5s_infinite]" />
            <span className="font-mono text-[10px] text-risk tracking-[0.10em] uppercase font-medium">
              Sentinel Alert
            </span>
          </div>

          {/* Content */}
          <div className="font-dm-sans text-[13px] text-text-secondary leading-relaxed mb-4">
            <span className="font-bold text-text-primary">Divya</span> — API docs promised by today.
            <br />
            3 teammates blocked. Sprint review in 4h.
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <div className="flex-1 h-8 rounded-lg border border-border-medium flex items-center justify-center text-[11px] text-text-secondary hover:bg-white/5 cursor-pointer transition-colors">
              I'm On It
            </div>
            <div className="flex-1 h-8 rounded-lg bg-amber-dim border border-amber-primary/20 flex items-center justify-center text-[11px] text-amber-text font-medium cursor-pointer hover:bg-amber-dim/80 transition-colors">
              Draft Update
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
