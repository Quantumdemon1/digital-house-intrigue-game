
import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { useCompetitionLogic } from './useCompetitionLogic';

export const useCompetitionState = () => {
  const { gameState, getActiveHouseguests, game, logger } = useGame();
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
  
  // Log crucial information on component mount and state changes
  useEffect(() => {
    logger?.info(`HOHCompetition component state:`, {
      phase: gameState.phase,
      activeHouseguests: activeHouseguests.length,
      isCompeting,
      winner: winner?.name || "none",
      competitionType,
      gamePhase: game?.phase || "unknown",
      transitionAttempted
    });
  }, [gameState.phase, activeHouseguests.length, isCompeting, winner, competitionType, logger, game?.phase, transitionAttempted]);
  
  const startCompetition = (type: CompetitionType) => {
    if (isCompeting) {
      logger?.info("Competition already in progress, ignoring start request");
      return;
    }
    
    logger?.info(`Starting ${type} competition...`);
    setCompetitionType(type);
    setIsCompeting(true);

    // Simulate the competition running
    setTimeout(() => {
      logger?.info("Competition completed, determining winner");
      simulateCompetition(type, activeHouseguests, setIsCompeting, setResults, setWinner);
    }, 3000); // Show the competition in progress for 3 seconds
  };

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
