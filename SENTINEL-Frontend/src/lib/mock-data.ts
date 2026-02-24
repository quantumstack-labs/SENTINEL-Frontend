import {
  Commitment,
  ExecutionScore,
  TeamMember,
  GraphNode,
  GraphEdge,
  Integration
} from '@/types';

export const mockCommitments: Commitment[] = [
  {
    id: 'c1',
    owner: {
      name: 'Divya Venkat',
      initials: 'DV',
      avatarGradient: 'from-red-400 to-red-600'
    },
    description: 'API documentation',
    source: 'slack',
    sourceChannel: '#engineering',
    detectedAt: '2026-02-17T14:34:00',
    dueDate: '2026-02-21T18:00:00',
    risk: 'at-risk',
    dependencyCount: 3,
    quote: "I'll have the API docs ready before the sprint review on Friday.",
    isCritical: true,
  },
  {
    id: 'c2',
    owner: {
      name: 'Priya Kumar',
      initials: 'PK',
      avatarGradient: 'from-amber-400 to-amber-600'
    },
    description: 'Frontend mockups — auth flow',
    source: 'slack',
    sourceChannel: '#design',
    detectedAt: '2026-02-19T10:12:00',
    dueDate: '2026-02-21T18:00:00',
    risk: 'watch',
    dependencyCount: 1,
    quote: "I'll get the auth flow mockups done by EOD.",
    isCritical: false,
  },
  {
    id: 'c3',
    owner: {
      name: 'Rahul Mehta',
      initials: 'RM',
      avatarGradient: 'from-green-400 to-emerald-600'
    },
    description: 'Database migration plan',
    source: 'email',
    sourceChannel: 'Gmail',
    detectedAt: '2026-02-18T09:00:00',
    dueDate: '2026-02-22T18:00:00',
    risk: 'on-track',
    dependencyCount: 0,
    quote: "Will send the migration plan by Monday.",
    isCritical: false,
  },
  {
    id: 'c4',
    owner: {
      name: 'Sam Thomas',
      initials: 'ST',
      avatarGradient: 'from-cyan-400 to-cyan-600'
    },
    description: 'Code review — auth PR #142',
    source: 'slack',
    sourceChannel: '#engineering',
    detectedAt: '2026-02-15T16:00:00',
    dueDate: '2026-02-20T18:00:00',
    risk: 'at-risk',
    dependencyCount: 2,
    quote: "I'll review the auth PR before end of week.",
    isCritical: false,
  },
];

export const mockExecutionScore: ExecutionScore = {
  current: 74,
  previous: 80,
  status: 'watch',
  trend: 'down',
  delta: -6,
};

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'm1',
    name: 'Arjun Sharma',
    email: 'arjun@acme.com',
    initials: 'AS',
    avatarGradient: 'from-amber-400 to-orange-500',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'm2',
    name: 'Priya Kumar',
    email: 'priya@acme.com',
    initials: 'PK',
    avatarGradient: 'from-amber-400 to-amber-600',
    role: 'member',
    status: 'active',
  },
];

export const mockGraphNodes: GraphNode[] = [
  {
    id: 'n-ak', initials: 'AK', name: 'Arjun K.',
    status: 'watch', riskScore: 55,
    x: 450, y: 100, commitmentCount: 3,
    highestRiskItem: 'Sprint planning doc — Due Friday'
  },
  {
    id: 'n-dv', initials: 'DV', name: 'Divya V.',
    status: 'at-risk', riskScore: 88,
    x: 450, y: 290, commitmentCount: 1,
    highestRiskItem: 'API Documentation — Due Today'
  },
  {
    id: 'n-pr', initials: 'PR', name: 'Priya R.',
    status: 'on-track', riskScore: 22,
    x: 680, y: 270, commitmentCount: 2,
    highestRiskItem: 'Frontend mockups — Due tomorrow'
  },
  {
    id: 'n-sm', initials: 'SM', name: 'Sam M.',
    status: 'on-track', riskScore: 18,
    x: 220, y: 270, commitmentCount: 2,
    highestRiskItem: 'Code review — Due Feb 23'
  },
  {
    id: 'n-rt', initials: 'RT', name: 'Rahul T.',
    status: 'on-track', riskScore: 12,
    x: 750, y: 440, commitmentCount: 1,
    highestRiskItem: 'DB migration — Due Feb 22'
  },
  {
    id: 'n-na', initials: 'NA', name: 'Nisha A.',
    status: 'on-track', riskScore: 8,
    x: 200, y: 460, commitmentCount: 1,
    highestRiskItem: 'Client proposal — Due Feb 24'
  },
  {
    id: 'n-ks', initials: 'KS', name: 'Kiran S.',
    status: 'on-track', riskScore: 15,
    x: 480, y: 470, commitmentCount: 1,
    highestRiskItem: 'QA report — Due Feb 23'
  },
];

export const mockGraphEdges: GraphEdge[] = [
  {
    id: 'e1', fromNodeId: 'n-ak', toNodeId: 'n-pr',
    type: 'normal', label: 'Design handoff'
  },
  {
    id: 'e2', fromNodeId: 'n-ak', toNodeId: 'n-sm',
    type: 'normal', label: 'Sprint planning'
  },
  {
    id: 'e3', fromNodeId: 'n-ak', toNodeId: 'n-dv',
    type: 'blocked', label: 'API docs — BLOCKED'
  },
  {
    id: 'e4', fromNodeId: 'n-dv', toNodeId: 'n-ks',
    type: 'blocked', label: 'Cascade — waiting on API'
  },
  {
    id: 'e5', fromNodeId: 'n-pr', toNodeId: 'n-rt',
    type: 'normal', label: 'Frontend → DB sync'
  },
  {
    id: 'e6', fromNodeId: 'n-sm', toNodeId: 'n-na',
    type: 'normal', label: 'Code review chain'
  },
];

export const mockIntegrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    icon: 'slack',
    status: 'connected',
    connectedAccount: 'Acme Corp Workspace',
    channels: ['#engineering', '#product', '#sprint-planning'],
    lastSynced: '4 minutes ago',
    description: 'Monitor channels for commitments and extract execution signals automatically.',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: 'gmail',
    status: 'connected',
    connectedAccount: 'engineering@acme.com',
    channels: ['Inbox', 'Drafts'],
    lastSynced: '12 minutes ago',
    description: 'Index external promises and client commitments directly from email threads.',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: 'calendar',
    status: 'connected',
    connectedAccount: 'engineering@acme.com',
    lastSynced: '1 hour ago',
    description: 'Sync meeting outcomes and extracted action items to the execution graph.',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: 'notion',
    status: 'disconnected',
    description: 'Connect shared docs and roadmaps to verify extracted commitments against plans.',
  },
  {
    id: 'jira',
    name: 'Jira',
    icon: 'jira',
    status: 'disconnected',
    description: 'Sync tickets and sprint status to map conversation signals to technical debt.',
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: 'linear',
    status: 'disconnected',
    description: 'Track high-velocity engineering signals and sync dependency chains.',
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    icon: 'microsoft',
    status: 'disconnected',
    description: 'Monitor Outlook and Teams for enterprise-wide commitment tracking.',
  },
];
