import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCommitments } from '@/hooks/useData';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, MessageSquare, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AlertsPage() {
    const { data: commitments, isLoading } = useCommitments();
    const [filter, setFilter] = useState<'all' | 'at-risk' | 'watch'>('all');

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-text-secondary animate-pulse font-mono">Loading alerts...</div>
                </div>
            </DashboardLayout>
        );
    }

    const filteredAlerts = commitments.filter(c => {
        if (filter === 'all') return c.risk === 'at-risk' || c.risk === 'watch';
        return c.risk === filter;
    });

    const stats = {
        atRisk: commitments.filter(c => c.risk === 'at-risk').length,
        watch: commitments.filter(c => c.risk === 'watch').length,
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl text-text-primary">Alert Center</h1>
                        <p className="text-text-secondary mt-1">Real-time triage of execution risks and commitment gaps.</p>
                    </div>

                    <div className="flex bg-surface-2 p-1 rounded-xl border border-border-soft">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                                filter === 'all' ? "bg-amber-primary text-bg shadow-lg shadow-amber-primary/20" : "text-text-tertiary hover:text-text-secondary"
                            )}
                        >
                            All Signals ({stats.atRisk + stats.watch})
                        </button>
                        <button
                            onClick={() => setFilter('at-risk')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                                filter === 'at-risk' ? "bg-risk text-white shadow-lg shadow-risk/20" : "text-text-tertiary hover:text-text-secondary"
                            )}
                        >
                            At Risk ({stats.atRisk})
                        </button>
                        <button
                            onClick={() => setFilter('watch')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                                filter === 'watch' ? "bg-watch text-bg shadow-lg shadow-watch/20" : "text-text-tertiary hover:text-text-secondary"
                            )}
                        >
                            Watch ({stats.watch})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredAlerts.map((alert) => (
                            <motion.div
                                key={alert.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <GlassCard className={cn(
                                    "p-5 flex flex-col md:flex-row items-start md:items-center gap-6 border-white/5 hover:border-white/10 transition-all group",
                                    alert.risk === 'at-risk' ? "bg-risk/5 border-l-4 border-l-risk" : "bg-watch/5 border-l-4 border-l-watch"
                                )}>
                                    {/* Status Icon */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                        alert.risk === 'at-risk' ? "bg-risk/10 text-risk" : "bg-watch/10 text-watch"
                                    )}>
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                                                alert.risk === 'at-risk' ? "bg-risk/20 text-risk" : "bg-watch/20 text-watch"
                                            )}>
                                                {alert.risk.replace('-', ' ')}
                                            </span>
                                            <span className="text-text-tertiary text-xs flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                Due {new Date(alert.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold text-text-primary group-hover:text-amber-primary transition-colors truncate">
                                            {alert.description}
                                        </h3>
                                        <p className="text-sm text-text-secondary mt-1 flex items-center gap-2 italic opacity-80 backdrop-blur-sm">
                                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                            "{alert.quote}"
                                        </p>
                                    </div>

                                    {/* Owner */}
                                    <div className="flex items-center gap-3 px-4 border-l border-white/5 h-12">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white shadow-lg",
                                            alert.owner.avatarGradient
                                        )}>
                                            {alert.owner.initials}
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-xs font-bold text-text-primary leading-none">{alert.owner.name}</p>
                                            <p className="text-[10px] text-text-tertiary mt-1 uppercase tracking-wide">Owner</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:bg-amber-primary hover:text-bg transition-all hover:scale-105 active:scale-95" title="Triage Signal">
                                            <ShieldAlert className="w-5 h-5" />
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-text-primary hover:bg-white/10 transition-all group/btn">
                                            RESOLVE
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredAlerts.length === 0 && (
                        <div className="py-20 text-center glass-frosted rounded-3xl border border-white/5">
                            <div className="w-16 h-16 bg-safe/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-safe/20">
                                <CheckCircle2 className="w-8 h-8 text-safe" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary">No active risks detected</h3>
                            <p className="text-text-secondary text-sm mt-1">All commitments are currently on track. Great work!</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
