
import { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { useCompetitionLogic } from './useCompetitionLogic';

export const useCompetitionState = () => {
  const { gameState, logger, dispatch } = useGame();
  const { simulateCompetition } = useCompetitionLogic();
  
  // Keep all useState calls in the same order
  const [competitionType, setCompetitionType] = useState<CompetitionType | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const [results, setResults] = useState<{
    name: string;
    position: number;
    id: string;
  }[]>([]);
  const [transitionAttempted, setTransitionAttempted] = useState(false);
  
  // Get active houseguests directly from gameState, excluding outgoing HoH
  const activeHouseguests = useMemo(() => {
    const active = gameState.houseguests.filter(h => h.status === 'Active');
    // For HoH competition, exclude the outgoing HoH (they can't compete)
    const outgoingHohId = gameState.hohWinner?.id;
    return outgoingHohId 
      ? active.filter(h => h.id !== outgoingHohId)
      : active;
  }, [gameState.houseguests, gameState.hohWinner]);
  
  const competitionRunning = useRef(false);
  const competitionStarted = useRef(false);
  
  // Log crucial information on component mount and state changes
  useEffect(() => {
    logger?.info(`HOHCompetition component state:`, {
      phase: gameState.phase,
      activeHouseguests: activeHouseguests.length,
      isCompeting,
      winner: winner?.name || "none",
      competitionType,
      transitionAttempted,
      competitionRunning: competitionRunning.current,
      competitionStarted: competitionStarted.current
    });
  }, [gameState.phase, activeHouseguests.length, isCompeting, winner, competitionType, logger, transitionAttempted]);
  
  const startCompetition = (type: CompetitionType) => {
    // Enhanced guard clauses to prevent duplicate starts
    if (isCompeting || competitionRunning.current || competitionStarted.current || winner) {
      logger?.info("Competition already in progress or completed, ignoring start request");
      return;
    }
    
    logger?.info(`Starting ${type} competition...`);
    competitionStarted.current = true;
    competitionRunning.current = true;
    
    // Update state in a safe sequence
    setCompetitionType(type);
    setIsCompeting(true);
    
    // Simulate the competition running with a delay to prevent UI issues
    setTimeout(() => {
      logger?.info("Competition completed, determining winner");
      
      try {
        // Only run if we're still mounted and competition is actually running
        if (competitionRunning.current) {
          simulateCompetition(type, activeHouseguests, setIsCompeting, setResults, setWinner);
        }
      } catch (error) {
        logger?.error("Error during competition simulation:", error);
        setIsCompeting(false);
        competitionRunning.current = false;
      }
    }, 3000); // Show the competition in progress for 3 seconds
  };

  // Simplified to accept just the competition type
  const selectWinnerImmediately = (type: CompetitionType) => {
    logger?.info("Fast forward: Immediately selecting competition winner");
    
    if (winner) {
      logger?.info("Winner already selected, forcing phase transition");
      // Force transition to nomination phase even if we already have a winner
      dispatch({
        type: 'SET_PHASE',
        payload: 'Nomination'
      });
      return;
    }
    
    // Set flags to prevent duplicate processing
    competitionStarted.current = true;
    competitionRunning.current = false;
    
    // Set competition type for display purposes
    setCompetitionType(type);
    setIsCompeting(false);
    
    try {
      // Select a random winner
      const randomWinner = activeHouseguests[Math.floor(Math.random() * activeHouseguests.length)];
      
      if (!randomWinner) {
        logger?.error("Failed to select a random winner - no active houseguests");
        return;
      }
      
      logger?.info(`Fast forward: Selected ${randomWinner.name} as HoH winner`);
      
      // Generate placeholder results
      const placeholderResults = activeHouseguests.map((guest) => ({
        name: guest.name,
        id: guest.id,
        position: guest.id === randomWinner.id ? 1 : Math.floor(Math.random() * (activeHouseguests.length - 1)) + 2
      })).sort((a, b) => a.position - b.position);
      
      // Update state to reflect the winner
      setResults(placeholderResults);
      setWinner(randomWinner);
      
      // Update HOH in game state DIRECTLY - this is crucial for the next phase
      dispatch({
        type: 'SET_HOH',
        payload: randomWinner
      });
      
      // IMMEDIATE phase change for fast forward reliability
      logger?.info(`Fast forward: Advancing to nomination phase with ${randomWinner.name} as HoH`);
      dispatch({
        type: 'SET_PHASE',
        payload: 'Nomination'
      });
    } catch (error) {
      logger?.error("Error during fast forward winner selection:", error);
    }
  };

  // Reset state if component is unmounted
  useEffect(() => {
    return () => {
      competitionRunning.current = false;
      competitionStarted.current = false;
    };
  }, []);

  return {
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
  };
};
