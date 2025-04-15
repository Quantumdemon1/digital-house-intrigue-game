
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import CompetitionInitial from './CompetitionInitial';
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';
import { useCompetitionState } from './hooks/useCompetitionState';
import { usePhaseTransition } from './hooks/usePhaseTransition';
import { useCompetitionInitialization } from './hooks/useCompetitionInitialization';

const HOHCompetition: React.FC = () => {
  const { gameState, logger } = useGame();
  
  // Use our custom hooks to manage competition state
  const {
    competitionType,
    isCompeting,
    results,
    winner,
    activeHouseguests,
    transitionAttempted,
    setTransitionAttempted,
    startCompetition
  } = useCompetitionState();
  
  // Hook for phase transitions
  const { advanceToNomination } = usePhaseTransition(winner, transitionAttempted, setTransitionAttempted);
  
  // Hook for competition initialization
  useCompetitionInitialization(
    gameState.phase, 
    isCompeting, 
    winner, 
    activeHouseguests.length,
    startCompetition,
    logger
  );

  // Show the appropriate component based on the competition state
  if (winner) {
    return <CompetitionResults 
      competitionType={competitionType} 
      winner={winner} 
      results={results} 
      onContinue={advanceToNomination} 
    />;
  }
  
  if (isCompeting) {
    return <CompetitionInProgress competitionType={competitionType} />;
  }
  
  return <CompetitionInitial gameWeek={gameState.week} activeHouseguests={activeHouseguests} />;
};

export default HOHCompetition;
