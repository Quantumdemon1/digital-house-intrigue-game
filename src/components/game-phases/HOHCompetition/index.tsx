
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { useToast } from '@/components/ui/use-toast';
import CompetitionSelector from './CompetitionSelector';
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';
import { selectRandomWinner, competitionTypes } from './competitionUtils';

const HOHCompetition: React.FC = () => {
  const { gameState, dispatch, getActiveHouseguests } = useGame();
  const { toast } = useToast();
  const [competitionType, setCompetitionType] = useState<CompetitionType | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [results, setResults] = useState<{ name: string, position: number }[]>([]);
  const [winner, setWinner] = useState<Houseguest | null>(null);

  const activeHouseguests = getActiveHouseguests();
  
  const startCompetition = (type: CompetitionType) => {
    setCompetitionType(type);
    setIsCompeting(true);
    
    // Simulate the competition running
    setTimeout(() => {
      // Determine the winner (weighted random based on stats)
      const competitionWinner = selectRandomWinner(activeHouseguests, type);
      
      // Generate random results
      const positions = activeHouseguests
        .map(guest => ({
          name: guest.name,
          id: guest.id,
          position: Math.random() // random value for sorting
        }))
        .sort((a, b) => a.position - b.position)
        .map((guest, index) => ({
          name: guest.name,
          position: index + 1,
          id: guest.id
        }));
      
      // Make sure the winner is in first place
      const winnerIndex = positions.findIndex(p => p.id === competitionWinner.id);
      if (winnerIndex > 0) {
        const temp = positions[0];
        positions[0] = positions[winnerIndex];
        positions[winnerIndex] = temp;
      }
      
      setResults(positions);
      setWinner(competitionWinner);
      
      // Update game state with new HoH
      dispatch({ type: 'SET_HOH', payload: competitionWinner });
      
      // Log the event
      dispatch({ 
        type: 'LOG_EVENT', 
        payload: {
          week: gameState.week,
          phase: 'HoH',
          type: 'COMPETITION',
          description: `${competitionWinner.name} won the ${type} Head of Household competition.`,
          involvedHouseguests: [competitionWinner.id],
        }
      });
      
      // Show toast
      toast({
        title: "HoH Competition Results",
        description: `${competitionWinner.name} is the new Head of Household!`,
        variant: "default",
      });
      
      // Continue to nomination phase after a delay
      setTimeout(() => {
        dispatch({ type: 'SET_PHASE', payload: 'Nomination' });
      }, 5000);
    }, 3000);
  };

  // Render the appropriate component based on the competition state
  if (winner) {
    return <CompetitionResults winner={winner} competitionType={competitionType!} results={results} />;
  }
  
  if (isCompeting) {
    return <CompetitionInProgress competitionType={competitionType!} />;
  }
  
  return (
    <CompetitionSelector 
      competitionTypes={competitionTypes} 
      activeHouseguests={activeHouseguests} 
      gameState={gameState} 
      startCompetition={startCompetition}
    />
  );
};

export default HOHCompetition;
