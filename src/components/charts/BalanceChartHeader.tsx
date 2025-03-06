
import { calculatePerformance } from "@/utils/chartUtils";
import { CardDescription, CardTitle } from "@/components/ui/card";

interface BalanceChartHeaderProps {
  currentBalance: number;
  startBalance: number;
}

const BalanceChartHeader = ({ currentBalance, startBalance }: BalanceChartHeaderProps) => {
  const { gain, gainPercent, isPositive } = calculatePerformance(currentBalance, startBalance);

  return (
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
          {isPositive ? '+' : '-'}${Math.abs(gain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default BalanceChartHeader;
