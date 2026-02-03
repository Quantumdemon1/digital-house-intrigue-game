
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
  const [generatedPlayers, setGeneratedPlayers] = useState<string[]>([]);
  
  // Get the PoV players from state
  const povPlayerIds = gameState.povPlayers || [];
  
  // Auto-generate PoV players if none set (fallback)
  useEffect(() => {
    if (povPlayerIds.length === 0 && generatedPlayers.length === 0 && !isCompeting && !winner) {
      const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
      const mandatory = [
        gameState.hohWinner?.id,
        ...(gameState.nominees?.map(n => n.id) || [])
      ].filter(Boolean) as string[];
      
      const eligible = activeHouseguests
        .filter(h => !mandatory.includes(h.id))
        .map(h => h.id);
      
      const shuffled = [...eligible].sort(() => 0.5 - Math.random());
      const needed = Math.min(6 - mandatory.length, shuffled.length);
      const final = [...mandatory, ...shuffled.slice(0, needed)];
      
      setGeneratedPlayers(final);
      
      // Dispatch to sync state
      dispatch({
        type: 'SET_POV_PLAYERS',
        payload: final
      });
    }
  }, [povPlayerIds.length, generatedPlayers.length, isCompeting, winner, gameState.houseguests, gameState.hohWinner, gameState.nominees, dispatch]);
  
  // Use effective player IDs (from state or generated)
  const effectivePovPlayerIds = povPlayerIds.length > 0 ? povPlayerIds : generatedPlayers;
const povPlayers = effectivePovPlayerIds
  .map(id => gameState.houseguests.find(h => h.id === id))
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
