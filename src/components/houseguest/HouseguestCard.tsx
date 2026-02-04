
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

import { StatusAvatar, AvatarStatus } from '@/components/ui/status-avatar';
import HouseguestBadges from './HouseguestBadges';
import HouseguestRelationship from './HouseguestRelationship';
import HouseguestDialog from './HouseguestDialog';
import StrategicIntel from './StrategicIntel';

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
      relationshipColor = 'text-game-success';
      relationshipBorderStyle = 'border-bb-green/50';
    } else if (relationshipScore > 0) {
      relationshipColor = 'text-bb-green-light';
      relationshipBorderStyle = 'border-bb-green/30';
    } else if (relationshipScore > -50) {
      relationshipColor = 'text-bb-red-light';
      relationshipBorderStyle = 'border-bb-red/30';
    } else {
      relationshipColor = 'text-game-danger';
      relationshipBorderStyle = 'border-bb-red/50';
    }
  }

  // Determine houseguest status for avatar
  const getHouseguestStatus = (): AvatarStatus => {
    const isActive = houseguest.status === 'Active';
    if (!isActive) return 'evicted';
    if (gameState.hohWinner === houseguest.id) return 'hoh';
    if (gameState.povWinner === houseguest.id) return 'pov';
    if (gameState.nominees.includes(houseguest.id)) return 'nominee';
    return 'none';
  };

  const isActive = houseguest.status === 'Active';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card 
          className={cn(
            "game-card relative cursor-pointer group",
            houseguest.isPlayer && 'ring-2 ring-bb-green ring-offset-2',
            showRelationship && relationshipBorderStyle,
            !isActive && 'opacity-60'
          )}
        >
          <div className="absolute top-2 right-2 z-10">
            <HouseguestBadges houseguest={houseguest} />
          </div>
          
          <CardContent className="pt-5">
            <div className="flex flex-col items-center min-w-0">
              <StatusAvatar 
                name={houseguest.name}
                imageUrl={houseguest.avatarUrl}
                status={getHouseguestStatus()}
                size="md"
                isPlayer={houseguest.isPlayer}
                className="mb-3 group-hover:scale-105 transition-transform duration-200"
              />
              
              <h3 className="font-bold text-center truncate max-w-full">
                {houseguest.name}
                {houseguest.isPlayer && (
                  <span className="text-bb-green text-xs ml-1 font-normal">(You)</span>
                )}
              </h3>
              
              <p className="text-xs text-muted-foreground text-center mt-0.5 truncate max-w-full">
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
              
              {/* Strategic Intel - shows based on player's Strategic stat */}
              {!houseguest.isPlayer && (
                <StrategicIntel 
                  houseguestId={houseguest.id}
                  houseguestName={houseguest.name}
                  compact
                />
              )}
            </div>
          </CardContent>
          
          <CardFooter className="p-2 pt-0 text-xs flex justify-between items-center">
            <div className="flex gap-1 flex-wrap">
              {houseguest.traits.slice(0, 2).map(trait => (
                <span 
                  key={trait} 
                  className="bb-badge muted text-[10px] py-0.5"
                >
                  {trait}
                </span>
              ))}
              {houseguest.traits.length > 2 && (
                <span className="bb-badge muted text-[10px] py-0.5">
                  +{houseguest.traits.length - 2}
                </span>
              )}
            </div>
            <Info className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardFooter>
        </Card>
      </DialogTrigger>
      
      <HouseguestDialog houseguest={houseguest} />
    </Dialog>
  );
};

export default HouseguestCard;
