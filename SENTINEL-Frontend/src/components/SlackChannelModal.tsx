import { useState, useEffect, useMemo } from 'react';
import { X, Search, Hash, Lock, Loader2, Users, Check } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SlackChannel {
    id: string;
    name: string;
    isPrivate: boolean;
    isMember: boolean;
    numMembers: number;
}

interface SlackChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentChannels?: string[];
}

export default function SlackChannelModal({ isOpen, onClose, currentChannels = [] }: SlackChannelModalProps) {
    const queryClient = useQueryClient();
    const [channels, setChannels] = useState<SlackChannel[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set(currentChannels));
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setError('');

        api.get<SlackChannel[]>('/integrations/slack/channels')
            .then((data) => {
                setChannels(data);
                // Pre-select channels that were already saved
                if (currentChannels.length > 0) {
                    setSelected(new Set(currentChannels));
                }
            })
            .catch((err) => {
                setError(err?.message || 'Failed to fetch channels. Is Slack connected?');
            })
            .finally(() => setLoading(false));
    }, [isOpen]);

    const filtered = useMemo(() => {
        if (!search.trim()) return channels;
        const q = search.toLowerCase();
        return channels.filter(ch => ch.name.toLowerCase().includes(q));
    }, [channels, search]);

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        const memberChannels = channels.filter(ch => ch.isMember);
        setSelected(new Set(memberChannels.map(ch => ch.id)));
    };

    const deselectAll = () => setSelected(new Set());

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/integrations/slack/channels', {
                channel_ids: Array.from(selected),
            });
            toast.success(`Monitoring ${selected.size} channel(s)`);
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
            onClose();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save channels');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-surface-1/95 backdrop-blur-xl border border-border-medium rounded-2xl shadow-2xl shadow-black/50 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-border-soft">
                    <div>
                        <h2 className="font-display text-lg text-text-primary flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#E01E5A]/10 border border-[#E01E5A]/20">
                                <Hash className="w-4 h-4 text-[#E01E5A]" />
                            </div>
                            Configure Slack Channels
                        </h2>
                        <p className="text-xs text-text-secondary mt-1">
                            Select which channels the AI should monitor for commitments.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-surface-3 text-text-tertiary hover:text-text-primary transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Search channels..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border-soft rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-primary/40 focus:ring-1 focus:ring-amber-primary/20 transition-all"
                        />
                    </div>
                    {/* Quick actions */}
                    {!loading && !error && channels.length > 0 && (
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-text-tertiary font-mono">
                                {selected.size} of {channels.length} selected
                            </span>
                            <div className="flex gap-2">
                                <button onClick={selectAll} className="text-xs text-amber-primary hover:text-amber-primary/80 transition-colors">
                                    Select joined
                                </button>
                                <span className="text-text-tertiary">·</span>
                                <button onClick={deselectAll} className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                                    Clear all
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Channel List */}
                <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1 min-h-[200px] max-h-[400px] scrollbar-thin">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-primary" />
                            <p className="text-sm text-text-secondary">Fetching channels from Slack...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-12 h-12 rounded-full bg-risk/10 border border-risk/20 flex items-center justify-center">
                                <X className="w-6 h-6 text-risk" />
                            </div>
                            <p className="text-sm text-text-secondary text-center max-w-xs">{error}</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <Hash className="w-8 h-8 text-text-tertiary" />
                            <p className="text-sm text-text-secondary">
                                {search ? 'No channels match your search' : 'No channels found'}
                            </p>
                        </div>
                    ) : (
                        filtered.map((ch) => {
                            const isSelected = selected.has(ch.id);
                            return (
                                <button
                                    key={ch.id}
                                    onClick={() => toggle(ch.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${isSelected
                                            ? 'bg-amber-primary/10 border border-amber-primary/20'
                                            : 'hover:bg-surface-2 border border-transparent'
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                            ? 'bg-amber-primary border-amber-primary'
                                            : 'border-border-medium group-hover:border-text-tertiary'
                                        }`}>
                                        {isSelected && <Check className="w-3 h-3 text-bg" />}
                                    </div>

                                    {/* Channel icon */}
                                    {ch.isPrivate ? (
                                        <Lock className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                                    ) : (
                                        <Hash className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                                    )}

                                    {/* Channel info */}
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-medium truncate block ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                                            }`}>
                                            {ch.name}
                                        </span>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {ch.isMember && (
                                            <span className="text-[10px] font-bold text-safe bg-safe/10 px-1.5 py-0.5 rounded-md border border-safe/20 uppercase tracking-wider">
                                                Joined
                                            </span>
                                        )}
                                        <span className="text-xs text-text-tertiary flex items-center gap-0.5">
                                            <Users className="w-3 h-3" />
                                            {ch.numMembers}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-soft flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || selected.size === 0}
                        className="px-6 py-2.5 bg-amber-primary text-bg rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-primary/20"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
