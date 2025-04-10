
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import EvictionInteractionDialog from './EvictionInteractionDialog';

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
      {playerIsNominee && (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">Campaign for Votes</h3>
            <p className="text-muted-foreground mb-2">
              You're on the block! Interact with houseguests to build relationships and save yourself.
            </p>
            <p className="font-semibold text-bb-red">
              Interactions remaining: {remainingInteractions}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nonNominees.map(houseguest => (
              <Button
                key={houseguest.id}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center border-2 hover:border-bb-red transition-colors"
                disabled={remainingInteractions <= 0}
                onClick={() => handleInteractWithHouseguest(houseguest)}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg mb-2">
                  {houseguest.name.charAt(0)}
                </div>
                <div className="font-semibold">{houseguest.name}</div>
                <div className="flex items-center mt-2">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>Interact</span>
                </div>
              </Button>
            ))}
          </div>
          
          {isInteractionStageComplete && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="default"
                className="bg-bb-red hover:bg-red-700"
                onClick={onInteractionStageComplete}
              >
                Proceed to Voting
              </Button>
            </div>
          )}
        </div>
      )}
      
      {!playerIsNominee && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">Nominees Are Campaigning</h3>
          <p className="text-muted-foreground">
            The nominated houseguests are campaigning to stay in the house.
          </p>
          <div className="flex justify-center items-center gap-10 my-6">
            {nominees.map(nominee => (
              <div key={nominee.id} className="text-center">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
                  {nominee.name.charAt(0)}
                </div>
                <p className="font-semibold">{nominee.name}</p>
              </div>
            ))}
          </div>
          <Button 
            variant="default"
            className="bg-bb-red hover:bg-red-700"
            onClick={onInteractionStageComplete}
          >
            Proceed to Voting
          </Button>
        </div>
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
