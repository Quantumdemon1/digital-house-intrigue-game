
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import EvictionInteractionDialog from './EvictionInteractionDialog';
import PlayerCampaignSection from './PlayerCampaignSection';
import NonPlayerSection from './NonPlayerSection';

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
  const [selectedHouseguest, setSelectedHouseguest] = useState<Houseguest | null>(null);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [remainingInteractions, setRemainingInteractions] = useState(3);
  const [isInteractionStageComplete, setIsInteractionStageComplete] = useState(false);
  
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
    setIsInteractionDialogOpen(true);
  };
  
  const handleInteractionComplete = (success: boolean) => {
    setIsInteractionDialogOpen(false);
    
    if (success) {
      setRemainingInteractions(prev => prev - 1);
      
      toast({
        title: "Interaction Complete",
        description: `You have ${remainingInteractions - 1} interactions left.`,
      });
      
      if (remainingInteractions - 1 <= 0) {
        setIsInteractionStageComplete(true);
      }
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
      
      {selectedHouseguest && (
        <EvictionInteractionDialog
          open={isInteractionDialogOpen}
          houseguest={selectedHouseguest}
          onClose={() => setIsInteractionDialogOpen(false)}
          onComplete={handleInteractionComplete}
        />
      )}
    </>
  );
};

export default EvictionInteractionStage;
