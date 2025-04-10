
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import EvictionInteractionDialog from './EvictionInteractionDialog';
import PlayerCampaignSection from './PlayerCampaignSection';
import NonPlayerSection from './NonPlayerSection';
import { useGame } from '@/contexts/GameContext';

interface EvictionInteractionStageProps {
  nominees: Houseguest[];
  nonNominees: Houseguest[];
  playerIsNominee: boolean;
  onInteractionStageComplete: () => void;
}

const EvictionInteractionStage: React.FC<EvictionInteractionStageProps> = ({
  nominees,
  nonNominees,
  playerIsNominee,
  onInteractionStageComplete,
}) => {
  const { toast } = useToast();
  const { gameState } = useGame();
  const [selectedHouseguest, setSelectedHouseguest] = useState<Houseguest | null>(null);
  const [remainingInteractions, setRemainingInteractions] = useState(3);
  const [isInteractionStageComplete, setIsInteractionStageComplete] = useState(false);
  
  // Find player houseguest
  const player = gameState.houseguests.find(guest => guest.isPlayer);
  
  const handleInteractWithHouseguest = (houseguest: Houseguest) => {
    if (remainingInteractions <= 0) {
      toast({
        title: "No Interactions Left",
        description: "You've used all your interactions for this round.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedHouseguest(houseguest);
  };
  
  const handleInteractionComplete = () => {
    setSelectedHouseguest(null);
    setRemainingInteractions(prev => prev - 1);
    
    toast({
      title: "Interaction Complete",
      description: `You have ${remainingInteractions - 1} interactions left.`,
    });
    
    if (remainingInteractions - 1 <= 0) {
      setIsInteractionStageComplete(true);
    }
  };

  return (
    <>
      {playerIsNominee ? (
        <PlayerCampaignSection
          nonNominees={nonNominees}
          remainingInteractions={remainingInteractions}
          isInteractionStageComplete={isInteractionStageComplete}
          onInteractWithHouseguest={handleInteractWithHouseguest}
          onInteractionStageComplete={onInteractionStageComplete}
        />
      ) : (
        <NonPlayerSection
          nominees={nominees}
          onInteractionStageComplete={onInteractionStageComplete}
        />
      )}
      
      {selectedHouseguest && player && (
        <EvictionInteractionDialog
          houseguest={selectedHouseguest}
          player={player}
          gameState={gameState}
          onInteractionComplete={handleInteractionComplete}
        />
      )}
    </>
  );
};

export default EvictionInteractionStage;
