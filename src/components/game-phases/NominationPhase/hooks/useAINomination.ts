
import { useState, useEffect, useRef, useCallback } from 'react';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/GameContext';
import { Logger, LogLevel } from '@/utils/logger';

interface UseAINominationProps {
  hoh: Houseguest | null;
  potentialNominees: Houseguest[];
  isNominating: boolean;
  ceremonyComplete: boolean;
  getRelationship: (guestId1: string, guestId2: string) => number;
  confirmNominations: () => void;
  setNominees: (nominees: Houseguest[]) => void;
}

interface AIDecision {
  nominees: Houseguest[];
  reasoning: string;
}

export const useAINomination = ({
  hoh,
  potentialNominees,
  isNominating,
  ceremonyComplete,
  getRelationship,
  confirmNominations,
  setNominees,
}: UseAINominationProps) => {
  const [aiProcessed, setAiProcessed] = useState(false);
  const [showAIDecision, setShowAIDecision] = useState(false);
  const [aiDecision, setAIDecision] = useState<AIDecision | null>(null);
  const { toast } = useToast();
  const { aiSystem, game, logger: gameLogger } = useGame();
  const processingRef = useRef(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create a logger instance for AI operation logs
  const aiLogger = useRef(new Logger({
    logLevel: LogLevel.DEBUG,
    prefix: "AI-NOM",
    enableTimestamp: true
  })).current;

  // Memoize functions that don't need to be recreated on every render
  const findNomineeObjects = useCallback((decision: any, fallbackToRandom: boolean = true) => {
    try {
      // Find the nominee objects based on the names returned by the AI
      const nominee1 = potentialNominees.find(h => h.name === decision.nominee1);
      const nominee2 = potentialNominees.find(h => h.name === decision.nominee2);
      
      if (nominee1 && nominee2) {
        return [nominee1, nominee2];
      }
      
      // If AI decision is invalid and fallback requested, use random selection
      if (fallbackToRandom) {
        aiLogger.error(`❌ Invalid nominees, using random selection`);
        return [...potentialNominees]
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
      }
      
      return null;
    } catch (error: any) {
      aiLogger.error(`Error finding nominees: ${error.message}`);
      if (fallbackToRandom) {
        return [...potentialNominees]
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
      }
      return null;
    }
  }, [potentialNominees, aiLogger]);
  
  const processAIDecision = useCallback(async () => {
    if (!hoh || processingRef.current) return;
    
    processingRef.current = true;
    aiLogger.info(`🤖 AI HoH ${hoh.name} making nomination decision...`);
    
    try {
      // Prepare the nomination context
      const nominationContext = {
        eligible: potentialNominees.map(hg => hg.name),
        situation: `You are the Head of Household and must nominate two houseguests for eviction.`,
        relationships: potentialNominees.reduce((acc, nominee) => {
          acc[nominee.name] = getRelationship(hoh.id, nominee.id);
          return acc;
        }, {} as Record<string, number>)
      };
      
      // Immediately show toast for improved UX
      toast({
        title: `${hoh.name} is nominating...`,
        description: "The Head of Household is choosing nominations.",
      });
      
      // Set timeout to ensure the process doesn't hang indefinitely
      const timeoutPromise = new Promise<{nominee1: string, nominee2: string, reasoning: string}>((_, reject) => {
        aiTimeoutRef.current = setTimeout(() => {
          reject(new Error("AI decision timed out"));
        }, 15000); // 15 second timeout
      });
      
      // Get decision from the AI system
      let decision;
      try {
        // Try to use the AI system with a timeout
        decision = await Promise.race([
          aiSystem.makeDecision(
            hoh.name,
            'nomination',
            nominationContext,
            game
          ),
          timeoutPromise
        ]);
        
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
        aiLogger.info(`Decision received: ${JSON.stringify(decision)}`);
      } catch (error: any) {
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
        
        // Fall back to the fallback generator
        aiLogger.warn(`⚠️ Using fallback: ${error.message}`);
        decision = aiSystem.getFallbackDecision(
          hoh.name, 
          'nomination',
          nominationContext,
          game
        );
        aiLogger.info(`Fallback decision: ${JSON.stringify(decision)}`);
      }
      
      // Find nominees and set them
      const nominees = findNomineeObjects(decision);
      if (nominees) {
        // Set nominees but don't confirm yet - show the AI decision card first
        setNominees(nominees);
        
        // Extract reasoning if available, or create a generic one
        const reasoning = decision.reasoning || 
          `Based on relationships and strategic position in the game, ${nominees[0].name} and ${nominees[1].name} are my targets this week.`;
        
        // Store AI decision data for display
        setAIDecision({
          nominees,
          reasoning
        });
        
        // Show AI decision card
        setShowAIDecision(true);
        
        aiLogger.info(`AI HoH ${hoh.name} nominated ${nominees[0].name} and ${nominees[1].name}`);
        
        toast({
          title: `${hoh.name} has decided`,
          description: `Nominated ${nominees[0].name} and ${nominees[1].name} for eviction.`,
        });
      }
    } catch (error: any) {
      aiLogger.error(`❌ Critical error in AI nomination process: ${error.message}`);
      
      // Emergency fallback to random nominations
      const randomNominees = [...potentialNominees]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      
      setNominees(randomNominees);
      toast({
        title: `${hoh.name} has decided`,
        description: `Nominated ${randomNominees[0].name} and ${randomNominees[1].name} for eviction.`,
      });
      
      // Immediately confirm nominations
      confirmNominations();
    } finally {
      processingRef.current = false;
    }
  }, [
    hoh, 
    potentialNominees, 
    getRelationship, 
    toast, 
    aiSystem, 
    game, 
    findNomineeObjects,
    setNominees,
    confirmNominations,
    aiLogger
  ]);

  // Handle closing the AI decision display
  const handleCloseAIDecision = useCallback(() => {
    setShowAIDecision(false);
    // After showing the AI decision and user closes the dialog, confirm nominations
    confirmNominations();
  }, [confirmNominations]);

  // AI nomination logic - immediate execution with cleanup
  useEffect(() => {
    // Only process if HoH exists, HoH is AI, and we haven't already processed
    if (
      hoh && 
      !hoh.isPlayer && 
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
  }, [hoh, isNominating, ceremonyComplete, aiProcessed, processAIDecision]);

  return { 
    aiProcessed,
    showAIDecision,
    aiDecision,
    handleCloseAIDecision
  };
};
