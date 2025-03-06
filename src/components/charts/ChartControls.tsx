
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ChartControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

const ChartControls = ({ onZoomIn, onZoomOut, canZoomIn, canZoomOut }: ChartControlsProps) => {
  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1">
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChartControls;
