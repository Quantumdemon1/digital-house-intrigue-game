
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Crown, Award, Target } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';

interface HouseguestBadgesProps {
  houseguest: Houseguest;
}

const HouseguestBadges: React.FC<HouseguestBadgesProps> = ({ houseguest }) => {
  if (!houseguest.isHoH && !houseguest.isPovHolder && !houseguest.isNominated) {
    return null;
  }

  return (
    <div className="flex gap-1 z-10">
      {houseguest.isHoH && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="default" className="bg-bb-gold border-none">
                <Crown className="h-3 w-3 mr-1" />
                HoH
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
              <Badge variant="outline" className="bg-bb-green text-bb-dark border-none">
                <Award className="h-3 w-3 mr-1" />
                PoV
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
              <Badge variant="destructive" className="bg-bb-red border-none">
                <Target className="h-3 w-3 mr-1" />
                Nom
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
