import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/context/DashboardContext';
import { cn } from '@/lib/utils';
import {
    Search, Command, LayoutDashboard, Network, ListTodo,
    Settings, Users, LogOut, ArrowRight, Zap,
    RefreshCw, Bell, Plus, Shield, Cpu
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CommandItem {
    id: string;
    icon: any;
    label: string;
    description: string;
    category: string;
    action: () => void;
    shortcut?: string;
}

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const navigate = useNavigate();
    const { setView } = useDashboard();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [selectedIndex]);

    const commands: CommandItem[] = [
        { id: 'brief', icon: LayoutDashboard, label: 'Daily Brief', description: 'View signals and intelligence summary', category: 'Views', action: () => { navigate('/dashboard'); setView('brief'); onClose(); }, shortcut: 'G B' },
        { id: 'graph', icon: Network, label: 'Dependency Graph', description: 'Explore visual signal network', category: 'Views', action: () => { navigate('/dashboard'); setView('graph'); onClose(); }, shortcut: 'G G' },
        { id: 'commitments', icon: ListTodo, label: 'Commitments', description: 'Review team deliverables', category: 'Views', action: () => { navigate('/dashboard'); setView('table'); onClose(); }, shortcut: 'G C' },

        {
            id: 'reset-graph', icon: RefreshCw, label: 'Reset Dependency Graph', description: 'Restore nodes to original layout', category: 'Actions', action: () => {
                // This is a mock event, in a real app would use a global event bus or context
                window.dispatchEvent(new CustomEvent('sentinel-reset-graph'));
                toast.success('Graph layout reset');
                onClose();
            }, shortcut: 'R'
        },
        {
            id: 'toggle-notifs', icon: Bell, label: 'Toggle Notifications', description: 'Show or hide alerts dropdown', category: 'Actions', action: () => {
                onClose();
                // Signal to DashboardLayout to open notifications
                window.dispatchEvent(new CustomEvent('sentinel-toggle-notifications'));
            }
        },

        { id: 'integrations', icon: Zap, label: 'Integrations', description: 'Manage Slack, Gmail, and Jira connections', category: 'Management', action: () => { navigate('/dashboard/integrations'); onClose(); }, shortcut: 'G I' },
        { id: 'members', icon: Users, label: 'Team Members', description: 'Manage project access and roles', category: 'Management', action: () => { navigate('/dashboard/members'); onClose(); }, shortcut: 'G M' },

        { id: 'settings', icon: Settings, label: 'Settings', description: 'Account and workspace configuration', category: 'System', action: () => { navigate('/settings'); onClose(); }, shortcut: 'S' },
        { id: 'security', icon: Shield, label: 'Privacy & Security', description: 'Two-factor auth and API keys', category: 'System', action: () => { navigate('/settings'); onClose(); }, shortcut: 'S S' },
        { id: 'logout', icon: LogOut, label: 'Sign Out', description: 'Safely end your session', category: 'System', action: () => { navigate('/login'); onClose(); } },
    ];

    // Enhanced Fuzzy-lite Search
    const filteredCommands = commands.filter(cmd => {
        if (!search) return true;
        const searchTerms = search.toLowerCase().split(' ').filter(t => t.length > 0);
        const targetString = `${cmd.label} ${cmd.description} ${cmd.category}`.toLowerCase();
        return searchTerms.every(term => targetString.includes(term));
    });

    const highlightMatches = (text: string, query: string) => {
        if (!query.trim()) return <span>{text}</span>;
        const words = query.trim().split(' ').filter(Boolean);
        const regex = new RegExp(`(${words.join('|')})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) => (
                    regex.test(part) ? <span key={i} className="text-amber-primary font-bold">{part}</span> : <span key={i}>{part}</span>
                ))}
            </span>
        );
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            filteredCommands[selectedIndex]?.action();
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [filteredCommands, selectedIndex, onClose]);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full max-w-xl glass-frosted rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-10"
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/10 glass-shine">
                    <Search className="w-5 h-5 text-amber-primary" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search commands, views, or settings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none text-text-primary text-sm placeholder:text-text-secondary"
                    />
                    <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-surface-3 border border-border-strong text-[10px] font-mono text-text-secondary">
                        <span className="text-[8px]">ESC</span>
                    </div>
                </div>

                {/* Results */}
                <div
                    ref={scrollContainerRef}
                    className="max-h-[380px] overflow-y-auto p-2 scrollbar-hide"
                >
                    {filteredCommands.length > 0 ? (
                        <div className="space-y-4">
                            {['Views', 'Actions', 'Management', 'System'].map(category => {
                                const categoryCmds = filteredCommands.filter(c => c.category === category);
                                if (categoryCmds.length === 0) return null;

                                return (
                                    <div key={category} className="space-y-1">
                                        <h4 className="px-3 py-1 text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                            {category === 'Actions' && <RefreshCw className="w-2.5 h-2.5" />}
                                            {category === 'Views' && <LayoutDashboard className="w-2.5 h-2.5" />}
                                            {category}
                                        </h4>
                                        {categoryCmds.map((cmd) => {
                                            const overallIndex = filteredCommands.indexOf(cmd);
                                            const isSelected = overallIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={cmd.id}
                                                    ref={isSelected ? selectedItemRef : null}
                                                    onMouseEnter={() => setSelectedIndex(overallIndex)}
                                                    onClick={cmd.action}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-left",
                                                        isSelected
                                                            ? "bg-amber-primary/10 border border-amber-primary/20 shadow-lg shadow-amber-primary/5 translate-x-1"
                                                            : "border border-transparent hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-inner",
                                                        isSelected ? "bg-amber-primary text-bg" : "bg-surface-3 text-text-secondary"
                                                    )}>
                                                        <cmd.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "text-xs font-semibold",
                                                            isSelected ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                                                        )}>
                                                            {highlightMatches(cmd.label, search)}
                                                        </p>
                                                        <p className="text-[10px] text-text-secondary font-medium truncate leading-tight mt-0.5">
                                                            {highlightMatches(cmd.description, search)}
                                                        </p>
                                                    </div>
                                                    {cmd.shortcut && (
                                                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            {cmd.shortcut.split(' ').map(key => (
                                                                <kbd key={key} className="bg-surface-3 px-1.5 py-0.5 rounded text-[9px] font-mono text-text-secondary border border-border-strong">{key}</kbd>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <ArrowRight className={cn(
                                                        "w-3 h-3 transition-all",
                                                        isSelected ? "translate-x-0 opacity-100 text-amber-primary" : "-translate-x-2 opacity-0 text-text-tertiary"
                                                    )} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-8">
                            <div className="text-center mb-8">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                                    <Search className="w-6 h-6 text-text-tertiary" />
                                </div>
                                <p className="text-sm text-text-secondary font-medium">No commands found for "{search}"</p>
                                <p className="text-xs text-text-tertiary mt-1">Try searching for something else or pick a suggestion below.</p>
                            </div>

                            <div className="px-2 space-y-1">
                                <h4 className="px-3 py-1 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Suggested Actions</h4>
                                {commands.slice(0, 3).map((cmd) => (
                                    <button
                                        key={cmd.id}
                                        onClick={cmd.action}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-white/5 transition-all group text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center group-hover:bg-amber-primary group-hover:text-bg transition-colors">
                                            <cmd.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-text-secondary group-hover:text-text-primary">{cmd.label}</p>
                                            <p className="text-[10px] text-text-tertiary truncate">{cmd.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                            <kbd className="bg-surface-3 px-1.5 rounded border border-border-medium">↑↓</kbd>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                            <kbd className="bg-surface-3 px-1.5 rounded border border-border-medium">↵</kbd>
                            <span>Select</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-text-tertiary opacity-40">
                        <Command className="w-3 h-3" />
                        <span>SENTINEL PULSE</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
