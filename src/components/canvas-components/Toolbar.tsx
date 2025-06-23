import { useCanvasStore } from '../../stores/canvasStore';
import { Square, MousePointer2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const Toolbar = () => {
  const { activeTool, setActiveTool } = useCanvasStore();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveTool('select')}
          className={cn(activeTool === 'select' && 'bg-zinc-700')}
        >
          <MousePointer2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveTool('HeroSection')}
          className={cn(activeTool === 'HeroSection' && 'bg-zinc-700')}
        >
          <Square className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
