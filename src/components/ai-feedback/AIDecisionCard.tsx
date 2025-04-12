
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ThumbsUp, ThumbsDown, Scale, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AIDecisionCardProps {
  decisionMaker: string;
  decisionType: string;
  reasoning: string;
  outcome: string;
  relationshipImpacts?: Array<{
    name: string;
    change: number;
  }>;
  className?: string;
}

const AIDecisionCard: React.FC<AIDecisionCardProps> = ({
  decisionMaker,
  decisionType,
  reasoning,
  outcome,
  relationshipImpacts,
  className,
}) => {
  return (
    <Card className={cn("shadow-md border-blue-200 max-w-md w-full", className)}>
      <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium flex items-center gap-1.5">
            <Brain size={18} className="text-blue-600" />
            AI Decision Process
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {decisionType}
          </Badge>
        </div>
        <CardDescription>
          {decisionMaker}'s thought process
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4 pb-2 space-y-3 text-sm">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">REASONING</h4>
          <p className="italic text-gray-700 dark:text-gray-300">"{reasoning}"</p>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">DECISION</h4>
          <p className="font-medium">{outcome}</p>
        </div>
        
        {relationshipImpacts && relationshipImpacts.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">RELATIONSHIP IMPACTS</h4>
              <div className="space-y-1">
                {relationshipImpacts.map((impact, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <span>{impact.name}</span>
                    </div>
                    <Badge 
                      variant={impact.change > 0 ? "default" : "destructive"}
                      className={cn(
                        "font-normal",
                        impact.change > 0 ? "bg-green-100 text-green-800 hover:bg-green-200" : 
                                          "bg-red-100 text-red-800 hover:bg-red-200"
                      )}
                    >
                      {impact.change > 0 && '+'}{impact.change.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 text-xs text-muted-foreground">
        <Scale size={12} className="mr-1" /> AI decisions are based on personality, relationships, and game state
      </CardFooter>
    </Card>
  );
};

export default AIDecisionCard;
