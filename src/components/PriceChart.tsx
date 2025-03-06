
import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRealtimeData, getUpdatedData } from "@/utils/mockData";

interface PriceChartProps {
  isTrading: boolean;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const price = payload[0].value;
    const time = label;
    
    return (
      <div className="custom-tooltip bg-background/80 backdrop-blur-sm p-2 rounded border border-border shadow-lg">
        <p className="custom-tooltip-label font-medium">{time}</p>
        <p className="custom-tooltip-value text-lg">${price.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const formatTime = (time: Date) => {
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const PriceChart: React.FC<PriceChartProps> = ({ isTrading }) => {
  // Generate more realistic intraday data (120 data points)
  const [data, setData] = useState(generateRealtimeData(120));
  const [currentPrice, setCurrentPrice] = useState(data[data.length - 1].price);
  const [prevPrice, setPrevPrice] = useState(currentPrice);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for handling data updates
  useEffect(() => {
    // Update every 3 seconds if trading is active
    if (isTrading) {
      updateIntervalRef.current = setInterval(() => {
        setPrevPrice(currentPrice);
        const { newData, newPrice } = getUpdatedData(data, currentPrice);
        setData(newData);
        setCurrentPrice(newPrice);
      }, 3000);
    } else if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    
    // Cleanup
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isTrading, data, currentPrice]);

  const priceChange = currentPrice - prevPrice;
  const priceChangePercent = (priceChange / prevPrice) * 100;
  const isPriceUp = priceChange >= 0;

  const chartData = data.map(item => ({
    time: formatTime(item.time),
    price: item.price
  }));

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 h-full animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              SPY Price 
              <span className={`text-sm font-normal ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
                {isPriceUp ? '▲' : '▼'} {Math.abs(priceChangePercent).toFixed(2)}%
              </span>
            </CardTitle>
            <CardDescription>Intraday price tracking</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${isPriceUp ? 'text-green-500' : 'text-red-500'} transition-colors duration-300`}>
              ${currentPrice.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']} 
              tick={{ fontSize: 10 }} 
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--chart-line))" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 5, stroke: "white", strokeWidth: 2 }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
