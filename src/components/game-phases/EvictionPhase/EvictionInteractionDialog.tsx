import React, { useState, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useGame } from '@/contexts/GameContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InteractionOption } from './types/interactions';
import { InteractionResults } from './InteractionResults';
import { GameState } from '@/models/game-state';

interface EvictionInteractionDialogProps {
  houseguest: Houseguest;
  player: Houseguest;
  gameState: GameState;
  onInteractionComplete: () => void;
}

const interactionOptions: InteractionOption[] = [
  {
    id: 'befriend',
    text: 'Try to befriend',
    successText: 'befriended',
    relationshipChange: 5,
    successChance: 0.7,
  },
  {
    id: 'intimidate',
    text: 'Intimidate',
    successText: 'intimidated',
    relationshipChange: -10,
    successChance: 0.5,
  },
  {
    id: 'strategize',
    text: 'Strategize with',
    successText: 'strategized with',
    relationshipChange: 2,
    successChance: 0.8,
  },
  {
    id: 'gossip',
    text: 'Gossip about others with',
    successText: 'gossiped with',
    relationshipChange: 3,
    successChance: 0.6,
  },
  {
    id: 'confront',
    text: 'Confront',
    successText: 'confronted',
    relationshipChange: -5,
    successChance: 0.4,
  },
];

const EvictionInteractionDialog: React.FC<EvictionInteractionDialogProps> = ({ houseguest, player, gameState, onInteractionComplete }) => {
  const [selectedOption, setSelectedOption] = useState<InteractionOption | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { dispatch } = useGame();
  
  if (!houseguest || !player) {
    return <div>Error: Houseguest or Player data missing.</div>;
  }
  
  const handleInteractionComplete = () => {
    onInteractionComplete();
  };
  
  const handleOptionSelected = (option: InteractionOption) => {
    setSelectedOption(option);
    
    // Calculate relationship change based on interaction and houseguest personality
    // Apply relationship change
    dispatch({
      type: 'UPDATE_RELATIONSHIPS',
      payload: {
        guestId1: player.id,
        guestId2: houseguest.id,
        change: option.relationshipChange,
        note: `${player.name} ${option.successText}`
      }
    });
    
    // Log the interaction in game log
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: gameState.phase,
        type: 'SOCIAL_INTERACTION',
        description: `${player.name} ${option.successText} with ${houseguest.name}.`,
        involvedHouseguests: [player.id, houseguest.id],
      }
    });
    
    // Show results after a short delay
    setTimeout(() => {
      setShowResults(true);
    }, 500);
  };

  return (
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
        
        {showResults && (
          <InteractionResults 
            selectedOption={selectedOption} 
            onComplete={handleInteractionComplete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EvictionInteractionDialog;
