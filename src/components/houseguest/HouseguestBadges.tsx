
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Crown, Award, Target } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { cn } from '@/lib/utils';

interface HouseguestBadgesProps {
  houseguest: Houseguest;
  compact?: boolean;
}

const HouseguestBadges: React.FC<HouseguestBadgesProps> = ({ houseguest, compact = false }) => {
  if (!houseguest.isHoH && !houseguest.isPovHolder && !houseguest.isNominated) {
    return null;
  }

  return (
    <div className={cn("flex gap-1 z-10", compact && "flex-col")}>
      {houseguest.isHoH && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="default" 
                className={cn(
                  "bg-bb-gold border-none",
                  compact ? "p-1 h-5 w-5 flex items-center justify-center" : "px-2"
                )}
              >
                <Crown className="h-3 w-3" />
                {!compact && <span className="ml-1">HoH</span>}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Head of Household</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {houseguest.isPovHolder && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="outline" 
                className={cn(
                  "bg-bb-green text-bb-dark border-none",
                  compact ? "p-1 h-5 w-5 flex items-center justify-center" : "px-2"
                )}
              >
                <Award className="h-3 w-3" />
                {!compact && <span className="ml-1">PoV</span>}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Power of Veto holder</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {houseguest.isNominated && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="destructive" 
                className={cn(
                  "bg-bb-red border-none",
                  compact ? "p-1 h-5 w-5 flex items-center justify-center" : "px-2"
                )}
              >
                <Target className="h-3 w-3" />
                {!compact && <span className="ml-1">Nom</span>}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nominated for eviction</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default HouseguestBadges;
