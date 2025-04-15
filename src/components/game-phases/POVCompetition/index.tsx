
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';

// Import our newly created components
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';
import InitialStage from './InitialStage';
import { determineRandomWinner, hasValidPlayers } from './utils';

const POVCompetition: React.FC = () => {
  const {
    gameState,
    dispatch,
    getHouseguestById
  } = useGame();
  const [isCompeting, setIsCompeting] = useState(false);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  
  // Get the PoV players
  const povPlayerIds = gameState.povPlayers || [];
  const povPlayers = povPlayerIds
    .map(id => getHouseguestById(id))
    .filter(Boolean) as Houseguest[];
  
  const nominees = gameState.nominees
    .map(id => getHouseguestById(id))
    .filter(Boolean) as Houseguest[];
  
  const hoh = gameState.hohWinner ? getHouseguestById(gameState.hohWinner) : null;
  
  // If no PoV players are set, show a warning
  useEffect(() => {
    if (povPlayerIds.length === 0 && !isCompeting && !winner) {
      console.warn('No PoV players selected for competition');
    }
  }, [povPlayerIds, isCompeting, winner]);
  
  const startCompetition = () => {
    setIsCompeting(true);

    // Simulate the competition running
    setTimeout(() => {
      // Verify we have PoV players before determining a winner
      if (!hasValidPlayers(povPlayers)) {
        console.error('No PoV players available for competition');
        setIsCompeting(false);
        return;
      }
      
      // Determine the winner
      const competitionWinner = determineRandomWinner(povPlayers);
      
      if (!competitionWinner) {
        console.error('Failed to select a PoV competition winner');
        setIsCompeting(false);
        return;
      }
      
      setWinner(competitionWinner);

      // Update game state with new PoV winner
      dispatch({
        type: 'SET_POV_WINNER',
        payload: competitionWinner
      });

      // Log the event
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'PoV',
          type: 'COMPETITION',
          description: `${competitionWinner.name} won the Power of Veto competition.`,
          involvedHouseguests: [competitionWinner.id]
        }
      });

      // Continue to PoV meeting phase after a delay
      setTimeout(() => {
        dispatch({
          type: 'SET_PHASE',
          payload: 'PoVMeeting'
        });
      }, 5000);
    }, 3000);
  };
  
  // Render the appropriate component based on the current state
  if (winner) {
    return <CompetitionResults winner={winner} />;
  }
  
  if (isCompeting) {
    return <CompetitionInProgress />;
  }
  
  return (
    <InitialStage 
      povPlayers={povPlayers} 
      week={gameState.week} 
      startCompetition={startCompetition} 
      nominees={nominees}
      hoh={hoh}
    />
  );
};

export default POVCompetition;
