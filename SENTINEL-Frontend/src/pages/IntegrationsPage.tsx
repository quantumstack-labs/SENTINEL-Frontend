import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Check, Plus, Github, Slack, Mail, Calendar, Book, Database, Triangle, Layers, HelpCircle, Loader2, X, RefreshCcw, Settings2 } from 'lucide-react';
import { useIntegrations } from '@/hooks/useData';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import SlackChannelModal from '@/components/SlackChannelModal';
import type { ElementType } from 'react';

interface SupportedApp {
  id: string;
  name: string;
  description: string;
  Icon: ElementType;
  color?: string;
}

const SUPPORTED_APPS: SupportedApp[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Monitor Slack channels and extract commitment signals from team conversations in real time.',
    Icon: Slack,
    color: 'hover:border-[#E01E5A]/30 group-hover:bg-[#E01E5A]/5',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link pull requests and issues to commitments and detect delivery risk from code activity.',
    Icon: Github,
    color: 'hover:border-white/30 group-hover:bg-white/5',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Surface email-based commitments and follow-up gaps from executive and team inboxes.',
    Icon: Mail,
    color: 'hover:border-[#EA4335]/30 group-hover:bg-[#EA4335]/5',
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Pull meeting transcripts and chat signals from Teams to surface hidden commitments.',
    Icon: Layers,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync project docs and task databases from Notion to track delivery against written goals.',
    Icon: Book,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Connect Linear issues to commitments and automatically flag sprint items that fall behind.',
    Icon: Triangle,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Detect commitment-bearing meetings and map action items to owners automatically.',
    Icon: Calendar,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Ingest Jira sprints and epics to cross-reference ticket status with spoken commitments.',
    Icon: Database,
  },
];

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const { data: dbIntegrations, isLoading } = useIntegrations();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showSlackModal, setShowSlackModal] = useState(false);

  // Map DB integrations for quick lookup
  const integrationMap = new Map(
    (dbIntegrations ?? []).map(i => [i.id, i])
  );

  // GitHub is only truly connected if it has a real token stored
  const isGithubReallyConnected = (() => {
    const gh = integrationMap.get('github');
    return gh?.status === 'connected' && !!gh?.github_access_token;
  })();

  const connectedIds = new Set(
    (dbIntegrations ?? []).filter(i => {
      if (i.id === 'github') return isGithubReallyConnected;
      return i.status === 'connected';
    }).map(i => i.id)
  );
  const connectedCount = connectedIds.size;
  const capacity = Math.round((connectedCount / SUPPORTED_APPS.length) * 100);

  // Auto-open Slack modal when returning from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('slack') === 'connected') {
      setShowSlackModal(true);
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('github') === 'connected') {
      toast.success('GitHub connected successfully!');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('gmail') === 'connected') {
      toast.success('Gmail connected successfully!');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Slack OAuth: redirect to backend authorize endpoint
  const handleSlackConnect = () => {
    const token = localStorage.getItem('sentinel_token') || '';
    if (!token) {
      toast.error('Please log in first');
      return;
    }
    // Redirect to our backend which then redirects to Slack
    // Pass JWT as ?token= since browsers can't set headers on a redirect
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${apiBase}/integrations/slack/oauth/authorize?token=${encodeURIComponent(token)}`;
  };

  // GitHub OAuth: redirect to backend authorize endpoint
  const handleGithubConnect = () => {
    const token = localStorage.getItem('sentinel_token') || '';
    if (!token) {
      toast.error('Please log in first');
      return;
    }
    // Unified Backend router: /api/v1/integrations/github/oauth/authorize
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${apiBase}/integrations/github/oauth/authorize?token=${encodeURIComponent(token)}`;
  };

  const handleGmailConnect = () => {
    const token = localStorage.getItem('sentinel_token') || '';
    if (!token) {
      toast.error('Please log in first');
      return;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${apiBase}/integrations/gmail/oauth/authorize?token=${encodeURIComponent(token)}`;
  };

  const connectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/integrations/${id}/connect`),
    onMutate: (id) => setPendingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration connected');
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to connect'),
    onSettled: () => setPendingId(null),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/integrations/${id}/disconnect`),
    onMutate: (id) => setPendingId(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration disconnected');
      if (id === 'slack') setShowSlackModal(false);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to disconnect'),
    onSettled: () => setPendingId(null),
  });

  const handleConnect = (appId: string) => {
    if (appId === 'slack') {
      handleSlackConnect();
    } else if (appId === 'github') {
      handleGithubConnect();
    } else if (appId === 'gmail') {
      handleGmailConnect();
    } else {
      connectMutation.mutate(appId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-text-primary tracking-tight">Integrations</h1>
            <p className="text-text-secondary mt-1">Connect your stack to unlock Sentinel's full predictive power.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary bg-surface-2 px-3 py-1.5 rounded-lg border border-border-soft">
            <RefreshCcw className="w-3 h-3" />
            <span>AUTO-SYNC ENABLED</span>
          </div>
        </div>

        <div className="glass-1 p-6 rounded-2xl border border-border-medium space-y-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-end relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                Sentinel Capacity Unlocked
                <HelpCircle className="w-3.5 h-3.5 text-text-tertiary" />
              </h3>
              <p className="text-xs text-text-secondary mt-1">Predictive accuracy scales with your data surface area.</p>
            </div>
            <span className="font-mono text-2xl text-amber-primary drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">{capacity}%</span>
          </div>
          <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden border border-white/5 relative z-10">
            <div
              className="h-full bg-gradient-to-r from-amber-primary/80 to-amber-primary transition-all duration-1000 ease-out"
              style={{ width: `${capacity}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPORTED_APPS.map((app) => {
            const isConnected = connectedIds.has(app.id);
            const isBusy = pendingId === app.id;
            const slackIntegration = integrationMap.get('slack');
            const slackChannelCount = slackIntegration?.channels?.length ?? 0;

            return (
              <div
                key={app.id}
                className={cn(
                  "glass-1 p-6 rounded-2xl border border-border-medium flex flex-col justify-between group transition-all duration-300",
                  app.color || "hover:border-amber-primary/30"
                )}
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="p-3 rounded-2xl bg-surface-2 border border-border-soft group-hover:scale-110 transition-transform">
                      <app.Icon className="w-6 h-6 text-text-primary" />
                    </div>
                    {isConnected ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-safe/10 border border-safe/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
                        <span className="text-[10px] font-bold text-safe uppercase tracking-widest">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-3 border border-border-medium">
                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Offline</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-display text-lg text-text-primary mb-2 group-hover:text-amber-primary transition-colors">{app.name}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-8 h-10 overflow-hidden line-clamp-2">{app.description}</p>
                </div>

                {isLoading ? (
                  <Button variant="glass" className="w-full justify-center" disabled>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </Button>
                ) : isConnected ? (
                  <div className="space-y-3">
                    {/* Slack-specific: show channel count + Configure button */}
                    {app.id === 'slack' && (
                      <button
                        onClick={() => setShowSlackModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 border border-border-soft text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 hover:border-border-medium transition-all"
                      >
                        <Settings2 className="w-4 h-4" />
                        Configure Channels
                        {slackChannelCount > 0 && (
                          <span className="ml-auto text-[10px] font-bold bg-amber-primary/10 text-amber-primary px-2 py-0.5 rounded-md border border-amber-primary/20">
                            {slackChannelCount}
                          </span>
                        )}
                      </button>
                    )}
                    <div className="text-[10px] text-center text-text-tertiary uppercase tracking-tight">Synced 2m ago</div>
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2 border-risk/20 text-risk hover:bg-risk/10 hover:border-risk/40 transition-all"
                      onClick={() => disconnectMutation.mutate(app.id)}
                      disabled={isBusy}
                    >
                      {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      {isBusy ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="glass"
                    className="w-full justify-center gap-2 text-text-primary hover:bg-white/10 border-white/5 transition-all active:scale-95"
                    onClick={() => handleConnect(app.id)}
                    disabled={isBusy}
                  >
                    {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isBusy ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slack Channel Configuration Modal */}
      <SlackChannelModal
        isOpen={showSlackModal}
        onClose={() => setShowSlackModal(false)}
        currentChannels={integrationMap.get('slack')?.channels ?? []}
      />
    </DashboardLayout>
  );
}