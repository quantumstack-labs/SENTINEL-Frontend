import { 
  mockCommitments, 
  mockExecutionScore, 
  mockTeamMembers, 
  mockGraphNodes, 
  mockGraphEdges, 
  mockIntegrations 
} from '@/lib/mock-data';
import { 
  Commitment, 
  ExecutionScore, 
  TeamMember, 
  GraphNode, 
  GraphEdge, 
  Integration 
} from '@/types';

/**
 * Hook to fetch all commitments.
 * In a real app, this would use useQuery from @tanstack/react-query.
 */
export function useCommitments(): { data: Commitment[]; isLoading: boolean } {
  // Simulating a fast fetch
  return { data: mockCommitments, isLoading: false };
}

/**
 * Hook to fetch execution health score.
 */
export function useExecutionScore(): { data: ExecutionScore; isLoading: boolean } {
  return { data: mockExecutionScore, isLoading: false };
}

/**
 * Hook to fetch team members.
 */
export function useTeamMembers(): { data: TeamMember[]; isLoading: boolean } {
  return { data: mockTeamMembers, isLoading: false };
}

/**
 * Hook to fetch dependency graph data.
 */
export function useGraphData(): { data: { nodes: GraphNode[]; edges: GraphEdge[] }; isLoading: boolean } {
  return { 
    data: { 
      nodes: mockGraphNodes, 
      edges: mockGraphEdges 
    }, 
    isLoading: false 
  };
}

/**
 * Hook to fetch integrations.
 */
export function useIntegrations(): { data: Integration[]; isLoading: boolean } {
  return { data: mockIntegrations, isLoading: false };
}
