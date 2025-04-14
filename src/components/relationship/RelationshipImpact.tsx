
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, HeartOff, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RelationshipImpactProps {
  houseguestName: string;
  impactValue: number;
  className?: string;
}

const RelationshipImpact: React.FC<RelationshipImpactProps> = ({
  houseguestName,
  impactValue,
  className
}) => {
  const isPositive = impactValue > 0;
  const bgColor = isPositive ? 'bg-green-100' : 'bg-red-100';
  const textColor = isPositive ? 'text-green-700' : 'text-red-700';
  const borderColor = isPositive ? 'border-green-300' : 'border-red-300';
  
  return (
    <Card className={cn(
      "w-full max-w-xs animate-in fade-in slide-in-from-bottom-5 duration-300",
      bgColor,
      borderColor,
      className
    )}>
      <CardContent className="p-3 flex items-center gap-2">
        {isPositive ? (
          <Heart className={cn("h-5 w-5", textColor)} />
        ) : (
          <HeartOff className={cn("h-5 w-5", textColor)} />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{houseguestName}</p>
          <p className="text-xs">Relationship {isPositive ? 'improved' : 'declined'}</p>
        </div>
        <div className={cn("flex items-center font-bold text-lg", textColor)}>
          {isPositive ? (
            <>
              <ArrowUp className="h-4 w-4 mr-0.5" />
              +{impactValue}
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4 mr-0.5" />
              {impactValue}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelationshipImpact;
