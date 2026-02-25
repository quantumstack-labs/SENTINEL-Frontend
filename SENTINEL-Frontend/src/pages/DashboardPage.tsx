import DashboardLayout from '@/components/DashboardLayout';
import ScoreBar from '@/components/ScoreBar';
import StatusCard from '@/components/dashboard/StatusCard';
import CriticalItemCard from '@/components/dashboard/CriticalItemCard';
import CommitmentTable from '@/components/dashboard/CommitmentTable';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import GraphCanvas from '@/components/GraphCanvas';
import { useDashboard } from '@/context/DashboardContext';
import {
  useCommitments,
  useExecutionScore,
  useGraphData,
  useTeamMembers // <-- Added this to get your real name!
} from '@/hooks/useData';
import { AmbientGlow } from '@/components/glass/AmbientGlow';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

function DashboardContent() {
  const { view, setView } = useDashboard();
  const { data: commitments, isLoading: commitmentsLoading } = useCommitments();
  const { data: score, isLoading: scoreLoading } = useExecutionScore();
  const { data: graphData, isLoading: graphLoading } = useGraphData();
  const { data: members, isLoading: membersLoading } = useTeamMembers(); // <-- Fetching real users

  if (commitmentsLoading || scoreLoading || graphLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-secondary animate-pulse font-mono">Loading data...</div>
      </div>
    );
  }

  // Derived state for the brief
  const atRiskCount = (commitments ?? []).filter((c: any) => c.risk === 'at-risk').length;
  const watchCount = (commitments ?? []).filter((c: any) => c.risk === 'watch').length;
  const onTrackCount = (commitments ?? []).filter((c: any) => c.risk === 'on-track').length;
  const criticalCommitment = (commitments ?? []).find((c: any) => c.isCritical);

  // Get real dynamic date
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }).format(new Date());

  // Get dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 22) return "Good evening";
    return "Good night";
  };

  const greeting = getGreeting();

  // Extract the first name of the logged-in admin (Fallback to "there" if missing)
  const currentUser = members && members.length > 0 ? members[0].name.split(' ')[0] : 'there';

  return (
    <div className={cn(
      "relative",
      view !== 'graph' && "space-y-8"
    )}>
      {/* Header Section */}
      {view !== 'graph' && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[13px] font-mono text-text-tertiary mb-1">
              {today} {/* <-- Replaced hardcoded date */}
            </div>
            <h1 className="font-display text-3xl font-bold text-text-primary">
              {greeting}, {currentUser}. <span className="text-2xl">👋</span> {/* <-- Replaced Static Greeting */}
            </h1>
          </div>

          <DashboardTabs currentView={view} onChange={setView} />
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn(
        view === 'graph' ? "h-full min-h-0" : "min-h-[600px]"
      )}>
        <AnimatePresence mode="wait">
          {view === 'brief' && (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Score Bar */}
              {score && (
                <ScoreBar
                  score={score.current}
                  trend={score.trend}
                  delta={score.delta}
                  status={score.status}
                />
              )}

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard
                  variant="on-track"
                  count={onTrackCount}
                  trend="↑ 2 from yesterday"
                  delay={1}
                />
                <StatusCard
                  variant="watch"
                  count={watchCount}
                  trend="↓ 1 from yesterday"
                  delay={2}
                />
                <StatusCard
                  variant="at-risk"
                  count={atRiskCount}
                  trend="New since last night"
                  delay={3}
                />
              </div>

              {/* Critical Item */}
              {criticalCommitment && (
                <CriticalItemCard commitment={criticalCommitment} />
              )}

              {/* Commitment Table */}
              <CommitmentTable commitments={commitments ?? []} />
            </motion.div>
          )}

          {view === 'graph' && graphData && (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <GraphCanvas nodes={graphData.nodes} edges={graphData.edges} />
            </motion.div>
          )}

          {view === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CommitmentTable commitments={commitments ?? []} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}