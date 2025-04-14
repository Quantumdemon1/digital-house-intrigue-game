
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import EvictionInteractionDialog from './EvictionInteractionDialog';
import { UserX, BrainCircuit } from 'lucide-react';
import { AIThoughtBubble } from '@/components/ai-feedback';
import { useAIThoughts } from '@/hooks/useAIThoughts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [remainingInteractions, setRemainingInteractions] = useState(3);
  const [selectedHouseguest, setSelectedHouseguest] = useState<Houseguest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { thoughts, isVisible, addThought, toggleVisibility } = useAIThoughts();

  const {
    gameState,
    showToast
  } = useGame();

  // Generate AI thoughts when a houseguest is hovered
  const handleHouseguestHover = (houseguest: Houseguest) => {
    // Don't generate thoughts for player's houseguest
    if (houseguest.isPlayer) return;
    
    // Only generate thoughts if we don't already have one for this houseguest
    if (!thoughts[houseguest.id]) {
      const isNominee = nominees.some(nominee => nominee.id === houseguest.id);
      const thoughtOptions = isNominee ? [
        `I need to convince people to keep me in the house...`,
        `I wonder if I have enough votes to stay?`,
        `I can't believe I got nominated this week.`
      ] : [
        `I think I'm voting for ${nominees[0]?.name} this time.`,
        `I should talk to the HoH before I decide my vote.`,
        `I need to be careful about who I align with after this eviction.`
      ];
      
      // Pick a random thought
      const randomThought = thoughtOptions[Math.floor(Math.random() * thoughtOptions.length)];
      addThought(houseguest, randomThought);
    }
  };

  const handleHouseguestSelect = (houseguest: Houseguest) => {
    setSelectedHouseguest(houseguest);
    setDialogOpen(true);
  };

  const handleInteractionComplete = () => {
    setDialogOpen(false);
    setRemainingInteractions(prev => prev - 1);

    if (selectedHouseguest) {
      showToast(`Interaction with ${selectedHouseguest.name} complete`, {
        description: `You have ${remainingInteractions - 1} interactions remaining`,
        variant: 'info'
      });
    }
  };

  const handleProceed = () => {
    showToast("Moving to voting phase", {
      description: "Houseguests will now vote on who to evict",
      variant: 'info'
    });
    onInteractionStageComplete();
  };

  return <div className="space-y-6">
      <div className="text-center mb-6">
        <UserX className="h-12 w-12 mx-auto text-red-600 mb-2" />
        <h3 className="text-xl font-bold mb-1">Eviction Night</h3>
        <p className="text-muted-foreground">
          {playerIsNominee ? "You're nominated! This is your last chance to campaign before the vote." : "Talk with houseguests to influence the upcoming vote."}
        </p>
        
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Switch 
            id="show-thoughts" 
            checked={isVisible} 
            onCheckedChange={toggleVisibility} 
          />
          <Label htmlFor="show-thoughts" className="flex items-center cursor-pointer">
            <BrainCircuit className="w-4 h-4 mr-1 text-blue-500" />
            <span className="text-sm">Show AI Thoughts</span>
          </Label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(playerIsNominee ? nonNominees : [...nonNominees.filter(hg => !hg.isPlayer), ...nominees]).map(houseguest => (
          <div key={houseguest.id} className="relative" onMouseEnter={() => handleHouseguestHover(houseguest)}>
            <Card 
              className={`cursor-pointer transition-all duration-200 ${remainingInteractions > 0 ? "hover:border-primary hover:shadow-md" : "opacity-50 cursor-not-allowed"}`} 
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
            
            {/* AI Thought Bubble */}
            {!houseguest.isPlayer && thoughts[houseguest.id] && (
              <div className="absolute -top-12 left-0 w-full z-10">
                <AIThoughtBubble
                  thought={thoughts[houseguest.id].thought}
                  isVisible={isVisible}
                  character={houseguest.name}
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Card className="bg-white/50 backdrop-blur-sm border-border mt-4">
        <CardContent className="bg-bb-blue text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Remaining Interactions: <span className="text-red-600 font-bold">{remainingInteractions}</span></p>
              <p className="text-xs text-white/70 mt-1">Use your interactions wisely to influence the vote</p>
            </div>
            
            <Button 
              onClick={handleProceed} 
              variant={remainingInteractions > 0 ? "destructive" : "default"} 
              className={`${remainingInteractions > 0 ? "hover:bg-red-500" : "animate-pulse-slow"} transition-colors duration-300`}
            >
              {remainingInteractions > 0 ? "Skip Remaining & Proceed" : "Proceed to Voting"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {selectedHouseguest && <EvictionInteractionDialog houseguest={selectedHouseguest} open={dialogOpen} onOpenChange={setDialogOpen} onInteractionComplete={handleInteractionComplete} />}
    </div>;
};

export default EvictionInteractionStage;
