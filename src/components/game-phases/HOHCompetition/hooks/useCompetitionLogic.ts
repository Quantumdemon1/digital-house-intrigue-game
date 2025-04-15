
import { useState, useCallback } from 'react';
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
  
  // Start the competition simulation
  const simulateCompetition = useCallback((
    type: CompetitionType,
    activeHouseguests: Houseguest[],
    setIsCompeting: (value: boolean) => void,
    setResults: (results: any[]) => void,
    setWinner: (winner: Houseguest | null) => void
  ) => {
    // Verify we have houseguests before determining a winner
    if (activeHouseguests.length === 0) {
      logger?.error('No active houseguests available for competition');
      setIsCompeting(false);
      return;
    }
    
    // Determine the winner (weighted random based on stats)
    const competitionWinner = selectRandomWinner(activeHouseguests, type);
    
    if (!competitionWinner) {
      logger?.error('Failed to select a competition winner');
      setIsCompeting(false);
      return;
    }

    // Process the results and get positions
    const positions = processResults(competitionWinner, activeHouseguests);
    
    // Update state with results
    setResults(positions);
    setWinner(competitionWinner);
  }, [logger, processResults]);

  return { simulateCompetition };
};
