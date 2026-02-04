
import React, { useState } from 'react';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { InteractionOption } from './types/interactions';
import InteractionResults from './InteractionResults';

interface EvictionInteractionDialogProps {
  houseguest: Houseguest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInteractionComplete: () => void;
}

const interactionOptions: InteractionOption[] = [
  {
    id: 'befriend',
    text: 'Try to befriend',
    responseText: 'You had a friendly conversation and connected well.',
    relationshipChange: 5,
    successChance: 0.7,
    icon: null,
  },
  {
    id: 'intimidate',
    text: 'Intimidate',
    responseText: 'You put some pressure on them and made your position clear.',
    relationshipChange: -10,
    successChance: 0.5,
    icon: null,
  },
  {
    id: 'strategize',
    text: 'Strategize with',
    responseText: 'You had a productive strategy conversation.',
    relationshipChange: 2,
    successChance: 0.8,
    icon: null,
  },
  {
    id: 'gossip',
    text: 'Gossip about others with',
    responseText: 'You shared some juicy information about the other houseguests.',
    relationshipChange: 3,
    successChance: 0.6,
    icon: null,
  },
];

const EvictionInteractionDialog: React.FC<EvictionInteractionDialogProps> = ({ 
  houseguest, 
  open,
  onOpenChange,
  onInteractionComplete 
}) => {
  const [selectedOption, setSelectedOption] = useState<InteractionOption | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { gameState, dispatch } = useGame();
  
  // Get player from gameState
  const player = gameState.houseguests.find(hg => hg.isPlayer);
  
  if (!player) {
    return null;
  }
  
  const handleInteractionComplete = () => {
    onInteractionComplete();
    onOpenChange(false);
  };
  
  const handleOptionSelected = (option: InteractionOption) => {
    setSelectedOption(option);
    
    // Don't dispatch relationship change here - InteractionResults will handle it
    // after calculating success/failure based on stats
    
    // Show results after a short delay
    setTimeout(() => {
      setShowResults(true);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <Card className="shadow-lg border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{houseguest.name.substring(0, 1)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">Conversation with {houseguest.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <CardDescription>
                  Choose how to interact with {houseguest.name}. ({houseguest.traits.join(', ')})
                </CardDescription>
              </div>
            </div>
            
            {!showResults && (
              <div className="mt-4">
                <div className="grid gap-2 mt-2">
                  {interactionOptions.map((option) => (
                    <Button 
                      key={option.id} 
                      onClick={() => handleOptionSelected(option)}
                      className="justify-start text-left"
                      variant="outline"
                    >
                      {option.text} {houseguest.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {showResults && selectedOption && (
              <InteractionResults 
                selectedOption={selectedOption}
                houseguest={houseguest}
                onComplete={handleInteractionComplete}
              />
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default EvictionInteractionDialog;
