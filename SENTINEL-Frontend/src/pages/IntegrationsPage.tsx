import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Check, Plus, Github, Slack, Database, Mail, Calendar, Book, Triangle, Layers, HelpCircle } from 'lucide-react';
import { useIntegrations } from '@/hooks/useData';

// Map icon strings from API/mock-data to Lucide components
const IconMap: Record<string, React.ElementType> = {
  'github': Github,
  'slack': Slack,
  'gmail': Mail,
  'google-calendar': Calendar,
  'notion': Book,
  'jira': Database,
  'linear': Triangle,
  'microsoft': Layers, // Representing Stack/Suite
  '#': Slack, // Default for mock data symbol
};

export default function IntegrationsPage() {
  const { data: integrations, isLoading } = useIntegrations();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-text-secondary animate-pulse font-mono">Loading integrations...</div>
        </div>
      </DashboardLayout>
    );
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const capacity = Math.round((connectedCount / 5) * 100); // Spec says 5 max for demo

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl text-text-primary">Integrations</h1>
          <p className="text-text-secondary mt-1">Connect your stack to unlock Sentinel's full predictive power.</p>
        </div>

        {/* Capacity Bar */}
        <div className="glass-1 p-6 rounded-2xl border border-border-medium space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-sm font-medium text-text-primary">Sentinel Capacity Unlocked</h3>
              <p className="text-xs text-text-secondary mt-1">Connect more tools to increase prediction accuracy.</p>
            </div>
            <span className="font-mono text-xl text-amber-primary">{capacity}%</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-primary transition-all duration-1000 ease-out"
              style={{ width: `${capacity}%` }}
            />
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = IconMap[integration.id] || IconMap[integration.icon] || HelpCircle;

            return (
              <div
                key={integration.id}
                className="glass-1 p-6 rounded-2xl border border-border-medium flex flex-col justify-between group hover:border-amber-primary/30 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-surface-2 border border-border-soft group-hover:border-amber-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-text-primary" />
                    </div>
                    {integration.status === 'connected' ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-safe-dim border border-safe/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-safe" />
                        <span className="text-[10px] font-medium text-safe uppercase tracking-wide">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-2 border border-border-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                        <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">Disconnected</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-display text-lg text-text-primary mb-2">{integration.name}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    {integration.description}
                  </p>
                </div>

                <Button
                  variant={integration.status === 'connected' ? 'outline' : 'glass'}
                  className={cn(
                    "w-full justify-center gap-2",
                    integration.status === 'connected'
                      ? "border-safe/20 text-safe hover:bg-safe-dim hover:text-safe"
                      : "text-text-primary hover:bg-white/5"
                  )}
                >
                  {integration.status === 'connected' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Configure
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
