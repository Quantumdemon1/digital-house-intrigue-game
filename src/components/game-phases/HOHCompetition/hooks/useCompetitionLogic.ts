
import { useCallback, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { selectRandomWinner } from '../utils';
import { useCompetitionResults } from './useCompetitionResults';

/**
 * Hook for managing the competition logic
 */
export const useCompetitionLogic = () => {
  const { logger } = useGame();
  const { processResults } = useCompetitionResults();
  const processingRef = useRef(false);
  
  // Start the competition simulation
  const simulateCompetition = useCallback((
    type: CompetitionType,
    activeHouseguests: Houseguest[],
    setIsCompeting: (value: boolean) => void,
    setResults: (results: any[]) => void,
    setWinner: (winner: Houseguest | null) => void
  ) => {
    // Prevent multiple simultaneous calls
    if (processingRef.current) {
      logger?.warn("Competition simulation already in progress");
      return;
    }
    
    processingRef.current = true;
    
    try {
      // Verify we have houseguests before determining a winner
      if (activeHouseguests.length === 0) {
        logger?.error('No active houseguests available for competition');
        setIsCompeting(false);
        processingRef.current = false;
        return;
      }
      
      // Determine the winner (weighted random based on stats)
      const competitionWinner = selectRandomWinner(activeHouseguests, type);
      
      if (!competitionWinner) {
        logger?.error('Failed to select a competition winner');
        setIsCompeting(false);
        processingRef.current = false;
        return;
      }

      // Process the results and get positions (pass competition type for stat-based scoring)
      const positions = processResults(competitionWinner, activeHouseguests, type);
      
      // Update state with results in proper sequence to prevent race conditions
      setTimeout(() => {
        setResults(positions);
        setWinner(competitionWinner);
        setIsCompeting(false);
        processingRef.current = false;
      }, 500); // Increased timeout for better reliability
    } catch (error) {
      logger?.error("Error during competition simulation:", error);
      setIsCompeting(false);
      processingRef.current = false;
    }
  }, [logger, processResults]);

  return { simulateCompetition };
};
