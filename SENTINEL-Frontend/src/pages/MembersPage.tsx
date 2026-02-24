import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useTeamMembers } from '@/hooks/useData';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn } from '@/lib/utils';
import { Users, Mail, Shield, Plus, MoreVertical, Trash2, UserPlus, Zap, Settings } from 'lucide-react';

export default function MembersPage() {
    const { data: members, isLoading } = useTeamMembers();

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-text-secondary animate-pulse font-mono">Loading team...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl text-text-primary">Team Management</h1>
                        <p className="text-text-secondary mt-1">Manage project access, roles, and synchronization permissions.</p>
                    </div>

                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-primary text-bg font-bold shadow-lg shadow-amber-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <UserPlus className="w-4 h-4" />
                        INVITE MEMBER
                    </button>
                </div>

                {/* Members Table-like List */}
                <div className="space-y-3">
                    <div className="hidden lg:grid grid-cols-12 px-6 py-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest border-b border-white/5">
                        <div className="col-span-4">Member</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {members.map((member) => (
                        <GlassCard key={member.id} className="p-4 lg:px-6 hover:bg-white/5 transition-all group">
                            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 lg:gap-0">
                                {/* Identity */}
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0",
                                        member.avatarGradient
                                    )}>
                                        {member.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-text-primary truncate">{member.name}</p>
                                        <p className="text-[10px] text-text-tertiary uppercase tracking-wide lg:hidden mt-0.5">{member.role}</p>
                                    </div>
                                </div>

                                {/* Email (Hidden on Mobile) */}
                                <div className="col-span-3 hidden lg:flex items-center gap-2 text-sm text-text-secondary truncate">
                                    <Mail className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                    {member.email}
                                </div>

                                {/* Role */}
                                <div className="col-span-2 hidden lg:flex items-center gap-2">
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm",
                                        member.role === 'admin' ? "bg-amber-primary/10 text-amber-primary border border-amber-primary/20" : "bg-white/5 text-text-secondary border border-white/5"
                                    )}>
                                        <Shield className="w-3 h-3" />
                                        {member.role}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-2 flex lg:flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 bg-safe/10 text-safe px-2.5 py-1 rounded-lg border border-safe/20 text-[10px] font-bold uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
                                        ACTIVE
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end gap-2">
                                    <button className="p-2 rounded-lg hover:bg-white/5 text-text-tertiary hover:text-text-primary transition-colors">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-risk/10 text-text-tertiary hover:text-risk transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Access Control Card */}
                <GlassCard className="p-8 bg-amber-primary/[0.02] border-amber-primary/10 mt-12 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="w-32 h-32 text-amber-primary" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-lg font-bold text-text-primary flex items-center gap-3">
                            <Zap className="w-5 h-5 text-amber-primary" />
                            Automated Access Sync
                        </h3>
                        <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                            Sentinel automatically maps your team based on Slack and Google Workspace membership. You can manually override roles or revoke access here.
                            <span className="text-amber-primary/80 block mt-2">Next sync scheduled in 42 minutes.</span>
                        </p>
                        <button className="mt-6 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-primary hover:bg-white/10 transition-all">
                            CONFIGURE AUTO-SYNC
                        </button>
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
