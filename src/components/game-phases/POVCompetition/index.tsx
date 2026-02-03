
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Houseguest, CompetitionType } from '@/models/houseguest';

// Import our newly created components
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';
import InitialStage from './InitialStage';
import { selectStatWeightedWinner, selectRandomCompetitionType, hasValidPlayers, getCompetitionStatLabel } from './utils';

const POVCompetition: React.FC = () => {
  const {
    gameState,
    dispatch,
    getHouseguestById
  } = useGame();
  const [isCompeting, setIsCompeting] = useState(false);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const [competitionType, setCompetitionType] = useState<CompetitionType | null>(null);
  
  // Get the PoV players
  const povPlayerIds = gameState.povPlayers || [];
  const povPlayers = povPlayerIds
    .map(id => getHouseguestById(id))
    .filter(Boolean) as Houseguest[];
  
  const nominees = gameState.nominees
    .map(nominee => gameState.houseguests.find(h => h.id === nominee.id) || nominee)
    .filter(Boolean) as Houseguest[];
  
  const hoh = gameState.hohWinner 
    ? gameState.houseguests.find(h => h.id === gameState.hohWinner.id) || gameState.hohWinner
    : null;
  
  // Select competition type on mount
  useEffect(() => {
    if (!competitionType) {
      const type = selectRandomCompetitionType();
      setCompetitionType(type);
    }
  }, [competitionType]);
  
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
      
      // Use stat-weighted selection based on competition type
      const type = competitionType || selectRandomCompetitionType();
      const competitionWinner = selectStatWeightedWinner(povPlayers, type);
      
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

      // Log the event with competition type info
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'PoV',
          type: 'COMPETITION',
          description: `${competitionWinner.name} won the Power of Veto competition (${type} - ${getCompetitionStatLabel(type)}).`,
          involvedHouseguests: [competitionWinner.id],
          data: { competitionType: type }
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
    return <CompetitionInProgress competitionType={competitionType} />;
  }
  
  return (
    <InitialStage 
      povPlayers={povPlayers} 
      week={gameState.week} 
      startCompetition={startCompetition} 
      nominees={nominees}
      hoh={hoh}
      competitionType={competitionType}
    />
  );
};

export default POVCompetition;
