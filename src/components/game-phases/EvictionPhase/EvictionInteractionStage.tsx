
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import EvictionInteractionDialog from './EvictionInteractionDialog';
import { UserX } from 'lucide-react';

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
      <div className="text-center mb-6">
        <UserX className="h-12 w-12 mx-auto text-red-600 mb-2" />
        <h3 className="text-xl font-bold mb-1">Eviction Night</h3>
        <p className="text-muted-foreground">
          {playerIsNominee 
            ? "You're nominated! This is your last chance to campaign before the vote." 
            : "Talk with houseguests to influence the upcoming vote."}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Interactable houseguests */}
        {(playerIsNominee ? nonNominees : [...nonNominees.filter(hg => !hg.isPlayer), ...nominees]).map(houseguest => (
          <Card 
            key={houseguest.id} 
            className={`cursor-pointer transition-all duration-200 ${
              remainingInteractions > 0 
                ? "hover:border-primary hover:shadow-md" 
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() => remainingInteractions > 0 && handleHouseguestSelect(houseguest)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-700">
                {houseguest.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{houseguest.name}</p>
                <p className="text-xs text-muted-foreground">{houseguest.occupation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Interaction Status Card */}
      <Card className="bg-white/50 backdrop-blur-sm border-border mt-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Remaining Interactions: <span className="text-red-600 font-bold">{remainingInteractions}</span></p>
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
      
      {selectedHouseguest && (
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
