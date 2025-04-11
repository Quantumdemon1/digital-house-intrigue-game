
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

import HouseguestAvatar from './HouseguestAvatar';
import HouseguestBadges from './HouseguestBadges';
import HouseguestRelationship from './HouseguestRelationship';
import HouseguestDialog from './HouseguestDialog';

interface HouseguestCardProps {
  houseguest: Houseguest;
  showRelationship?: boolean;
}

const HouseguestCard: React.FC<HouseguestCardProps> = ({ 
  houseguest, 
  showRelationship = false 
}) => {
  const { gameState, getRelationship } = useGame();
  const player = gameState.houseguests.find(h => h.isPlayer);
  
  let relationshipScore = 0;
  let relationshipColor = '';
  let relationshipBorderStyle = '';
  
  if (player && showRelationship && !houseguest.isPlayer) {
    relationshipScore = getRelationship(player.id, houseguest.id);
    
    if (relationshipScore > 50) {
      relationshipColor = 'text-green-600';
      relationshipBorderStyle = 'border-green-600/50';
    } else if (relationshipScore > 0) {
      relationshipColor = 'text-green-400';
      relationshipBorderStyle = 'border-green-400/40';
    } else if (relationshipScore > -50) {
      relationshipColor = 'text-red-400';
      relationshipBorderStyle = 'border-red-400/40';
    } else {
      relationshipColor = 'text-red-600';
      relationshipBorderStyle = 'border-red-600/50';
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card 
          className={cn(
            "relative shadow-md hover:shadow-lg transition-shadow cursor-pointer",
            houseguest.isPlayer ? 'border-bb-green border-2' : 
            showRelationship ? relationshipBorderStyle : ''
          )}
        >
          <div className="absolute top-2 right-2 z-10">
            <HouseguestBadges houseguest={houseguest} />
          </div>
          
          <CardContent className="pt-5">
            <div className="flex flex-col items-center">
              <HouseguestAvatar houseguest={houseguest} className="mb-2" />
              
              <h3 className="font-bold text-center">
                {houseguest.name}
                {houseguest.isPlayer && <span className="text-bb-green text-sm ml-1">(You)</span>}
              </h3>
              
              <p className="text-xs text-muted-foreground text-center">
                {houseguest.age} • {houseguest.occupation}
              </p>
              
              {showRelationship && !houseguest.isPlayer && player && (
                <div className="mt-2 w-full">
                  <HouseguestRelationship 
                    relationshipScore={relationshipScore}
                    relationshipColor={relationshipColor}
                  />
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="p-2 text-xs flex justify-between items-center">
            <div className="flex space-x-1 flex-wrap">
              {houseguest.traits.slice(0, 2).map(trait => (
                <Badge key={trait} variant="secondary" className="text-[10px] mb-1">
                  {trait}
                </Badge>
              ))}
              {houseguest.traits.length > 2 && (
                <Badge variant="outline" className="text-[10px]">
                  +{houseguest.traits.length - 2}
                </Badge>
              )}
            </div>
            <Info className="h-3 w-3 text-muted-foreground" />
          </CardFooter>
        </Card>
      </DialogTrigger>
      
      <HouseguestDialog houseguest={houseguest} />
    </Dialog>
  );
};

export default HouseguestCard;
