
import { useCallback, useRef, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { Logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';
import { BigBrotherGame } from '@/models/game/BigBrotherGame';
import { AIDecision } from './types';

interface UseAIProcessingProps {
  hoh: Houseguest | null;
  potentialNominees: Houseguest[];
  aiLogger: Logger;
  aiSystem: any;
  game: BigBrotherGame;
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
  const processingRef = useRef(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
          if (hoh) {
            acc[nominee.name] = game.relationshipSystem?.getRelationship(hoh.id, nominee.id)?.score || 0;
          }
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
    } finally {
      processingRef.current = false;
    }
  }, [
    hoh, 
    potentialNominees, 
    toast, 
    aiSystem, 
    game, 
    findNomineeObjects,
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
