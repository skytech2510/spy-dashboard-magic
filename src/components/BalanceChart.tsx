
import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAccountData } from "@/utils/mockData";

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
    const balance = payload[0].value;
    const date = label;
    
    return (
      <div className="custom-tooltip">
        <p className="custom-tooltip-label">{date}</p>
        <p className="custom-tooltip-value">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

const BalanceChart: React.FC<BalanceChartProps> = ({ isTrading }) => {
  const [data, setData] = useState(generateAccountData());
  const [currentBalance, setCurrentBalance] = useState(data[data.length - 1].balance);
  const [startBalance, setStartBalance] = useState(data[0].balance);
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

  const totalGain = currentBalance - startBalance;
  const gainPercent = (totalGain / startBalance) * 100;
  const isPositive = totalGain >= 0;

  const chartData = data.map(item => ({
    date: formatDate(item.date),
    balance: item.balance
  }));

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
            <CardDescription>Trading performance</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold transition-colors duration-300`}>
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : '-'}${Math.abs(totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[250px]">
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
      </CardContent>
    </Card>
  );
};

export default BalanceChart;
