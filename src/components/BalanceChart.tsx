
import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateAccountData, getUpdatedAccountData } from "@/utils/mockData";
import { calculatePerformance } from "@/utils/chartUtils";
import { formatDate } from "@/utils/chartUtils";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface BalanceChartProps {
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
    
    return (
      <div className="custom-tooltip bg-background/80 backdrop-blur-sm p-2 rounded border border-border shadow-lg">
        <p className="custom-tooltip-label font-medium">{label}</p>
        <p className="custom-tooltip-value text-lg">
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const BalanceChart: React.FC<BalanceChartProps> = ({ isTrading }) => {
  // Generate 90 days of historical data
  const [data, setData] = useState(generateAccountData(90));
  const [currentBalance, setCurrentBalance] = useState(data[data.length - 1].balance);
  const [startBalance, setStartBalance] = useState(data[0].balance);
  const [xAxisScale, setXAxisScale] = useState(30); // Default to show 30 days
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for handling data updates
  useEffect(() => {
    // Only update if trading is active
    if (isTrading) {
      // Update balance every 10 seconds
      updateIntervalRef.current = setInterval(() => {
        const { newData, newBalance } = getUpdatedAccountData(data);
        setData(newData);
        setCurrentBalance(parseFloat(newBalance.toFixed(2)));
      }, 10000);
    } else if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    
    // Cleanup
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isTrading, data]);

  // Zoom in function to show fewer days
  const zoomIn = () => {
    if (xAxisScale > 7) {
      setXAxisScale(Math.max(7, xAxisScale - 7));
    }
  };

  // Zoom out function to show more days
  const zoomOut = () => {
    if (xAxisScale < data.length) {
      setXAxisScale(Math.min(data.length, xAxisScale + 7));
    }
  };

  // Filter data based on current scale
  const chartData = data
    .slice(Math.max(0, data.length - xAxisScale))
    .map(item => ({
      date: formatDate(item.date),
      balance: item.balance
    }));

  const { gainPercent, isPositive } = calculatePerformance(currentBalance, startBalance);

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 h-full animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Account Balance
              <span className={`text-sm font-normal ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(gainPercent).toFixed(2)}%
              </span>
            </CardTitle>
            <CardDescription>3-month trading performance</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold transition-colors duration-300`}>
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : '-'}${Math.abs(currentBalance - startBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
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
              domain={['dataMin - 100', 'dataMax + 100']} 
              tick={{ fontSize: 10 }} 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--chart-line))" 
              fill="hsl(var(--chart-area))" 
              strokeWidth={2}
              activeDot={{ r: 5, stroke: "white", strokeWidth: 2 }}
              animationDuration={500}
            />
          </AreaChart>
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
            disabled={xAxisScale >= data.length}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceChart;
