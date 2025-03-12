
import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRealTimePrice, getFallbackPrice } from "@/services/alpacaService";

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
  const [data, setData] = useState<Array<{time: Date, price: number}>>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update the chart with real-time data
  const updateChartWithRealData = async () => {
    try {
      // Get price from Alpaca
      const newPrice = await getRealTimePrice();

      // If we got a valid price, update the chart
      if (newPrice !== null) {
        if (currentPrice !== null) {
          setPrevPrice(currentPrice);
        }
        
        const now = new Date();
        
        // Update the data array
        const newData = [...data];
        
        // If we have more than 120 data points, remove the oldest
        if (newData.length >= 120) {
          newData.shift();
        }
        
        newData.push({
          time: now,
          price: newPrice
        });
        
        setData(newData);
        setCurrentPrice(newPrice);
        setLastUpdated(now);
        setIsLoading(false);
      } else if (currentPrice !== null) {
        // If API call failed but we have a previous price, use fallback
        console.log("Using fallback price data");
        const fallbackPrice = getFallbackPrice(currentPrice);
        setPrevPrice(currentPrice);
        const now = new Date();
        
        const newData = [...data];
        if (newData.length >= 120) {
          newData.shift();
        }
        
        newData.push({
          time: now,
          price: fallbackPrice
        });
        
        setData(newData);
        setCurrentPrice(fallbackPrice);
        setLastUpdated(now);
      }
    } catch (error) {
      console.error("Error updating chart:", error);
    }
  };

  // Effect for handling data updates
  useEffect(() => {
    // Make an initial API call when component mounts
    updateChartWithRealData();
    
    // Update every minute if trading is active
    if (isTrading) {
      // Clear any existing interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      
      // Set new interval (every 60 seconds)
      updateIntervalRef.current = setInterval(() => {
        updateChartWithRealData();
      }, 2000); // 60 seconds
    } else if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    
    // Cleanup
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isTrading]);

  // Calculate price change values if we have current and previous prices
  const priceChange = currentPrice !== null && prevPrice !== null ? currentPrice - prevPrice : 0;
  const priceChangePercent = currentPrice !== null && prevPrice !== null && prevPrice !== 0 
    ? (priceChange / prevPrice) * 100 
    : 0;
  const isPriceUp = priceChange >= 0;

  const chartData = data.map(item => ({
    time: formatTime(item.time),
    price: item.price
  }));

  // Show loading state when waiting for data
  if (isLoading) {
    return (
      <Card className="glass-card overflow-hidden transition-all duration-300 h-full animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">SPY Price</CardTitle>
          <CardDescription>Loading real-time data from Alpaca...</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-center h-[250px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 w-24 bg-muted rounded mb-2"></div>
            <div className="text-sm text-muted-foreground">Fetching latest price...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 h-full animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              SPY Price 
              {prevPrice !== null && (
                <span className={`text-sm font-normal ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
                  {isPriceUp ? '▲' : '▼'} {Math.abs(priceChangePercent).toFixed(2)}%
                </span>
              )}
            </CardTitle>
            <CardDescription>Real-time price from Alpaca</CardDescription>
          </div>
          <div className="text-right">
            {currentPrice !== null && (
              <div className={`text-2xl font-bold ${isPriceUp ? 'text-green-500' : 'text-red-500'} transition-colors duration-300`}>
                ${currentPrice.toFixed(2)}
              </div>
            )}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[250px]">
        {data.length > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              Waiting for data...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceChart;
