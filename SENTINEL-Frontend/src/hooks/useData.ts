import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Commitment, ExecutionScore, TeamMember, GraphNode, GraphEdge, Integration, Notification, WorkspaceSettings } from '@/types';

export function useCommitments() {
  return useQuery<Commitment[]>({
    queryKey: ['commitments'],
    queryFn: () => api.get<Commitment[]>('/commitments'),
  });
}

export function useExecutionScore() {
  return useQuery<ExecutionScore>({
    queryKey: ['executionScore'],
    queryFn: () => api.get<ExecutionScore>('/dashboard/score'),
    refetchInterval: 60_000,
  });
}

export function useTeamMembers() {
  return useQuery<TeamMember[]>({
    queryKey: ['teamMembers'],
    queryFn: () => api.get<TeamMember[]>('/team/members'),
  });
}

export function useGraphData() {
  return useQuery<{ nodes: GraphNode[]; edges: GraphEdge[] }>({
    queryKey: ['graphData'],
    queryFn: () => api.get<{ nodes: GraphNode[]; edges: GraphEdge[] }>('/dashboard/graph'),
    refetchInterval: 60_000,
  });
}

export function useIntegrations() {
  return useQuery<Integration[]>({
    queryKey: ['integrations'],
    queryFn: () => api.get<Integration[]>('/integrations'),
  });
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/notifications'),
    refetchInterval: 30_000,
  });
}

export function useWorkspaceSettings() {
  return useQuery<WorkspaceSettings>({
    queryKey: ['workspaceSettings'],
    queryFn: () => api.get<WorkspaceSettings>('/workspace/settings'),
  });
}
