
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
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default CustomProgress;
