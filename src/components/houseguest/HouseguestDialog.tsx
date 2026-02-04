import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Award, Target, Heart, HeartOff, MessageCircle, Handshake, Users, Lock } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import HouseguestAvatar from './HouseguestAvatar';
import CustomProgress from '../game-phases/NominationPhase/CustomProgress';
import ProposeDealDialog from '@/components/deals/ProposeDealDialog';
import { toast } from 'sonner';

interface HouseguestDialogProps {
  houseguest: Houseguest;
}

const HouseguestDialog: React.FC<HouseguestDialogProps> = ({ houseguest }) => {
  const { gameState, getRelationship, dispatch } = useGame();
  const player = gameState.houseguests.find(h => h.isPlayer);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  
  // Check if social phase is active
  const isSocialPhase = gameState.phase === 'SocialInteraction';
  
  let relationshipScore = 0;
  let relationshipColor = '';
  
  if (player && !houseguest.isPlayer) {
    relationshipScore = getRelationship(player.id, houseguest.id);
    
    if (relationshipScore > 50) {
      relationshipColor = 'text-green-600';
    } else if (relationshipScore > 0) {
      relationshipColor = 'text-green-400';
    } else if (relationshipScore > -50) {
      relationshipColor = 'text-red-400';
    } else {
      relationshipColor = 'text-red-600';
    }
  }

  const handleTalkTo = () => {
    dispatch({ 
      type: 'PLAYER_ACTION', 
      payload: { actionId: 'talk_to', params: { targetId: houseguest.id } }
    });
    toast.success(`You had a conversation with ${houseguest.name}`);
  };

  const handleBuildRelationship = () => {
    dispatch({ 
      type: 'PLAYER_ACTION', 
      payload: { actionId: 'relationship_building', params: { targetId: houseguest.id } }
    });
    toast.success(`You spent quality time with ${houseguest.name}`);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <span className="mr-2">{houseguest.name}</span>
          {houseguest.isHoH && <Crown className="h-4 w-4 text-bb-gold" />}
          {houseguest.isPovHolder && <Award className="h-4 w-4 text-bb-green" />}
          {houseguest.isNominated && <Target className="h-4 w-4 text-bb-red" />}
        </DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <HouseguestAvatar houseguest={houseguest} size="lg" rounded={false} />
          
          <div className="space-y-1">
            <p className="text-sm">Age: {houseguest.age}</p>
            <p className="text-sm">Occupation: {houseguest.occupation}</p>
            <p className="text-sm">Status: {houseguest.status}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {houseguest.traits.map(trait => (
                <Badge key={trait} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {player && !houseguest.isPlayer && (
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Relationship with you:</h4>
            <div className="flex items-center gap-2">
              {relationshipScore > 0 ? (
                <Heart className="h-4 w-4 text-green-500" />
              ) : (
                <HeartOff className="h-4 w-4 text-red-500" />
              )}
              <CustomProgress 
                value={50 + relationshipScore/2} 
                className="h-2 flex-1"
                indicatorClassName={
                  relationshipScore > 0 
                    ? 'bg-gradient-to-r from-green-300 to-green-600' 
                    : 'bg-gradient-to-r from-red-300 to-red-600'
                }
              />
              <span className={`font-bold ${relationshipColor}`}>{relationshipScore}</span>
            </div>
          </div>
        )}

        {/* Social Actions - only for non-player, active houseguests */}
        {player && !houseguest.isPlayer && houseguest.status === 'Active' && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Actions
              {!isSocialPhase && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                  <Lock className="h-3 w-3" />
                  Social Phase Only
                </span>
              )}
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTalkTo}
                disabled={!isSocialPhase}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Talk
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleBuildRelationship}
                disabled={!isSocialPhase}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Bond
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDealDialogOpen(true)}
                disabled={!isSocialPhase}
                className="flex items-center gap-2 col-span-2 border-amber-300 hover:bg-amber-50"
              >
                <Handshake className="h-4 w-4 text-amber-600" />
                Propose Deal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Propose Deal Dialog */}
      <ProposeDealDialog
        open={dealDialogOpen}
        onOpenChange={setDealDialogOpen}
        params={{
          targetId: houseguest.id,
          targetName: houseguest.name
        }}
      />
    </DialogContent>
  );
};

export default HouseguestDialog;
