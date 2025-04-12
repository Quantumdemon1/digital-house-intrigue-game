
import { useEffect, useRef } from 'react';
import { Logger, LogLevel } from '@/utils/logger';
import { useGame } from '@/contexts/GameContext';
import { UseAIDecisionsProps } from './ai-decision/types';
import { useVetoAI } from './ai-decision/useVetoAI';
import { useReplacementAI } from './ai-decision/useReplacementAI';
import { useFastForward } from './ai-decision/useFastForward';

export const useAIDecisions = ({
  meetingStage,
  povHolder,
  nominees,
  hoh,
  useVeto,
  savedNominee,
  replacementNominee,
  handleVetoDecision,
  handleSaveNominee,
  handleSelectReplacement,
  activeHouseguests,
  gameState
}: UseAIDecisionsProps) => {
  const { game } = useGame();
  const processingRef = useRef(false);
  
  // Create a stable logger instance
  const aiLogger = useRef(new Logger({
    logLevel: LogLevel.DEBUG,
    prefix: "AI-POV",
    enableTimestamp: true
  })).current;

  // Hook for fast forward functionality
  const { processingRef: ffProcessingRef } = useFastForward({
    meetingStage,
    povHolder,
    nominees,
    gameState,
    handleVetoDecision
  }, aiLogger);

  // Merge processing refs
  if (ffProcessingRef.current) {
    processingRef.current = true;
  }

  // Hooks for AI decision making
  const { makeVetoDecision, cleanup: cleanupVeto } = useVetoAI(
    povHolder,
    nominees,
    gameState,
    aiLogger
  );
  
  const { makeReplacementDecision, cleanup: cleanupReplacement } = useReplacementAI(
    hoh,
    gameState,
    aiLogger
  );

  // Effect for AI veto decision logic
  useEffect(() => {
    if (
      meetingStage === 'initial' && 
      povHolder && 
      !povHolder.isPlayer && 
      useVeto === null && 
      !processingRef.current
    ) {
      processingRef.current = true;
      
      makeVetoDecision({
        povHolder,
        nominees,
        isNominated: povHolder.isNominated,
        handleVetoDecision,
        handleSaveNominee
      });
    }
    
    return cleanupVeto;
  }, [
    meetingStage, 
    povHolder, 
    nominees,
    useVeto,
    handleVetoDecision,
    handleSaveNominee,
    makeVetoDecision,
    cleanupVeto
  ]);
  
  // AI decision logic for non-player HOH selecting replacement nominee
  useEffect(() => {
    if (
      meetingStage === 'selectReplacement' && 
      savedNominee && 
      hoh && 
      !hoh.isPlayer && 
      !replacementNominee &&
      !processingRef.current
    ) {
      processingRef.current = true;
      
      makeReplacementDecision({
        hoh,
        savedNominee,
        activeHouseguests,
        gameState,
        handleSelectReplacement
      });
    }
    
    return cleanupReplacement;
  }, [
    meetingStage,
    savedNominee, 
    hoh, 
    replacementNominee,
    activeHouseguests,
    gameState,
    handleSelectReplacement,
    makeReplacementDecision,
    cleanupReplacement
  ]);
  
  // Return empty object - all logic is in effects
  return {};
};
