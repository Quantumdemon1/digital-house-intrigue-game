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
  
  const { advanceToNomination } = usePhaseTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (gameState.phase === 'HoH' && !isCompeting && !winner && activeHouseguests.length > 0 && !fastForwardingRef.current) {
        const competitionTypes: Array<CompetitionType> = ['physical', 'mental', 'endurance', 'social', 'luck'];
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        logger?.info(`Auto-starting competition with type: ${randomType}`);
        startCompetition(randomType);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [gameState.phase, isCompeting, winner, activeHouseguests.length, startCompetition, logger]);

  useEffect(() => {
    const handleFastForward = () => {
      logger?.info("Fast forward event detected in HOH Competition");
      fastForwardingRef.current = true;

      const competitionTypes: Array<CompetitionType> = ['physical', 'mental', 'endurance', 'social', 'luck'];
      const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
      
      logger?.info(`Fast forward state check - isCompeting: ${isCompeting}, winner: ${!!winner}`);
      
      if (winner) {
        logger?.info("Fast forward: Winner already selected, forcing phase transition");
        dispatch({
          type: 'SET_PHASE',
          payload: 'Nomination'
        });
      } 
      else if (isCompeting) {
        logger?.info("Fast forward: Competition in progress, forcing completion with direct phase change");
        
        setIsCompeting(false);
        
        const randomWinner = activeHouseguests[Math.floor(Math.random() * activeHouseguests.length)];
        
        if (randomWinner) {
          const placeholderResults = activeHouseguests.map((guest) => ({
            name: guest.name,
            id: guest.id,
            position: guest.id === randomWinner.id ? 1 : 
              Math.floor(Math.random() * (activeHouseguests.length - 1)) + 2
          })).sort((a, b) => a.position - b.position);
          
          setResults(placeholderResults);
          setWinner(randomWinner);
          
          dispatch({
            type: 'SET_HOH',
            payload: randomWinner
          });
          
          logger?.info("Fast forward: Forcing direct phase transition to Nomination");
          dispatch({
            type: 'SET_PHASE',
            payload: 'Nomination'
          });
        }
      }
      else {
        logger?.info("Fast forward: Competition hasn't started yet, using selectWinnerImmediately");
        selectWinnerImmediately(randomType);
      }
    };
    
    document.addEventListener('game:fastForward', handleFastForward);
    
    return () => {
      document.removeEventListener('game:fastForward', handleFastForward);
    };
  }, [activeHouseguests, dispatch, isCompeting, logger, selectWinnerImmediately, setIsCompeting, setResults, setWinner, winner]);

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
