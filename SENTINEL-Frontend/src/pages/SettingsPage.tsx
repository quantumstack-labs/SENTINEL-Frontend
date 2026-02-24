import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';
import { Bell, Shield, Users, CreditCard, Sliders, Plus } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useData';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-140px)]">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h1 className="font-display text-2xl text-text-primary mb-6">Settings</h1>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-surface-2 text-text-primary border border-border-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 max-w-2xl">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass-1 p-6 rounded-2xl border border-border-medium space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-1">Workspace</h3>
                  <p className="text-sm text-text-secondary">Manage your workspace preferences.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Workspace Name</Label>
                    <Input defaultValue="Engineering" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <select className="flex h-10 w-full rounded-md border border-border-medium bg-surface-2 px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-primary/50">
                      <option>Pacific Time (US & Canada)</option>
                      <option>Eastern Time (US & Canada)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-1 p-6 rounded-2xl border border-border-medium space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-1">Analysis Configuration</h3>
                  <p className="text-sm text-text-secondary">Fine-tune the sensitivity of Sentinel's risk detection.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Risk Confidence Threshold</Label>
                      <span className="text-sm font-mono text-amber-text">85%</span>
                    </div>
                    <Slider defaultValue={[85]} max={100} step={1} />
                    <p className="text-xs text-text-tertiary">Alerts below this confidence score will be marked as "Watch" instead of "Risk".</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Include Draft PRs</Label>
                      <p className="text-xs text-text-secondary">Analyze dependencies in draft pull requests.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass-1 p-6 rounded-2xl border border-border-medium space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-1">Alert Preferences</h3>
                  <p className="text-sm text-text-secondary">Choose how and when you want to be notified.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Critical Risks</Label>
                      <p className="text-xs text-text-secondary">Immediate notification for high-impact blockers.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Brief</Label>
                      <p className="text-xs text-text-secondary">Morning summary of workspace health.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Dependencies</Label>
                      <p className="text-xs text-text-secondary">When a new service or library is added.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass-1 p-6 rounded-2xl border border-border-medium overflow-hidden">
                <div className="p-6 border-bottom border-border-soft flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-1">Team Members</h3>
                    <p className="text-sm text-text-secondary">Manage who has access to this workspace.</p>
                  </div>
                  <Button variant="glass" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Invite
                  </Button>
                </div>

                {teamLoading ? (
                  <div className="p-12 text-center text-text-tertiary">Loading members...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-2/50 border-y border-border-soft">
                        <tr>
                          <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-mono text-text-tertiary">Member</th>
                          <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-mono text-text-tertiary">Role</th>
                          <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-mono text-text-tertiary">Status</th>
                          <th className="px-6 py-3 text-[10px] uppercase tracking-wider font-mono text-text-tertiary text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-soft">
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar initials={member.initials} gradient={member.avatarGradient} size="sm" />
                                <div>
                                  <div className="text-sm font-medium text-text-primary">{member.name}</div>
                                  <div className="text-xs text-text-tertiary">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="cyan" label={member.role} className="opacity-80" />
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={member.status === 'active' ? 'ok' : 'watch'} label={member.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="outline" size="sm">Edit</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab === 'privacy' || activeTab === 'billing') && (
            <div className="glass-1 p-12 rounded-2xl border border-border-medium text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 rounded-full bg-surface-2 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-text-tertiary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">Coming Soon</h3>
              <p className="text-text-secondary">This section is under development.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
