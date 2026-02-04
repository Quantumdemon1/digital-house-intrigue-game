
import { useState, useEffect, useRef } from 'react';
import { Logger, LogLevel } from '@/utils/logger';
import { useGame } from '@/contexts/GameContext';
import { useAIProcessing } from './useAIProcessing';
import { useAIDecisionDisplay } from './useAIDecisionDisplay';
import { UseAINominationProps, UseAINominationReturn, AIDecision } from './types';

export const useAINomination = ({
  hoh,
  potentialNominees,
  isNominating,
  ceremonyComplete,
  confirmNominations,
  setNominees,
}: UseAINominationProps): UseAINominationReturn => {
  // Early detection of player HoH - skip all AI processing
  const isPlayerHoH = hoh?.isPlayer ?? false;
  
  const [aiProcessed, setAiProcessed] = useState(false);
  const [showAIDecision, setShowAIDecision] = useState(false);
  const [aiDecision, setAIDecision] = useState<AIDecision | null>(null);
  const { aiSystem, game, logger: gameLogger } = useGame();
  
  // Create a logger instance for AI operation logs
  const aiLogger = useRef(new Logger({
    logLevel: LogLevel.DEBUG,
    prefix: "AI-NOM",
    enableTimestamp: true
  })).current;

  // Initialize the AI processing and decision display hooks
  const { 
    processAIDecision, 
    processingRef,
    aiTimeoutRef 
  } = useAIProcessing({
    hoh,
    potentialNominees,
    aiLogger,
    aiSystem,
    game,
    setAiProcessed,
    setNominees,
    setAIDecision,
    setShowAIDecision
  });

  const { handleCloseAIDecision } = useAIDecisionDisplay({
    setShowAIDecision,
    confirmNominations
  });

  // AI nomination logic - ONLY for AI HoH after ceremony starts
  useEffect(() => {
    // Explicit guard: never run for player HoH
    if (isPlayerHoH) {
      return;
    }
    
    // Only process if ceremony has started and conditions are met
    if (
      hoh && 
      !hoh.isPlayer && 
      isNominating &&  // Must have started ceremony
      !ceremonyComplete && 
      !aiProcessed && 
      !processingRef.current
    ) {
      // Set the flag to prevent multiple executions
      setAiProcessed(true);
      
      // Start AI decision process
      processAIDecision();
    }
    
    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [isPlayerHoH, hoh, isNominating, ceremonyComplete, aiProcessed, processAIDecision, processingRef, aiTimeoutRef]);

  // Return early with empty state if player is HoH
  if (isPlayerHoH) {
    return { 
      aiProcessed: false,
      showAIDecision: false,
      aiDecision: null,
      handleCloseAIDecision: () => {}
    };
  }

  return { 
    aiProcessed,
    showAIDecision,
    aiDecision,
    handleCloseAIDecision
  };
};
