
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

const CustomProgress: React.FC<CustomProgressProps> = ({ 
  value, 
  className, 
  indicatorClassName 
}) => {
  // Ensure value is between 0 and 100
  const safeValue = Math.max(0, Math.min(100, value));
  
  return (
    <div 
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
    >
      <div
        className={cn(
          "h-full flex-1 transition-all",
          indicatorClassName || "bg-primary"
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
};

export default CustomProgress;
