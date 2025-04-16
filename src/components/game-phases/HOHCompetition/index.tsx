import React, { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import CompetitionInitial from './CompetitionInitial';
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';
import { useCompetitionState } from './hooks/useCompetitionState';
import { usePhaseTransition } from './hooks/usePhaseTransition';
import { CompetitionType } from '@/models/houseguest/types';

const HOHCompetition: React.FC = () => {
  const { gameState, logger, dispatch } = useGame();
  const fastForwardingRef = useRef(false);
  
  // Use our custom hooks to manage competition state
  const {
    competitionType,
    isCompeting,
    results,
    winner,
    activeHouseguests,
    transitionAttempted,
    setTransitionAttempted,
    startCompetition,
    selectWinnerImmediately,
    setWinner,
    setResults
  } = useCompetitionState();
  
  // Hook for phase transitions - always keep hooks in same order
  const { advanceToNomination } = usePhaseTransition(winner, transitionAttempted, setTransitionAttempted);

  // Add initialization effect here directly to simplify hook order
  useEffect(() => {
    // Wait for component to fully mount to avoid state updates during render
    const timer = setTimeout(() => {
      // Only auto-start if we're in the right phase and not already competing
      if (gameState.phase === 'HoH' && !isCompeting && !winner && activeHouseguests.length > 0 && !fastForwardingRef.current) {
        const competitionTypes: Array<CompetitionType> = ['physical', 'mental', 'endurance', 'social', 'luck'];
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        logger?.info(`Auto-starting competition with type: ${randomType}`);
        startCompetition(randomType);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [gameState.phase, isCompeting, winner, activeHouseguests.length, startCompetition, logger]);

  // Listen for fast forward events
  useEffect(() => {
    const handleFastForward = () => {
      logger?.info("Fast forward event detected in HOH Competition");
      fastForwardingRef.current = true;
      
      if (!isCompeting && !winner) {
        // If competition hasn't started yet, immediately select a winner
        logger?.info("Fast forward: Skipping competition animation");
        const competitionTypes: Array<CompetitionType> = ['physical', 'mental', 'endurance', 'social', 'luck'];
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        
        if (activeHouseguests.length > 0) {
          // Skip competition animation and select winner immediately
          selectWinnerImmediately(randomType);
          
          // Add a short delay to ensure state updates before proceeding
          setTimeout(() => {
            logger?.info("Fast forward: Advancing to nomination phase");
            advanceToNomination();
          }, 500);
        }
      } else if (winner) {
        // If we already have a winner, just advance to the next phase
        logger?.info("Fast forward: Winner already determined, advancing to nomination");
        advanceToNomination();
      } else if (isCompeting) {
        // If competition is in progress, force completion
        logger?.info("Fast forward: Competition in progress, forcing completion");
        
        // Select a random winner
        const randomWinner = activeHouseguests[Math.floor(Math.random() * activeHouseguests.length)];
        
        // Generate placeholder results
        const placeholderResults = activeHouseguests.map((guest, idx) => ({
          name: guest.name,
          id: guest.id,
          position: guest.id === randomWinner.id ? 1 : idx + 2
        }));
        
        // Update state and advance
        setResults(placeholderResults);
        setWinner(randomWinner);
        
        // Update HOH in game state
        dispatch({
          type: 'SET_HOH',
          payload: randomWinner
        });
        
        // Force transition after a short delay
        setTimeout(() => {
          advanceToNomination();
        }, 500);
      }
    };
    
    // Listen for the custom fast forward event
    document.addEventListener('game:fastForward', handleFastForward);
    
    return () => {
      document.removeEventListener('game:fastForward', handleFastForward);
    };
  }, [isCompeting, winner, activeHouseguests, setResults, setWinner, advanceToNomination, dispatch, logger, selectWinnerImmediately]);

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
