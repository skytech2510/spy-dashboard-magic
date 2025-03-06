
import { Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TradeButtonProps {
  isTrading: boolean;
  onToggle: (isTrading: boolean) => void;
}

const TradeButton: React.FC<TradeButtonProps> = ({ isTrading, onToggle }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle button click
  const handleClick = () => {
    setIsAnimating(true);
    
    // Notify user of state change
    if (!isTrading) {
      toast.success("Trading bot started", {
        description: "The bot will now execute trades automatically",
      });
    } else {
      toast.info("Trading bot stopped", {
        description: "Trading has been paused",
      });
    }
    
    // Toggle trading state
    onToggle(!isTrading);
    
    // Reset animation after a delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      onClick={handleClick}
      className={`transition-all duration-500 px-6 ${
        isTrading 
          ? "bg-destructive hover:bg-destructive/90" 
          : "bg-trade-active hover:bg-trade-active/90"
      } ${isAnimating ? "scale-95" : "scale-100"}`}
      size="lg"
    >
      <span className="flex items-center gap-2">
        {isTrading ? (
          <>
            <Pause className="h-4 w-4" />
            Stop Trading
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Start Trading
          </>
        )}
      </span>
    </Button>
  );
};

export default TradeButton;
