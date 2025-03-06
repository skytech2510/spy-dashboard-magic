
import { TooltipProps } from "recharts";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  valueFormatter?: (value: number) => string;
}

const CustomTooltip = ({ 
  active, 
  payload, 
  label, 
  valuePrefix = "$", 
  valueSuffix = "", 
  valueFormatter = (value) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    
    return (
      <div className="custom-tooltip bg-background/80 backdrop-blur-sm p-2 rounded border border-border shadow-lg">
        <p className="custom-tooltip-label font-medium">{label}</p>
        <p className="custom-tooltip-value text-lg">
          {valuePrefix}{valueFormatter(value)}{valueSuffix}
        </p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
