import DashboardLayout from '@/components/DashboardLayout';
import GraphCanvas, { Node, Edge } from '@/components/GraphCanvas';
import { Button } from '@/components/ui/Button';
import { Filter, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

// Mock Data
const nodes: Node[] = [
  { id: '1', x: 400, y: 300, label: 'API Gateway', type: 'service', status: 'safe', owner: 'Platform' },
  { id: '2', x: 250, y: 450, label: 'Auth Service', type: 'service', status: 'safe', owner: 'Identity' },
  { id: '3', x: 550, y: 450, label: 'Checkout', type: 'service', status: 'risk', owner: 'Commerce' },
  { id: '4', x: 400, y: 600, label: 'Inventory DB', type: 'db', status: 'watch', owner: 'Data' },
  { id: '5', x: 700, y: 300, label: 'Payment Gateway', type: 'service', status: 'safe', owner: 'Fintech' },
  { id: '6', x: 100, y: 300, label: 'Web Client', type: 'service', status: 'safe', owner: 'Frontend' },
  { id: '7', x: 100, y: 500, label: 'Mobile App', type: 'service', status: 'safe', owner: 'Mobile' },
];

const edges: Edge[] = [
  { id: 'e1', source: '6', target: '1', status: 'flowing' },
  { id: 'e2', source: '7', target: '1', status: 'flowing' },
  { id: 'e3', source: '1', target: '2', status: 'flowing' },
  { id: 'e4', source: '1', target: '3', status: 'slow' },
  { id: 'e5', source: '3', target: '4', status: 'flowing' }, // Checkout -> Inventory
  { id: 'e6', source: '3', target: '5', status: 'blocked' }, // Checkout -> Payment
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
