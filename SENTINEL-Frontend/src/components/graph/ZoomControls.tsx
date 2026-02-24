import { Button } from '@/components/ui/Button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-2">
      <Button variant="icon" size="icon" onClick={onZoomIn}>
        <ZoomIn size={16} />
      </Button>
      <Button variant="icon" size="icon" onClick={onZoomOut}>
        <ZoomOut size={16} />
      </Button>
    </div>
  );
}
