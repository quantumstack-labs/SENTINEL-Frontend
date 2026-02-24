import DashboardLayout from '@/components/DashboardLayout';
import GraphCanvas from '@/components/GraphCanvas';
import { GraphNode, GraphEdge } from '@/types';
import { Button } from '@/components/ui/Button';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

// Mock Data
const nodes: GraphNode[] = [
  { id: '1', x: 400, y: 300, name: 'API Gateway', initials: 'AG', status: 'on-track', riskScore: 12, commitmentCount: 3 },
  { id: '2', x: 250, y: 450, name: 'Auth Service', initials: 'AS', status: 'on-track', riskScore: 8, commitmentCount: 2 },
  { id: '3', x: 550, y: 450, name: 'Checkout', initials: 'CH', status: 'at-risk', riskScore: 87, commitmentCount: 5, highestRiskItem: 'Payment integration blocked' },
  { id: '4', x: 400, y: 600, name: 'Inventory DB', initials: 'ID', status: 'watch', riskScore: 45, commitmentCount: 1 },
  { id: '5', x: 700, y: 300, name: 'Payment Gateway', initials: 'PG', status: 'on-track', riskScore: 20, commitmentCount: 4 },
  { id: '6', x: 100, y: 300, name: 'Web Client', initials: 'WC', status: 'on-track', riskScore: 5, commitmentCount: 2 },
  { id: '7', x: 100, y: 500, name: 'Mobile App', initials: 'MA', status: 'on-track', riskScore: 10, commitmentCount: 3 },
];

const edges: GraphEdge[] = [
  { id: 'e1', fromNodeId: '6', toNodeId: '1', type: 'normal' },
  { id: 'e2', fromNodeId: '7', toNodeId: '1', type: 'normal' },
  { id: 'e3', fromNodeId: '1', toNodeId: '2', type: 'normal' },
  { id: 'e4', fromNodeId: '1', toNodeId: '3', type: 'normal' },
  { id: 'e5', fromNodeId: '3', toNodeId: '4', type: 'normal' },
  { id: 'e6', fromNodeId: '3', toNodeId: '5', type: 'blocked' },
];

export default function GraphPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl text-text-primary mr-4">Dependency Graph</h1>

            <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border-medium">
              <Button variant="ghost" size="sm" className="h-7 text-xs bg-surface-3 text-text-primary">All Systems</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-text-secondary hover:text-text-primary">My Team</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-text-secondary hover:text-text-primary">Critical Path</Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="glass" size="icon" className="h-8 w-8">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="glass" size="icon" className="h-8 w-8">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="glass" size="icon" className="h-8 w-8">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 min-h-0">
          <GraphCanvas nodes={nodes} edges={edges} />
        </div>
      </div>
    </DashboardLayout>
  );
}
