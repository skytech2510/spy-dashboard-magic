
// Function to generate realistic SPY price data
export const generateSpyPriceData = (days = 30, startPrice = 470.00) => {
  const data = [];
  let currentPrice = startPrice;
  
  // Generate data for the past X days until now
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random daily price change with realistic volatility (-1.5% to +1.5%)
    const changePercent = (Math.random() * 3 - 1.5) / 100;
    currentPrice = currentPrice * (1 + changePercent);
    
    data.push({
      date: new Date(date),
      price: parseFloat(currentPrice.toFixed(2))
    });
  }
  
  return data;
};

// Function to generate account balance data with trading performance
export const generateAccountData = (days = 30, startBalance = 10000) => {
  const data = [];
  let currentBalance = startBalance;
  
  // Generate data for the past X days until now
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Trading performance: slightly higher chance of profit than loss
    const changePercent = (Math.random() * 4 - 1.6) / 100; // Slight positive bias
    currentBalance = currentBalance * (1 + changePercent);
    
    data.push({
      date: new Date(date),
      balance: parseFloat(currentBalance.toFixed(2))
    });
  }
  
  return data;
};

// Generate real-time data points (last hour)
export const generateRealtimeData = (points = 60, basePrice = 472.50) => {
  const data = [];
  const now = new Date();
  let price = basePrice;
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now);
    time.setMinutes(now.getMinutes() - i);
    
    // Smaller volatility for minute-by-minute data
    const change = (Math.random() * 0.2 - 0.1);
    price += change;
    
    data.push({
      time,
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return data;
};

// Function to get live price data (simulated)
export const getLivePrice = (lastPrice = 472.50): number => {
  // Simulate very small random price movements
  const change = (Math.random() * 0.1 - 0.05);
  return parseFloat((lastPrice + change).toFixed(2));
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
