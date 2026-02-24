import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { useTeamMembers } from '@/hooks/useData';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn } from '@/lib/utils';
import { Mail, Shield, Trash2, UserPlus, Zap, Settings, Loader2, X, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function MembersPage() {
    const queryClient = useQueryClient();
    const { data: members, isLoading } = useTeamMembers();
    const [showInvite, setShowInvite] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');

    const inviteMutation = useMutation({
        mutationFn: () => api.post('/team/members/invite', { email, role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
            toast.success(`Invite sent to ${email}`);
            setEmail('');
            setRole('member');
            setShowInvite(false);
        },
        onError: (err: Error) => toast.error(err.message ?? 'Failed to send invite'),
    });

    const isInviteValid = email.includes('@') && email.length > 5;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-text-secondary animate-pulse font-mono tracking-widest">LOADING TEAM DATA...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl text-text-primary tracking-tight">Team Management</h1>
                        <p className="text-text-secondary mt-1">Manage project access, roles, and synchronization permissions.</p>
                    </div>

                    <button
                        onClick={() => setShowInvite(!showInvite)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98]",
                            showInvite
                                ? "bg-white/10 text-text-primary border border-white/10"
                                : "bg-amber-primary text-bg shadow-lg shadow-amber-primary/20 hover:scale-[1.02]"
                        )}
                    >
                        {showInvite ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {showInvite ? 'CANCEL' : 'INVITE MEMBER'}
                    </button>
                </div>

                {showInvite && (
                    <GlassCard className="p-6 border-amber-primary/30 bg-amber-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[10px] font-bold text-amber-primary uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="colleague@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-white/10 bg-bg/50 px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-primary/50 transition-all"
                                />
                            </div>
                            <div className="w-full md:w-48 space-y-2">
                                <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest ml-1">Access Level</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-white/10 bg-bg/50 px-4 text-sm text-text-primary focus:outline-none transition-all"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                    <option value="observer">Observer</option>
                                </select>
                            </div>
                            <button
                                onClick={() => inviteMutation.mutate()}
                                disabled={inviteMutation.isPending || !isInviteValid}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 h-11 rounded-xl bg-text-primary text-bg text-sm font-bold disabled:opacity-30 hover:bg-amber-primary transition-all group"
                            >
                                {inviteMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        SEND INVITE
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </GlassCard>
                )}

                <div className="space-y-3">
                    <div className="hidden lg:grid grid-cols-12 px-6 py-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                        <div className="col-span-4">Member / Identity</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2">Permission</div>
                        <div className="col-span-2">Sync Status</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {(members ?? []).map((member) => (
                        <GlassCard key={member.id} className="p-4 lg:px-6 hover:bg-white/5 transition-all group border-white/5">
                            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 lg:gap-0">
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0",
                                        member.avatarGradient
                                    )}>
                                        {member.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-text-primary truncate">{member.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5 lg:hidden">
                                            <span className="text-[10px] text-text-tertiary uppercase tracking-wide">{member.role}</span>
                                            <span className="w-1 h-1 rounded-full bg-text-tertiary/30" />
                                            <span className="text-[10px] text-text-tertiary uppercase tracking-wide">{member.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-3 hidden lg:flex items-center gap-2 text-sm text-text-secondary truncate font-mono text-[13px]">
                                    <Mail className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                    {member.email}
                                </div>

                                <div className="col-span-2 hidden lg:flex items-center">
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide",
                                        member.role === 'admin' ? "bg-amber-primary/10 text-amber-primary border border-amber-primary/20" : "bg-white/5 text-text-tertiary border border-white/5"
                                    )}>
                                        <Shield className="w-3 h-3" />
                                        {member.role}
                                    </div>
                                </div>

                                <div className="col-span-2 flex lg:flex items-center gap-2">
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase",
                                        member.status === 'active'
                                            ? "bg-safe/10 text-safe border-safe/20"
                                            : "bg-watch/10 text-watch border-watch/20"
                                    )}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", member.status === 'active' ? "bg-safe animate-pulse" : "bg-watch")} />
                                        {member.status}
                                    </div>
                                </div>

                                <div className="col-span-1 flex justify-end gap-1">
                                    <button
                                        onClick={() => toast('Security settings for ' + member.name, { icon: '🛡️' })}
                                        className="p-2 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-all"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => toast.error('Revoke access flow locked')}
                                        className="p-2 rounded-lg hover:bg-risk/10 text-text-tertiary hover:text-risk transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <div className="pt-8">
                    <GlassCard className="p-8 bg-amber-primary/[0.03] border-amber-primary/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-32 h-32 text-amber-primary" />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-amber-primary/10">
                                    <Zap className="w-5 h-5 text-amber-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-text-primary">Identity Mesh Intelligence</h3>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Sentinel cross-references identities across <span className="text-text-primary font-medium">Slack</span>, <span className="text-text-primary font-medium">GitHub</span>, and <span className="text-text-primary font-medium">Linear</span> automatically.
                            </p>
                            <div className="mt-6 flex items-center gap-4">
                                <button className="px-5 py-2 rounded-xl bg-text-primary text-bg text-[11px] font-black uppercase tracking-wider hover:bg-amber-primary transition-all">
                                    Run Global Sync
                                </button>
                                <span className="text-[10px] text-text-tertiary font-mono">ID_MESH_HEALTH: OPTIMAL</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </DashboardLayout>
    );
}