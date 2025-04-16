
import React, { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import CompetitionInitial from './CompetitionInitial';
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';
import { useCompetitionState } from './hooks/useCompetitionState';
import { usePhaseTransition } from './hooks/usePhaseTransition';
import { CompetitionType } from '@/models/houseguest/types'; // Import the CompetitionType

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
  
  // Add initialization effect here directly to simplify hook order
  useEffect(() => {
    // Wait for component to fully mount to avoid state updates during render
    const timer = setTimeout(() => {
      // Only auto-start if we're in the right phase and not already competing
      if (gameState.phase === 'HoH' && !isCompeting && !winner && activeHouseguests.length > 0) {
        const competitionTypes: Array<CompetitionType> = ['physical', 'mental', 'endurance', 'social', 'luck'];
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        logger?.info(`Auto-starting competition with type: ${randomType}`);
        startCompetition(randomType);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [gameState.phase, isCompeting, winner, activeHouseguests.length, startCompetition, logger]);
  
  // Hook for phase transitions - always keep hooks in same order
  const { advanceToNomination } = usePhaseTransition(winner, transitionAttempted, setTransitionAttempted);

  // Listen for fast forward events
  useEffect(() => {
    const handleFastForward = () => {
      if (!isCompeting && !winner) {
        logger?.info("Fast forward event detected - starting competition immediately");
        const competitionTypes: Array<CompetitionType> = ['physical', 'mental', 'endurance', 'social', 'luck'];
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        startCompetition(randomType);
        
        // Set a timeout to automatically advance to the results after a short delay
        setTimeout(() => {
          if (winner) {
            logger?.info("Fast forwarding to nomination phase");
            advanceToNomination();
          } else {
            logger?.info("Fast forward initiated but winner not yet determined");
          }
        }, 100);
      } else if (winner) {
        // If we already have a winner, just advance to the next phase
        logger?.info("Fast forward with winner already determined - advancing to nomination");
        advanceToNomination();
      }
    };
    
    // Listen for the custom fast forward event
    document.addEventListener('game:fastForward', handleFastForward);
    
    return () => {
      document.removeEventListener('game:fastForward', handleFastForward);
    };
  }, [isCompeting, winner, startCompetition, advanceToNomination, logger]);

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
