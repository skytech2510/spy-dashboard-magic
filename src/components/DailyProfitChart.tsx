import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateAccountData, calculateDailyProfitPercentages } from "@/utils/mockData";
import { formatDate } from "@/utils/chartUtils";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface DailyProfitChartProps {
  isTrading: boolean;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isPositive = value >= 0;
    
    return (
      <div className="custom-tooltip bg-background/95 backdrop-blur-sm p-3 rounded-xl border border-border shadow-xl">
        <p className="custom-tooltip-label font-medium">{label}</p>
        <p className={`custom-tooltip-value text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const DailyProfitChart: React.FC<DailyProfitChartProps> = ({ isTrading }) => {
  const accountData = generateAccountData(90);
  
  const [profitData, setProfitData] = useState(calculateDailyProfitPercentages(accountData));
  const [xAxisScale, setXAxisScale] = useState(14);

  const positiveCount = profitData.filter(d => d.percentage > 0).length;
  const negativeCount = profitData.filter(d => d.percentage < 0).length;
  const winRate = (positiveCount / profitData.length * 100).toFixed(1);
  const avgGain = (profitData.filter(d => d.percentage > 0).reduce((sum, d) => sum + d.percentage, 0) / positiveCount || 0).toFixed(2);
  const avgLoss = (profitData.filter(d => d.percentage < 0).reduce((sum, d) => sum + d.percentage, 0) / negativeCount || 0).toFixed(2);

  const zoomIn = () => {
    if (xAxisScale > 7) {
      setXAxisScale(Math.max(7, xAxisScale - 7));
    }
  };

  const zoomOut = () => {
    if (xAxisScale < profitData.length) {
      setXAxisScale(Math.min(profitData.length, xAxisScale + 7));
    }
  };

  const chartData = profitData
    .slice(Math.max(0, profitData.length - xAxisScale))
    .map(item => ({
      date: formatDate(item.date),
      percentage: item.percentage
    }));
    
  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 h-full animate-fade-in border-none shadow-lg bg-gradient-to-br from-white/50 to-white/30 dark:from-black/50 dark:to-black/30">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
              Daily Profit/Loss
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Daily trading performance (%)
            </CardDescription>
          </div>
          <div className="text-right grid grid-cols-3 gap-x-4 text-sm">
            <div className="bg-background/40 backdrop-blur-sm p-2 rounded-lg">
              <div className="text-muted-foreground text-xs">Win Rate</div>
              <div className="font-bold">{winRate}%</div>
            </div>
            <div className="bg-background/40 backdrop-blur-sm p-2 rounded-lg">
              <div className="text-muted-foreground text-xs">Avg Gain</div>
              <div className="font-bold text-green-500">+{avgGain}%</div>
            </div>
            <div className="bg-background/40 backdrop-blur-sm p-2 rounded-lg">
              <div className="text-muted-foreground text-xs">Avg Loss</div>
              <div className="font-bold text-red-500">{avgLoss}%</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.65} />
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#EA580C" stopOpacity={0.65} />
              </linearGradient>
              <linearGradient id="positiveGradientAlt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#0284C7" stopOpacity={0.65} />
              </linearGradient>
              <linearGradient id="negativeGradientAlt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D946EF" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#C026D3" stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 120, 0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              dy={5}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.2 }} />
            <ReferenceLine y={0} stroke="rgba(120, 120, 120, 0.3)" strokeWidth={1} />
            <Bar 
              dataKey="percentage" 
              animationDuration={500}
              radius={[6, 6, 0, 0]}
              fill={(entry) => entry.percentage >= 0 ? "url(#positiveGradient)" : "url(#negativeGradient)"}
              strokeWidth={1}
              stroke={(entry) => entry.percentage >= 0 ? "rgba(139, 92, 246, 0.3)" : "rgba(249, 115, 22, 0.3)"}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={zoomIn}
            disabled={xAxisScale <= 7}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={zoomOut}
            disabled={xAxisScale >= profitData.length}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProfitChart;
