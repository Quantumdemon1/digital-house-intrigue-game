
import { useState, useRef, useCallback } from 'react';
import { Houseguest } from '@/models/houseguest';
import { Logger } from '@/utils/logger';
import { AIIntegrationSystem } from '@/systems/ai/ai-integration-system';
import { BigBrotherGame } from '@/models/game/BigBrotherGame';
import { AIDecision } from './types';

interface UseAIProcessingProps {
  hoh: Houseguest | null;
  potentialNominees: Houseguest[];
  aiLogger: Logger;
  aiSystem: AIIntegrationSystem | null;
  game: BigBrotherGame | null;
  setAiProcessed: (processed: boolean) => void;
  setNominees: (nominees: Houseguest[]) => void;
  setAIDecision: (decision: AIDecision | null) => void;
  setShowAIDecision: (show: boolean) => void;
}

export const useAIProcessing = ({
  hoh,
  potentialNominees,
  aiLogger,
  aiSystem,
  game,
  setAiProcessed,
  setNominees,
  setAIDecision,
  setShowAIDecision
}: UseAIProcessingProps) => {
  // Refs to track processing state and timeout
  const processingRef = useRef<boolean>(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Process AI decision for nominations
  const processAIDecision = useCallback(async () => {
    // If no HoH, AI system, or already processing, return
    if (!hoh || !aiSystem || !game || processingRef.current) {
      return;
    }

    // Set processing flag
    processingRef.current = true;
    aiLogger.info(`Starting AI nomination process for ${hoh.name}`);

    try {
      // Simulated processing time (1-2 seconds)
      const processingTime = 1000 + Math.random() * 1000;
      
      aiTimeoutRef.current = setTimeout(async () => {
        // Get AI decision
        aiLogger.debug("Requesting AI nomination decision");
        
        try {
          // In a real implementation, this would call the AI system
          // For now, we'll simulate it with a random selection
          const nominees = [...potentialNominees]
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
          
          // Create reasoning as if from AI
          const nomineeNames = nominees.map(n => n.name).join(" and ");
          const reasoning = `I've nominated ${nomineeNames} because they are the biggest threats to my game right now based on our social dynamics.`;
          
          // Set nominees in parent component
          setNominees(nominees);
          
          // Create AI decision object to show in UI
          setAIDecision({
            nominees,
            reasoning
          });
          
          // Show the AI decision dialog
          setShowAIDecision(true);
          
          // Reset processing flag
          processingRef.current = false;
          aiLogger.info(`AI nomination decision complete: ${nomineeNames}`);
        } catch (error) {
          aiLogger.error("Error in AI nomination process", { error });
          processingRef.current = false;
          
          // Fallback to random nominees if AI fails
          const fallbackNominees = [...potentialNominees]
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
          
          setNominees(fallbackNominees);
        }
      }, processingTime);
      
    } catch (error) {
      aiLogger.error("Error setting up AI nomination process", { error });
      processingRef.current = false;
    }
  }, [
    hoh, 
    potentialNominees, 
    aiSystem, 
    game, 
    setNominees, 
    setAIDecision, 
    setShowAIDecision,
    aiLogger
  ]);
  
  return {
    processAIDecision,
    processingRef,
    aiTimeoutRef
  };
};
