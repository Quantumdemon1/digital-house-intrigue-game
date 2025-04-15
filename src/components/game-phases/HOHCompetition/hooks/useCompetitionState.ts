
import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { useCompetitionLogic } from './useCompetitionLogic';

export const useCompetitionState = () => {
  const { gameState, getActiveHouseguests, dispatch, game, logger } = useGame();
  const { simulateCompetition } = useCompetitionLogic();
  
  const [competitionType, setCompetitionType] = useState<CompetitionType | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [results, setResults] = useState<{
    name: string;
    position: number;
    id: string;
  }[]>([]);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const [transitionAttempted, setTransitionAttempted] = useState(false);
  
  const activeHouseguests = getActiveHouseguests();
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
      gamePhase: game?.phase || "unknown",
      transitionAttempted,
      competitionRunning: competitionRunning.current,
      competitionStarted: competitionStarted.current
    });
  }, [gameState.phase, activeHouseguests.length, isCompeting, winner, competitionType, logger, game?.phase, transitionAttempted]);
  
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
    setTimeout(() => {
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
        } finally {
          competitionRunning.current = false;
        }
      }, 3000); // Show the competition in progress for 3 seconds
    }, 0);
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
    startCompetition
  };
};
