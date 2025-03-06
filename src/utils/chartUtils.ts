
// Format date for display in charts
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

// Calculate performance metrics
export const calculatePerformance = (currentValue: number, startValue: number) => {
  const gain = currentValue - startValue;
  const gainPercent = (gain / startValue) * 100;
  const isPositive = gain >= 0;
  
  return {
    gain,
    gainPercent,
    isPositive
  };
};
