
import React from 'react';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { cn } from '@/lib/utils';
import { StatusAvatar, AvatarStatus } from '@/components/ui/status-avatar';
import HouseguestBadges from './HouseguestBadges';
import HouseguestDialog from './HouseguestDialog';

interface HouseguestCardCompactProps {
  houseguest: Houseguest;
  showRelationship?: boolean;
}

const HouseguestCardCompact: React.FC<HouseguestCardCompactProps> = ({ 
  houseguest, 
  showRelationship = false 
}) => {
  const { gameState, getRelationship } = useGame();
  const player = gameState.houseguests.find(h => h.isPlayer);
  
  let relationshipScore = 0;
  let relationshipBorderStyle = '';
  
  if (player && showRelationship && !houseguest.isPlayer) {
    relationshipScore = getRelationship(player.id, houseguest.id);
    
    if (relationshipScore > 50) {
      relationshipBorderStyle = 'border-bb-green/50';
    } else if (relationshipScore > 0) {
      relationshipBorderStyle = 'border-bb-green/30';
    } else if (relationshipScore > -50) {
      relationshipBorderStyle = 'border-bb-red/30';
    } else {
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
        <div 
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg border bg-card cursor-pointer transition-all duration-200 hover:bg-accent/50 group",
            houseguest.isPlayer && 'ring-1 ring-bb-green ring-offset-1',
            showRelationship && relationshipBorderStyle,
            !isActive && 'opacity-60'
          )}
        >
          <StatusAvatar 
            name={houseguest.name}
            status={getHouseguestStatus()}
            size="sm"
            isPlayer={houseguest.isPlayer}
            className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
          />
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {houseguest.name}
              {houseguest.isPlayer && (
                <span className="text-bb-green text-xs ml-1">(You)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {houseguest.age} • {houseguest.occupation}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <HouseguestBadges houseguest={houseguest} compact />
          </div>
        </div>
      </DialogTrigger>
      
      <HouseguestDialog houseguest={houseguest} />
    </Dialog>
  );
};

export default HouseguestCardCompact;
