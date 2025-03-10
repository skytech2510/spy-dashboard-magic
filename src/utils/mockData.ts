// Function to generate realistic SPY price data
export const generateSpyPriceData = (days = 90, startPrice = 570.00) => {
  const data = [];
  let currentPrice = startPrice;
  
  // Generate data for the past X days until now
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  // Add some price patterns to make it look more realistic
  // Define a basic trend (slightly upward over time)
  const trendPerDay = 0.02; // Small upward trend of 0.02% per day on average
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Add some seasonality (weekly pattern)
    const dayOfWeek = date.getDay();
    let seasonalEffect = 0;
    if (dayOfWeek === 1) seasonalEffect = -0.1; // Mondays tend to be down slightly
    if (dayOfWeek === 5) seasonalEffect = 0.15; // Fridays tend to be up slightly
    
    // Add some volatility patterns
    // More volatility during certain periods
    const monthOfYear = date.getMonth();
    let volatilityMultiplier = 1;
    if (monthOfYear === 9) volatilityMultiplier = 1.5; // October is more volatile historically
    
    // Random daily price change with realistic volatility
    const baseVolatility = 0.7; // Base volatility in percentage
    const volatility = baseVolatility * volatilityMultiplier;
    const randomChange = (Math.random() * 2 * volatility - volatility) / 100;
    
    // Combine all effects
    const totalChangePercent = (trendPerDay + randomChange + seasonalEffect / 100) / 100;
    currentPrice = currentPrice * (1 + totalChangePercent);
    
    // Occasionally add a market shock (rare but significant move)
    if (Math.random() < 0.01) { // 1% chance of a shock on any given day
      const shockMagnitude = (Math.random() * 3 - 1.5) / 100; // -1.5% to +1.5%
      currentPrice = currentPrice * (1 + shockMagnitude);
    }
    
    data.push({
      date: new Date(date),
      price: parseFloat(currentPrice.toFixed(2))
    });
  }
  
  return data;
};

// Function to generate account balance data with trading performance
export const generateAccountData = (days = 90, startBalance = 10000) => {
  const data = [];
  let currentBalance = startBalance;
  
  // Generate spy data first to correlate trading performance with market
  const spyData = generateSpyPriceData(days);
  const spyPrices = new Map();
  spyData.forEach(item => {
    const dateKey = item.date.toISOString().split('T')[0];
    spyPrices.set(dateKey, item.price);
  });
  
  // Generate data for the past X days until now
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  // Define trading strategy parameters
  const winRate = 0.68; // 68% success rate as shown in stats
  const avgWinPercent = 0.87 / 100; // 0.87% average win
  const avgLossPercent = 0.52 / 100; // 0.52% average loss
  
  // Keep track of total trades for statistics
  let totalTrades = 0;
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateKey = date.toISOString().split('T')[0];
    const spyPrice = spyPrices.get(dateKey);
    
    // Only trade if we have spy price data for this day
    if (spyPrice) {
      // Determine if there's a trade today (about 70% of trading days)
      const tradeToday = Math.random() < 0.7;
      
      if (tradeToday) {
        totalTrades++;
        // Determine if it's a winning trade
        const isWin = Math.random() < winRate;
        
        // Calculate the change in balance
        let tradeChangePercent;
        if (isWin) {
          // Winning trade: average gain plus some variability
          tradeChangePercent = avgWinPercent * (0.8 + Math.random() * 0.4);
        } else {
          // Losing trade: average loss plus some variability
          tradeChangePercent = -avgLossPercent * (0.8 + Math.random() * 0.4);
        }
        
        // Apply the trade result to the balance
        currentBalance = currentBalance * (1 + tradeChangePercent);
      } else {
        // No trade today, minimal change from market drift
        const driftPercent = (Math.random() * 0.1 - 0.05) / 100;
        currentBalance = currentBalance * (1 + driftPercent);
      }
    }
    
    data.push({
      date: new Date(date),
      balance: parseFloat(currentBalance.toFixed(2))
    });
  }
  
  return data;
};

