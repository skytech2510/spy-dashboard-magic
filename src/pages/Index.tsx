
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PriceChart from "@/components/PriceChart";
import BalanceChart from "@/components/BalanceChart";
import TradeButton from "@/components/TradeButton";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const [isTrading, setIsTrading] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handle trading toggle
  const handleTradingToggle = (value: boolean) => {
    setIsTrading(value);
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while checking auth status
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary">
      <div className="grid-pattern absolute inset-0 opacity-20"></div>
      
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/30 dark:bg-black/30 z-10">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">SPY Trading Bot Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container py-6 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PriceChart isTrading={isTrading} />
          <BalanceChart isTrading={isTrading} />
        </div>
        
        {/* Stats and control panel */}
        <div className="glass-card p-6 rounded-lg border border-white/10 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="space-y-6 col-span-1 md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Trading Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">68%</p>
                </div>
                <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Profit</p>
                  <p className="text-2xl font-bold text-green-500">+0.87%</p>
                </div>
                <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Loss</p>
                  <p className="text-2xl font-bold text-red-500">-0.52%</p>
                </div>
                <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Duration</p>
                  <p className="text-2xl font-bold">2.4h</p>
                </div>
                <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Last Trade</p>
                  <p className="text-2xl font-bold text-green-500">+$127</p>
                </div>
              </div>
            </div>
            
            {/* Control panel */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <h2 className="text-xl font-semibold">Trading Control</h2>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Bot Status</div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className={`h-3 w-3 rounded-full ${isTrading ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{isTrading ? 'Active' : 'Inactive'}</span>
                </div>
                <TradeButton isTrading={isTrading} onToggle={handleTradingToggle} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-sm text-muted-foreground backdrop-blur-sm bg-white/30 dark:bg-black/30 z-10">
        <div className="container">
          SPY Trading Bot Dashboard &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
