
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
      <div className="custom-tooltip bg-background/80 backdrop-blur-sm p-2 rounded border border-border shadow-lg">
        <p className="custom-tooltip-label font-medium">{label}</p>
        <p className={`custom-tooltip-value text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const DailyProfitChart: React.FC<DailyProfitChartProps> = ({ isTrading }) => {
  // Get account data from mock data generator
  const accountData = generateAccountData(90);
  
  // Calculate daily profit percentages
  const [profitData, setProfitData] = useState(calculateDailyProfitPercentages(accountData));
  const [xAxisScale, setXAxisScale] = useState(14); // Default to show 14 days
  
  // Calculate statistics
  const positiveCount = profitData.filter(d => d.percentage > 0).length;
  const negativeCount = profitData.filter(d => d.percentage < 0).length;
  const winRate = (positiveCount / profitData.length * 100).toFixed(1);
  const avgGain = (profitData.filter(d => d.percentage > 0).reduce((sum, d) => sum + d.percentage, 0) / positiveCount || 0).toFixed(2);
  const avgLoss = (profitData.filter(d => d.percentage < 0).reduce((sum, d) => sum + d.percentage, 0) / negativeCount || 0).toFixed(2);
  
  // Zoom in function to show fewer days
  const zoomIn = () => {
    if (xAxisScale > 7) {
      setXAxisScale(Math.max(7, xAxisScale - 7));
    }
  };

  // Zoom out function to show more days
  const zoomOut = () => {
    if (xAxisScale < profitData.length) {
      setXAxisScale(Math.min(profitData.length, xAxisScale + 7));
    }
  };

  // Filter data based on current scale
  const chartData = profitData
    .slice(Math.max(0, profitData.length - xAxisScale))
    .map(item => ({
      date: formatDate(item.date),
      percentage: item.percentage
    }));
    
  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 h-full animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Daily Profit/Loss</CardTitle>
            <CardDescription>Daily trading performance (%)</CardDescription>
          </div>
          <div className="text-right grid grid-cols-3 gap-x-4 text-sm">
            <div>
              <div className="text-muted-foreground">Win Rate</div>
              <div className="font-bold">{winRate}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Avg Gain</div>
              <div className="font-bold text-green-500">+{avgGain}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Avg Loss</div>
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#888" strokeWidth={1} />
            <Bar 
              dataKey="percentage" 
              animationDuration={500}
              fill={(data) => (data.percentage >= 0 ? "hsl(var(--trade-active))" : "hsl(var(--trade-inactive))")}
              radius={[4, 4, 0, 0]}
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
