
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import EvictionInteractionDialog from './EvictionInteractionDialog';
import PlayerCampaignSection from './PlayerCampaignSection';
import NonPlayerSection from './NonPlayerSection';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  
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
    setDialogOpen(true);
  };
  
  const handleInteractionComplete = () => {
    setSelectedHouseguest(null);
    setDialogOpen(false);
    setRemainingInteractions(prev => prev - 1);
    
    if (remainingInteractions - 1 <= 0) {
      setIsInteractionStageComplete(true);
      toast({
        title: "All Interactions Complete",
        description: "You're ready to proceed to voting.",
      });
    } else {
      toast({
        title: "Interaction Complete",
        description: `You have ${remainingInteractions - 1} interactions left.`,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      {playerIsNominee ? (
        <div className="space-y-4">
          <div className="bg-bb-red/10 border-l-4 border-bb-red p-4 rounded-r-lg">
            <h3 className="font-bold text-xl flex items-center">
              <Badge variant="destructive" className="mr-2">Nominee</Badge>
              Campaign for Votes
            </h3>
            <p className="text-muted-foreground mt-1">
              You are nominated for eviction! Talk to other houseguests to secure their votes.
              <br />
              <span className="font-medium">
                Remaining interactions: {remainingInteractions}
              </span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nonNominees.map(houseguest => (
              <div key={houseguest.id} className="relative">
                <div 
                  className={`absolute inset-0 z-10 rounded-lg flex items-center justify-center bg-black/60 
                    ${selectedHouseguest?.id === houseguest.id ? 'opacity-100' : 'opacity-0 hover:opacity-90'} 
                    transition-opacity cursor-pointer`}
                  onClick={() => handleInteractWithHouseguest(houseguest)}
                >
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-bb-blue hover:bg-blue-700" 
                    disabled={remainingInteractions <= 0}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Talk to {houseguest.name}
                  </Button>
                </div>
                
                <div className={remainingInteractions <= 0 ? 'opacity-60' : ''}>
                  {/* Your HouseguestCard component would go here */}
                  <div className="border rounded-lg p-4 text-center">
                    <h4>{houseguest.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <Button
              variant="default"
              className="bg-bb-red hover:bg-red-700"
              disabled={!isInteractionStageComplete}
              onClick={onInteractionStageComplete}
            >
              Proceed to Voting
            </Button>
          </div>
        </div>
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
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
};

export default EvictionInteractionStage;
