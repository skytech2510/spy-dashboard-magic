
import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { generateAccountData } from "@/utils/mockData";
import { formatDate } from "@/utils/chartUtils";
import CustomTooltip from "./CustomTooltip";
import ChartControls from "./ChartControls";
import BalanceChartHeader from "./BalanceChartHeader";

interface BalanceChartProps {
  isTrading: boolean;
}

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
        const latestData = [...data];
        const lastBalance = latestData[latestData.length - 1].balance;
        
        // Trading performance: slightly higher chance of profit than loss
        const changePercent = (Math.random() * 0.4 - 0.15) / 100; // Slight positive bias
        const newBalance = lastBalance * (1 + changePercent);
        
        // Add new day if necessary, otherwise update latest
        const today = new Date();
        const lastDate = latestData[latestData.length - 1].date;
        
        if (today.getDate() !== lastDate.getDate() || 
            today.getMonth() !== lastDate.getMonth() || 
            today.getFullYear() !== lastDate.getFullYear()) {
          latestData.push({
            date: today,
            balance: parseFloat(newBalance.toFixed(2))
          });
        } else {
          latestData[latestData.length - 1].balance = parseFloat(newBalance.toFixed(2));
        }
        
        setData(latestData);
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

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 h-full animate-fade-in">
      <CardHeader className="pb-2">
        <BalanceChartHeader currentBalance={currentBalance} startBalance={startBalance} />
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
        
        <ChartControls 
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          canZoomIn={xAxisScale > 7}
          canZoomOut={xAxisScale < data.length}
        />
      </CardContent>
    </Card>
  );
};

export default BalanceChart;
