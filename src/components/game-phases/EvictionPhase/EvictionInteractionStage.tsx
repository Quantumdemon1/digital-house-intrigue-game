
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import HouseguestCard from '../../HouseguestCard';
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
  onInteractionStageComplete
}) => {
  // State for tracking interactions
  const [remainingInteractions, setRemainingInteractions] = useState(3); // Start with 3 interaction opportunities
  const [selectedHouseguest, setSelectedHouseguest] = useState<Houseguest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Get game state
  const { gameState, showToast } = useGame();
  
  // Get player
  const player = gameState.houseguests.find(hg => hg.isPlayer);
  
  // Handler for HG selection
  const handleHouseguestSelect = (houseguest: Houseguest) => {
    setSelectedHouseguest(houseguest);
    setDialogOpen(true);
  };
  
  const handleInteractionComplete = () => {
    setDialogOpen(false);
    setRemainingInteractions(prev => prev - 1);
    
    // Show toast notification after interaction
    if (selectedHouseguest) {
      showToast(
        `Interaction with ${selectedHouseguest.name} complete`, 
        { 
          description: `You have ${remainingInteractions - 1} interactions remaining`,
          variant: 'info'
        }
      );
    }
  };
  
  // Handler for proceeding to voting phase
  const handleProceed = () => {
    showToast(
      "Moving to voting phase", 
      { 
        description: "Houseguests will now vote on who to evict",
        variant: 'info'
      }
    );
    onInteractionStageComplete();
  };
  
  return (
    <div className="space-y-6">
      {playerIsNominee ? (
        <PlayerCampaignSection 
          nonNominees={nonNominees}
          remainingInteractions={remainingInteractions}
          onHouseguestSelect={handleHouseguestSelect}
        />
      ) : (
        <NonPlayerSection 
          nominees={nominees}
          nonNominees={nonNominees.filter(hg => !hg.isPlayer)} // Exclude player
          remainingInteractions={remainingInteractions}
          onHouseguestSelect={handleHouseguestSelect}
        />
      )}
      
      {/* Interaction Status Card */}
      <Card className="bg-white/50 backdrop-blur-sm border-border">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Remaining Interactions: <span className="text-bb-blue font-bold">{remainingInteractions}</span></p>
              <p className="text-xs text-muted-foreground mt-1">Use your interactions wisely to influence the vote</p>
            </div>
            
            <Button 
              onClick={handleProceed} 
              variant={remainingInteractions > 0 ? "outline" : "default"}
              className={remainingInteractions > 0 ? "" : "animate-pulse-slow"}
            >
              {remainingInteractions > 0 ? "Skip Remaining & Proceed" : "Proceed to Voting"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {player && selectedHouseguest && (
        <EvictionInteractionDialog
          houseguest={selectedHouseguest}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onInteractionComplete={handleInteractionComplete}
        />
      )}
    </div>
  );
};

export default EvictionInteractionStage;
