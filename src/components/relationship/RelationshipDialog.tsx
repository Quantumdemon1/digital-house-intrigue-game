
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, HeartOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RelationshipDialog: React.FC<RelationshipDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { gameState, getHouseguestById } = useGame();
  const player = gameState.houseguests.find(hg => hg.isPlayer);
  
  if (!player) return null;
  
  const getRelationshipColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-lime-100 text-lime-800 border-lime-300';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score >= 20) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Get relationships for the player
  const playerRelationships = gameState.relationships.get(player.id) || new Map();
  // Sort by relationship score (highest first)
  const sortedRelationships = Array.from(playerRelationships.entries())
    .sort((a, b) => b[1].score - a[1].score);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Your Relationships
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {sortedRelationships.map(([houseguestId, relationship]) => {
              const houseguest = getHouseguestById(houseguestId);
              if (!houseguest || houseguest.status !== 'Active') return null;
              
              return (
                <Card key={houseguestId} className="p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{houseguest.name}</div>
                    <div className="text-xs text-muted-foreground">{houseguest.occupation}</div>
                  </div>
                  
                  <Badge className={`${getRelationshipColor(relationship.score)} min-w-[3rem] text-center`}>
                    {relationship.score}
                  </Badge>
                </Card>
              );
            })}
            
            {sortedRelationships.length === 0 && (
              <div className="text-center py-8">
                <HeartOff className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No relationships established yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipDialog;
