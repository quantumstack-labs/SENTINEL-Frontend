export type RiskLevel = 'at-risk' | 'watch' | 'on-track';
export type CommitmentSource = 'slack' | 'email' | 'meeting' | 'github';

export type Commitment = {
  id: string;
  owner: {
    name: string;
    initials: string;
    avatarGradient: string;
  };
  description: string;
  source: CommitmentSource;
  sourceChannel: string;
  detectedAt: string;
  dueDate: string;
  risk: RiskLevel;
  dependencyCount: number;
  quote: string;
  isCritical: boolean;
};

export type ExecutionScore = {
  current: number;
  previous: number;
  status: 'stable' | 'watch' | 'at-risk';
  trend: 'up' | 'down' | 'flat';
  delta: number;
};

export type TeamRole = 'admin' | 'member' | 'observer';
export type MemberStatus = 'active' | 'pending';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarGradient: string;
  role: TeamRole;
  status: MemberStatus;
};

export type NodeStatus = 'at-risk' | 'watch' | 'on-track';

export type GraphNode = {
  id: string;
  initials: string;
  name: string;
  status: NodeStatus;
  riskScore: number;
  x: number;
  y: number;
  commitmentCount: number;
  highestRiskItem?: string;
};

export type EdgeType = 'normal' | 'blocked';

export type GraphEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: EdgeType;
  label?: string;
  commitmentId?: string;
};

export type IntegrationStatus = 'connected' | 'disconnected' | 'enterprise';

export type Integration = {
  id: string;
  name: string;
  icon: string; // Using string for icon name/path for now
  status: IntegrationStatus;
  connectedAccount?: string;
  channels?: string[];
  lastSynced?: string;
  description: string;
};

export type NotificationType = 'signal' | 'risk' | 'info';

export type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  unread: boolean;
};

export type WorkspaceSettings = {
  workspaceName: string;
  workspaceSlug?: string;
  plan?: string;
  timezone?: string;
};
