
import { useState, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/GameContext';
import { AIIntegrationSystem } from '@/systems/ai-integration';
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
  
  // Create a logger instance for AI operation logs
  const aiLogger = new Logger({
    logLevel: LogLevel.DEBUG,
    prefix: "AI",
    enableTimestamp: true
  });

  // AI nomination logic
  useEffect(() => {
    // Only process if HoH exists, HoH is AI, and we haven't already processed or started nominating
    if (hoh && !hoh.isPlayer && !isNominating && !ceremonyComplete && !aiProcessed) {
      // Set the flag to prevent multiple executions
      setAiProcessed(true);
      
      const makeDecision = async () => {
        try {
          // Log the start of AI decision process
          aiLogger.info(`AI HoH ${hoh.name} making nomination decision...`);
          
          // Prepare the nomination context
          const nominationContext = {
            eligible: potentialNominees.map(hg => hg.name),
            situation: `You are the Head of Household and must nominate two houseguests for eviction.`,
            relationships: potentialNominees.reduce((acc, nominee) => {
              acc[nominee.name] = getRelationship(hoh.id, nominee.id);
              return acc;
            }, {} as Record<string, number>)
          };
          
          toast({
            title: `${hoh.name} is thinking...`,
            description: "The Head of Household is choosing nominations.",
          });
          
          // Simulate thinking time
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Get decision from the AI system
          let decision;
          try {
            // Try to use the real AI system first
            decision = await aiSystem.makeDecision(
              hoh.name,
              'nomination',
              nominationContext,
              game
            );
            aiLogger.info(`AI decision received from AI system for ${hoh.name}`);
          } catch (error) {
            // Fall back to the fallback generator
            aiLogger.warn(`Error getting AI decision, using fallback: ${error}`);
            decision = aiSystem.getFallbackDecision(
              hoh.id, 
              'nomination',
              nominationContext,
              {
                getHouseguestById: (name: string) => 
                  potentialNominees.find(h => h.name === name) || null,
                getActiveHouseguests: () => potentialNominees
              }
            );
          }
          
          // Find the nominee objects based on the names returned by the AI
          const nominee1 = potentialNominees.find(h => h.name === decision.nominee1);
          const nominee2 = potentialNominees.find(h => h.name === decision.nominee2);
          
          if (nominee1 && nominee2) {
            // Set AI-chosen nominees
            setNominees([nominee1, nominee2]);
            
            aiLogger.info(`AI HoH ${hoh.name} nominated ${nominee1.name} and ${nominee2.name}`);
            
            // Delay before confirming to simulate decision making
            setTimeout(() => {
              confirmNominations();
            }, 2500);
          } else {
            // Fallback if AI decision is invalid
            aiLogger.error('AI nomination decision invalid: nominees not found');
            // Choose random nominees as fallback
            const aiNominees = [...potentialNominees]
              .sort(() => 0.5 - Math.random())
              .slice(0, 2);
              
            setNominees(aiNominees);
            setTimeout(() => confirmNominations(), 1500);
          }
        } catch (error) {
          aiLogger.error(`Error in AI nomination: ${error}`);
          // Fallback to random nominations
          const randomNominees = [...potentialNominees]
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
            
          setNominees(randomNominees);
          setTimeout(() => confirmNominations(), 1000);
        }
      };
      
      // Small delay before starting AI decision process
      setTimeout(makeDecision, 1000);
    }
  }, [hoh, isNominating, ceremonyComplete, aiProcessed, potentialNominees, setNominees, confirmNominations, toast, aiSystem, game, getRelationship]);

  return { aiProcessed };
};
