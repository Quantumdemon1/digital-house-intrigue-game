
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { selectRandomWinner, competitionTypes } from './utils';
import CompetitionInitial from './CompetitionInitial';
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';

const HOHCompetition: React.FC = () => {
  const {
    gameState,
    dispatch,
    getActiveHouseguests
  } = useGame();
  const { toast } = useToast();
  
  const [competitionType, setCompetitionType] = useState<CompetitionType | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [results, setResults] = useState<{
    name: string;
    position: number;
    id: string;
  }[]>([]);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const activeHouseguests = getActiveHouseguests();
  
  // Start the competition with a random type when component mounts
  useEffect(() => {
    const startInitialCompetition = () => {
      if (!isCompeting && !winner && activeHouseguests.length > 0) {
        console.log("Starting HOH competition automatically...");
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        startCompetition(randomType);
      }
    };
    
    // Small delay to ensure everything is mounted properly
    const timer = setTimeout(startInitialCompetition, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const startCompetition = (type: CompetitionType) => {
    console.log(`Starting ${type} competition...`);
    setCompetitionType(type);
    setIsCompeting(true);

    // Simulate the competition running
    setTimeout(() => {
      // Verify we have houseguests before determining a winner
      if (activeHouseguests.length === 0) {
        console.error('No active houseguests available for competition');
        setIsCompeting(false);
        return;
      }
      
      // Determine the winner (weighted random based on stats)
      const competitionWinner = selectRandomWinner(activeHouseguests, type);
      
      if (!competitionWinner) {
        console.error('Failed to select a competition winner');
        setIsCompeting(false);
        return;
      }

      console.log(`Competition winner selected: ${competitionWinner.name}`);

      // Generate random results
      const positions = activeHouseguests.map(guest => ({
        name: guest.name,
        id: guest.id,
        position: Math.random() // random value for sorting
      })).sort((a, b) => a.position - b.position).map((guest, index) => ({
        name: guest.name,
        id: guest.id,
        position: index + 1
      }));

      // Make sure the winner is in first place
      const winnerIndex = positions.findIndex(p => p.id === competitionWinner.id);
      if (winnerIndex > 0) {
        const temp = positions[0];
        positions[0] = positions[winnerIndex];
        positions[winnerIndex] = temp;
      }
      
      console.log("Setting competition results...");
      setResults(positions);
      setWinner(competitionWinner);

      // Update game state with new HoH
      dispatch({
        type: 'SET_HOH',
        payload: competitionWinner
      });

      // Log the event
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'HoH',
          type: 'COMPETITION',
          description: `${competitionWinner.name} won the ${type} Head of Household competition.`,
          involvedHouseguests: [competitionWinner.id]
        }
      });

      // Show toast
      toast({
        title: "HoH Competition Results",
        description: `${competitionWinner.name} is the new Head of Household!`,
        variant: "default"
      });

      // Continue to nomination phase after a delay
      setTimeout(() => {
        console.log("Advancing to nomination phase...");
        dispatch({
          type: 'SET_PHASE',
          payload: 'Nomination'
        });
      }, 5000); // 5 second delay before moving to nominations
    }, 3000); // Show the competition in progress for 3 seconds
  };

  // Show the appropriate component based on the competition state
  if (winner) {
    return <CompetitionResults competitionType={competitionType} winner={winner} results={results} />;
  }
  
  if (isCompeting) {
    return <CompetitionInProgress competitionType={competitionType} />;
  }
  
  return <CompetitionInitial gameWeek={gameState.week} activeHouseguests={activeHouseguests} />;
};

export default HOHCompetition;
