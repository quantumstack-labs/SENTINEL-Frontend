import { motion } from 'motion/react';
import { GlassCard } from '../glass/GlassCard';
import { Settings, LogOut, User, Shield, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
    onClose: () => void;
}

export default function UserMenu({ onClose }: UserMenuProps) {
    const menuItems = [
        { icon: User, label: 'Profile Settings', description: 'Manage your account and preferences' },
        { icon: Shield, label: 'Security', description: 'Two-factor auth and API keys' },
        { icon: Zap, label: 'Billing & Plan', description: 'Pro Plan — Next sync March 1', badge: 'PRO' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-12 right-0 w-72 z-50 shadow-2xl origin-top-right"
        >
            <div className="glass-frosted border border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl">
                {/* Profile Header */}
                <div className="p-4 bg-white/[0.03] border-b border-white/10 glass-shine">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-primary to-orange-600 flex items-center justify-center text-bg font-bold text-base shadow-lg shadow-amber-primary/20">
                            AK
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">Arjun K.</p>
                            <p className="text-xs text-text-secondary truncate">arjun@acme.corp</p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.label}
                                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all group text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-text-tertiary group-hover:text-amber-primary transition-colors">
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-text-primary transition-colors">
                                            {item.label}
                                        </span>
                                        {item.badge && (
                                            <span className="bg-amber-primary/10 text-amber-primary text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-primary/20">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-text-secondary truncate mt-0.5">{item.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="my-2 h-[1px] bg-border-soft" />

                    <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-risk/10 transition-all group text-left">
                        <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-text-tertiary group-hover:text-risk transition-colors">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-text-secondary group-hover:text-risk transition-colors">
                            Sign Out
                        </span>
                    </button>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-text-tertiary">v1.2.4-stable</span>
                    <button className="text-[10px] font-medium text-amber-text flex items-center gap-1 hover:text-amber-primary transition-colors">
                        HELP CENTER <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