// Generate real-time data points (last hour)
export const generateRealtimeData = (points = 60, basePrice = 572.50) => {
  // Use the last X days of spy data and scale it down to minutes
  const spyData = generateSpyPriceData(points / 2);
  const data = [];
  const now = new Date();
  
  // Scale the daily data to minutes
  for (let i = 0; i < Math.min(points, spyData.length); i++) {
    const time = new Date(now);
    time.setMinutes(now.getMinutes() - (points - i));
    
    // Use the pattern from spy data but scale volatility down
    let price;
    if (i === 0) {
      price = basePrice;
    } else {
      const spyDailyChange = spyData[i].price / spyData[i-1].price - 1;
      // Minute-by-minute changes are smaller than daily changes
      const scaledChange = spyDailyChange * 0.05; 
      price = data[i-1].price * (1 + scaledChange);
    }
    
    data.push({
      time,
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return data;
};

// Function to get live price data (simulated)
export const getLivePrice = (lastPrice = 572.50): number => {
  // Simulate small price movements based on a random walk with drift
  // Upward drift of 0.01% on average (annualized ~2.5%)
  const drift = 0.0001 * (Math.random() * 0.5 + 0.75);
  // Random component (volatility)
  const randomComponent = (Math.random() * 0.2 - 0.1) * 0.05;
  return parseFloat((lastPrice * (1 + drift + randomComponent)).toFixed(2));
};

// Simulated data update function
export const getUpdatedData = (
  currentData: Array<{time: Date, price: number}>,
  lastPrice: number
) => {
  const newData = [...currentData];
  const now = new Date();
  
  // Remove oldest data point
  newData.shift();
  
  // Add new data point
  const newPrice = getLivePrice(lastPrice);
  newData.push({
    time: now,
    price: newPrice
  });
  
  return { newData, newPrice };
};

// Function to update account data (simulated for live trading)
export const getUpdatedAccountData = (
  currentData: Array<{date: Date, balance: number}>
) => {
  const newData = [...currentData];
  const lastBalance = newData[newData.length - 1].balance;
  
  // Trading performance: slightly higher chance of profit than loss
  // Simulating the trading algorithm with a slight positive edge
  const changePercent = (Math.random() * 0.4 - 0.15) / 100; // Slight positive bias
  const newBalance = lastBalance * (1 + changePercent);
  
  // Add new day if necessary, otherwise update latest
  const today = new Date();
  const lastDate = newData[newData.length - 1].date;
  
  if (today.getDate() !== lastDate.getDate() || 
      today.getMonth() !== lastDate.getMonth() || 
      today.getFullYear() !== lastDate.getFullYear()) {
    // If it's a new day, add a new data point
    newData.push({
      date: today,
      balance: parseFloat(newBalance.toFixed(2))
    });
    
    // If we have more than 90 days of data, remove the oldest
    if (newData.length > 90) {
      newData.shift();
    }
  } else {
    // Otherwise update the latest data point
    newData[newData.length - 1].balance = parseFloat(newBalance.toFixed(2));
  }
  
  return { 
    newData, 
    newBalance: parseFloat(newBalance.toFixed(2)) 
  };
};

// Function to calculate daily profit percentages from account data
export const calculateDailyProfitPercentages = (accountData: Array<{date: Date, balance: number}>) => {
  if (accountData.length < 2) return [];
  
  const profitData = [];
  
  for (let i = 1; i < accountData.length; i++) {
    const yesterdayBalance = accountData[i-1].balance;
    const todayBalance = accountData[i].balance;
    const percentChange = ((todayBalance - yesterdayBalance) / yesterdayBalance) * 100;
    
    profitData.push({
      date: accountData[i].date,
      percentage: parseFloat(percentChange.toFixed(2))
    });
  }
  
  return profitData;
};
