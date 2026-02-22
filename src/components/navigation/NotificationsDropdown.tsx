import { motion } from 'motion/react';
import { GlassCard } from '../glass/GlassCard';
import { Bell, Check, Info, AlertCircle, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'signal' | 'risk' | 'info';
    unread: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'New Signal Extracted',
        description: 'Divya V. committed to "API Documentation" via Slack.',
        time: '4m ago',
        type: 'signal',
        unread: true,
    },
    {
        id: '2',
        title: 'High Risk Detected',
        description: 'Sprint planning doc is 2 days overdue.',
        time: '2h ago',
        type: 'risk',
        unread: true,
    },
    {
        id: '3',
        title: 'System Sync Complete',
        description: 'All 3 active integrations synced successfully.',
        time: '5h ago',
        type: 'info',
        unread: false,
    },
];

interface NotificationsDropdownProps {
    onClose: () => void;
}

export default function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-12 right-0 w-80 z-50 shadow-2xl origin-top-right"
        >
            <div className="glass-frosted border border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03] glass-shine">
                    <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                    <button className="text-[10px] font-mono text-amber-text hover:text-amber-primary transition-colors">
                        MARK ALL READ
                    </button>
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                    {mockNotifications.length > 0 ? (
                        <div className="divide-y divide-border-soft">
                            {mockNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-4 hover:bg-white/[0.08] transition-colors cursor-pointer relative group border-b border-white/5 last:border-0",
                                        n.unread && "bg-amber-primary/[0.04]"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                            n.type === 'signal' && "bg-amber-primary/10 text-amber-primary",
                                            n.type === 'risk' && "bg-risk/10 text-risk",
                                            n.type === 'info' && "bg-surface-3 text-text-tertiary"
                                        )}>
                                            {n.type === 'signal' && <Signal className="w-4 h-4" />}
                                            {n.type === 'risk' && <AlertCircle className="w-4 h-4" />}
                                            {n.type === 'info' && <Info className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="text-xs font-semibold text-text-primary truncate">
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-text-secondary font-medium whitespace-nowrap ml-2">{n.time}</span>
                                            </div>
                                            <p className="text-[11px] text-text-secondary leading-normal line-clamp-2 mt-0.5">
                                                {n.description}
                                            </p>
                                        </div>
                                    </div>
                                    {n.unread && (
                                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-xs text-text-tertiary italic">No new notifications</p>
                        </div>
                    )}
                </div>

                <div className="p-2 bg-white/[0.02] border-t border-white/10">
                    <button className="w-full py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
                        View All Activity
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
