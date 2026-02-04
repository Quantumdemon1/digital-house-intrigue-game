import React, { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import CompetitionInitial from './CompetitionInitial';
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';
import { useCompetitionState } from './hooks/useCompetitionState';
import { usePhaseTransition } from './hooks/usePhaseTransition';
import { CompetitionType } from '@/models/houseguest/types';
import { selectRandomWinner } from './utils';

const HOHCompetition: React.FC = () => {
  const { gameState, logger, dispatch } = useGame();
  const fastForwardingRef = useRef(false);
  const spectatorAutoStartRef = useRef(false);
  
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

  // Use TOTAL active count (not competition participants) for phase detection
  // activeHouseguests excludes outgoing HoH which is correct for competition, but wrong for phase detection
  const totalActiveCount = gameState.houseguests.filter(h => h.status === 'Active').length;

  // Redirect to Final HoH if exactly 3 houseguests remain (after Final 4 week)
  // Final 4 (4 houseguests) should run a normal week
  useEffect(() => {
    if (totalActiveCount === 3 && !gameState.isFinalStage) {
      logger?.info(`Exactly 3 houseguests total - redirecting to Final HoH`);
      dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
    }
  }, [totalActiveCount, gameState.isFinalStage, dispatch, logger]);

  // Auto-start competition in spectator mode
  useEffect(() => {
    if (gameState.isSpectatorMode && !isCompeting && !winner && !spectatorAutoStartRef.current) {
      spectatorAutoStartRef.current = true;
      const competitionTypes: Array<CompetitionType> = ['physical', 'mental', 'endurance', 'social', 'luck'];
      const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
      const timer = setTimeout(() => {
        logger?.info("Spectator mode: Auto-starting HoH competition");
        startCompetition(randomType);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isSpectatorMode, isCompeting, winner, startCompetition, logger]);

  // Competition is now started manually via the Start button in CompetitionInitial
  // This gives users control and allows them to see the competition type before starting

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
        
        // Use stat-weighted winner selection
        const competitionWinner = selectRandomWinner(activeHouseguests, randomType);
        
        if (competitionWinner) {
          // Generate score-based results
          const scoredResults = activeHouseguests.map(guest => {
            let score = 1;
            switch (randomType) {
              case 'physical': score = guest.stats.physical; break;
              case 'mental': score = guest.stats.mental; break;
              case 'endurance': score = guest.stats.endurance; break;
              case 'social': score = guest.stats.social; break;
              case 'luck': score = guest.stats.luck + 5; break;
            }
            score *= (0.75 + Math.random() * 0.5);
            return { id: guest.id, name: guest.name, score };
          }).sort((a, b) => b.score - a.score);

          // Ensure winner is at top
          const winnerIdx = scoredResults.findIndex(r => r.id === competitionWinner.id);
          if (winnerIdx > 0) {
            [scoredResults[0], scoredResults[winnerIdx]] = [scoredResults[winnerIdx], scoredResults[0]];
          }

          const placeholderResults = scoredResults.map((result, index) => ({
            name: result.name,
            id: result.id,
            position: index + 1
          }));
          
          setResults(placeholderResults);
          setWinner(competitionWinner);
          
          dispatch({
            type: 'SET_HOH',
            payload: competitionWinner
          });
          
          logger?.info(`Fast forward: ${competitionWinner.name} selected as HoH (stat-weighted)`);
          // Wait for state to propagate before phase change
          setTimeout(() => {
            dispatch({
              type: 'SET_PHASE',
              payload: 'Nomination'
            });
          }, 100);
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
  
  return (
    <CompetitionInitial 
      gameWeek={gameState.week} 
      activeHouseguests={activeHouseguests}
      onStartCompetition={startCompetition}
    />
  );
};

export default HOHCompetition;
