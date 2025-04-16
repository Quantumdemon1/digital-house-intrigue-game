
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
    setResults,
    setIsCompeting
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

  // Enhanced fast forward handler with more direct phase control
  useEffect(() => {
    const handleFastForward = () => {
      logger?.info("Fast forward event detected in HOH Competition");
      fastForwardingRef.current = true;

      // Create a list of competition types
      const competitionTypes: Array<CompetitionType> = ['physical', 'mental', 'endurance', 'social', 'luck'];
      const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
      
      // Improved handling for different competition states
      logger?.info("Fast forward state check - isCompeting:", isCompeting, "winner:", !!winner);
      
      if (winner) {
        // CASE 1: We already have a winner, force direct phase change
        logger?.info("Fast forward: Winner already selected, forcing phase transition");
        dispatch({
          type: 'SET_PHASE',
          payload: 'Nomination'
        });
      } 
      else if (isCompeting) {
        // CASE 2: Competition in progress - force completion with direct phase change
        logger?.info("Fast forward: Competition in progress, forcing completion with direct phase change");
        
        // Stop the competition visually
        setIsCompeting(false);
        
        // Select a random winner from active houseguests
        const randomWinner = activeHouseguests[Math.floor(Math.random() * activeHouseguests.length)];
        
        if (randomWinner) {
          // Generate results and set winner
          const placeholderResults = activeHouseguests.map((guest) => ({
            name: guest.name,
            id: guest.id,
            position: guest.id === randomWinner.id ? 1 : 
              Math.floor(Math.random() * (activeHouseguests.length - 1)) + 2
          })).sort((a, b) => a.position - b.position);
          
          // Update state and game state
          setResults(placeholderResults);
          setWinner(randomWinner);
          
          // Set HOH directly
          dispatch({
            type: 'SET_HOH',
            payload: randomWinner
          });
          
          // Force immediate phase transition
          logger?.info("Fast forward: Forcing direct phase transition to Nomination");
          dispatch({
            type: 'SET_PHASE',
            payload: 'Nomination'
          });
        }
      }
      else {
        // CASE 3: Competition hasn't started yet - use the dedicated method
        logger?.info("Fast forward: Competition hasn't started yet, using selectWinnerImmediately");
        selectWinnerImmediately(randomType);
      }
    };
    
    // Listen for the custom fast forward event
    document.addEventListener('game:fastForward', handleFastForward);
    
    return () => {
      document.removeEventListener('game:fastForward', handleFastForward);
    };
  }, [activeHouseguests, dispatch, isCompeting, logger, selectWinnerImmediately, setIsCompeting, setResults, setWinner, winner]);

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
