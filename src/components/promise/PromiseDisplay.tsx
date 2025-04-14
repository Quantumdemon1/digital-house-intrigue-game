
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Circle, HelpCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      label: 'Kept'
    },
    fulfilled: {
      icon: <CheckCircle size={16} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Fulfilled'
    },
    broken: {
      icon: <XCircle size={16} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Broken'
    },
    pending: {
      icon: <Circle size={16} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Pending'
    },
    active: {
      icon: <Circle size={16} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Active'
    },
    expired: {
      icon: <HelpCircle size={16} />,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Expired'
    }
  };
  
  // Use active config for active status, or get other configs
  const config = statusConfig[status];
  
  return (
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
        <span>Week {week}</span>
      </CardFooter>
    </Card>
  );
};

export default PromiseDisplay;
