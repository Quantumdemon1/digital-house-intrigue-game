
import { useState, useEffect, useRef } from 'react';
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
  const { toast } = useToast();
  const { aiSystem, game, logger: gameLogger } = useGame();
  const processingRef = useRef(false);
  
  // Create a logger instance for AI operation logs
  const aiLogger = new Logger({
    logLevel: LogLevel.DEBUG,
    prefix: "AI-NOM",
    enableTimestamp: true
  });

  // AI nomination logic - immediate execution
  useEffect(() => {
    // Only process if HoH exists, HoH is AI, and we haven't already processed
    if (
      hoh && 
      !hoh.isPlayer && 
      !ceremonyComplete && 
      !aiProcessed && 
      !processingRef.current
    ) {
      // Set ref to prevent concurrent processing attempts
      processingRef.current = true;
      
      // Set the flag to prevent multiple executions
      setAiProcessed(true);
      
      const makeDecision = async () => {
        try {
          // Log the start of AI decision process
          aiLogger.info(`🤖 AI HoH ${hoh.name} making nomination decision...`);
          
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
          
          // Get decision from the AI system
          let decision;
          try {
            // Try to use the AI system
            decision = await aiSystem.makeDecision(
              hoh.name,
              'nomination',
              nominationContext,
              game
            );
            aiLogger.info(`Decision received: ${JSON.stringify(decision)}`);
          } catch (error: any) {
            // Fall back to the fallback generator
            aiLogger.warn(`⚠️ Using fallback: ${error.message}`);
            decision = aiSystem.getFallbackDecision(
              hoh.id, 
              'nomination',
              nominationContext,
              game
            );
            aiLogger.info(`Fallback decision: ${JSON.stringify(decision)}`);
          }
          
          // Find the nominee objects based on the names returned by the AI
          const nominee1 = potentialNominees.find(h => h.name === decision.nominee1);
          const nominee2 = potentialNominees.find(h => h.name === decision.nominee2);
          
          if (nominee1 && nominee2) {
            // Set AI-chosen nominees
            setNominees([nominee1, nominee2]);
            
            aiLogger.info(`AI HoH ${hoh.name} nominated ${nominee1.name} and ${nominee2.name}`);
            
            // Show a toast to inform the user
            toast({
              title: `${hoh.name} has decided`,
              description: `Nominated ${nominee1.name} and ${nominee2.name} for eviction.`,
            });
            
            // Immediately confirm nominations
            confirmNominations();
          } else {
            // Fallback if AI decision is invalid
            aiLogger.error(`❌ Invalid nominees, using random selection`);
            
            // Choose random nominees as fallback
            const aiNominees = [...potentialNominees]
              .sort(() => 0.5 - Math.random())
              .slice(0, 2);
              
            setNominees(aiNominees);
            toast({
              title: `${hoh.name} has decided`,
              description: `Nominated ${aiNominees[0].name} and ${aiNominees[1].name} for eviction.`,
            });
            
            // Immediately confirm nominations
            confirmNominations();
          }
          processingRef.current = false;
        } catch (error: any) {
          aiLogger.error(`❌ Error in AI nomination process: ${error.message}`);
          
          // Fallback to random nominations
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
          processingRef.current = false;
        }
      };
      
      // Immediately start AI decision process
      makeDecision();
    }
  }, [hoh, isNominating, ceremonyComplete, aiProcessed, potentialNominees, setNominees, confirmNominations, toast, aiSystem, game, getRelationship]);

  return { aiProcessed };
};
