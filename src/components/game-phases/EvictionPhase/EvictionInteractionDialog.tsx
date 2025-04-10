
import React, { useState } from 'react';
import { Houseguest } from '@/models/houseguest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGame } from '@/contexts/GameContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InteractionOption } from './types/interactions';
import InteractionResults from './InteractionResults';
import { GameState } from '@/models/game-state';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface EvictionInteractionDialogProps {
  houseguest: Houseguest;
  player: Houseguest;
  gameState: GameState;
  onInteractionComplete: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  {
    id: 'confront',
    text: 'Confront',
    responseText: 'You confronted them about their game moves.',
    relationshipChange: -5,
    successChance: 0.4,
    icon: null,
  },
];

const EvictionInteractionDialog: React.FC<EvictionInteractionDialogProps> = ({ 
  houseguest, 
  player, 
  gameState, 
  onInteractionComplete,
  open,
  onOpenChange 
}) => {
  const [selectedOption, setSelectedOption] = useState<InteractionOption | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { dispatch } = useGame();
  
  if (!houseguest || !player) {
    return null;
  }
  
  const handleInteractionComplete = () => {
    onInteractionComplete();
  };
  
  const handleOptionSelected = (option: InteractionOption) => {
    setSelectedOption(option);
    
    // Calculate relationship change based on interaction and houseguest personality
    // Apply relationship change
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'update_relationship',
        params: {
          guestId1: player.id,
          guestId2: houseguest.id,
          change: option.relationshipChange,
          note: `${player.name} interacted with ${houseguest.name}`
        }
      }
    });
    
    // Log the interaction in game log
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'log_event',
        params: {
          week: gameState.week,
          phase: gameState.phase,
          type: 'SOCIAL_INTERACTION',
          description: `${player.name} interacted with ${houseguest.name}.`,
          involvedHouseguests: [player.id, houseguest.id],
        }
      }
    });
    
    // Show results after a short delay
    setTimeout(() => {
      setShowResults(true);
    }, 500);
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <Card className="shadow-lg border-bb-yellow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Interaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={houseguest.imageUrl} alt={houseguest.name} />
                <AvatarFallback>{houseguest.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{houseguest.name}</h3>
                <Badge variant="secondary">{houseguest.occupation}</Badge>
              </div>
            </div>
            
            {!showResults && (
              <div className="mt-4">
                <CardDescription>Choose an interaction:</CardDescription>
                <div className="grid gap-2 mt-2">
                  {interactionOptions.map((option) => (
                    <Button key={option.id} onClick={() => handleOptionSelected(option)}>
                      {option.text}
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
