
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Circle, HelpCircle, Shield, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Update this type to include 'active' to match the model definition
export type PromiseStatus = 'kept' | 'fulfilled' | 'broken' | 'pending' | 'active' | 'expired';

interface PromiseDisplayProps {
  promiser: string;
  promisee: string;
  description: string;
  promiseType: string;
  status: PromiseStatus;
  week: number;
  currentWeek: number;
  className?: string;
  onClick?: () => void;
}

const PromiseDisplay: React.FC<PromiseDisplayProps> = ({
  promiser,
  promisee,
  description,
  promiseType,
  status,
  week,
  currentWeek,
  className,
  onClick
}) => {
  // Get status-specific styles and icons
  const statusConfig = {
    kept: {
      icon: <CheckCircle size={16} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Kept',
      description: 'This promise was successfully kept'
    },
    fulfilled: {
      icon: <CheckCircle size={16} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Fulfilled',
      description: 'The conditions of this promise were met'
    },
    broken: {
      icon: <XCircle size={16} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Broken',
      description: 'The conditions of this promise were violated'
    },
    pending: {
      icon: <Clock size={16} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Pending',
      description: 'This promise is waiting to be fulfilled'
    },
    active: {
      icon: <Circle size={16} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Active',
      description: 'This promise is currently active'
    },
    expired: {
      icon: <HelpCircle size={16} />,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Expired',
      description: 'This promise is no longer relevant'
    }
  };
  
  // Use active config for active status, or get other configs
  const config = statusConfig[status];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={cn(
              "border shadow-sm hover:shadow-md transition-shadow", 
              config.borderColor, 
              config.bgColor,
              onClick && "cursor-pointer",
              className
            )}
            onClick={onClick}
          >
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Shield className="mr-1.5 h-4 w-4" />
                  Promise
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn("font-normal", config.color)}
                >
                  <span className="flex items-center gap-1">
                    {config.icon}
                    {config.label}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="py-2 px-4">
              <p className="text-sm">{description}</p>
            </CardContent>
            
            <CardFooter className="py-3 px-4 text-xs text-muted-foreground flex justify-between border-t">
              <span>{promiser} → {promisee}</span>
              <span>Week {week} {currentWeek !== week && <span>({currentWeek - week} weeks ago)</span>}</span>
            </CardFooter>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-sm font-semibold">{config.label} Promise</p>
            <p className="text-xs">{config.description}</p>
            <p className="text-xs text-muted-foreground">Made in week {week}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PromiseDisplay;
