
import { useCallback, useRef } from 'react';
import { Houseguest } from '@/models/houseguest';
import { GameState } from '@/contexts/types/game-context-types';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/GameContext';
import { Logger } from '@/utils/logger';
import { AIReplacementDecisionProps } from './types';
import { calculateReplacementNomineeByRelationship } from './utils';

export const useReplacementAI = (
  hoh: Houseguest | null,
  gameState: GameState,
  aiLogger: Logger
) => {
  const { toast } = useToast();
  const { game, aiSystem } = useGame();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const makeReplacementDecision = useCallback(async ({
    hoh,
    savedNominee,
    activeHouseguests,
    gameState,
    handleSelectReplacement
  }: AIReplacementDecisionProps) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      // Show thinking toast
      toast({
        title: `${hoh?.name} is deciding...`,
        description: "The HoH is selecting a replacement nominee."
      });
      
      // Try to use AI system if available
      if (game && aiSystem && hoh && savedNominee) {
        try {
          const eligibleReplacements = activeHouseguests.filter(houseguest => 
            !houseguest.isHoH && 
            !houseguest.isNominated && 
            houseguest.id !== savedNominee.id && 
            !houseguest.isPovHolder
          );
          
          if (eligibleReplacements.length === 0) {
            throw new Error("No eligible replacements");
          }
          
          // Prepare context for AI decision
          const replacementContext = {
            hohName: hoh.name,
            savedNominee: savedNominee.name,
            eligible: eligibleReplacements.map(hg => hg.name),
            relationships: eligibleReplacements.reduce((acc, hg) => {
              const relScore = gameState.relationships.get(hoh.id)?.get(hg.id)?.score || 0;
              acc[hg.name] = relScore;
              return acc;
            }, {} as Record<string, number>)
          };
          
          // Get AI decision
          const decision = await aiSystem.makeDecision(
            hoh.name,
            'replacement',
            replacementContext,
            game
          );
          
          const replacementName = decision.replacementNominee;
          const replacementHg = eligibleReplacements.find(hg => hg.name === replacementName);
          
          if (replacementHg) {
            aiLogger.info(`AI decision: Replace with ${replacementHg.name}`);
            timeoutRef.current = setTimeout(() => {
              handleSelectReplacement(replacementHg);
            }, 2500);
            return;
          } else {
            throw new Error(`Could not find replacement: ${replacementName}`);
          }
        } catch (error: any) {
          aiLogger.warn(`AI decision failed, using fallback: ${error.message}`);
          // Fall through to fallback
        }
      }
      
      // Fallback to relationship-based decision
      const worstRelationship = calculateReplacementNomineeByRelationship(
        hoh, 
        savedNominee, 
        activeHouseguests, 
        gameState, 
        aiLogger
      );
      
      if (worstRelationship) {
        timeoutRef.current = setTimeout(() => {
          handleSelectReplacement(worstRelationship);
        }, 2500);
      } else {
        // Ultimate fallback - random selection
        const eligibleReplacements = activeHouseguests.filter(houseguest => 
          !houseguest.isHoH && 
          !houseguest.isNominated && 
          houseguest.id !== savedNominee?.id && 
          !houseguest.isPovHolder
        );
        
        if (eligibleReplacements.length > 0) {
          const randomIdx = Math.floor(Math.random() * eligibleReplacements.length);
          timeoutRef.current = setTimeout(() => {
            handleSelectReplacement(eligibleReplacements[randomIdx]);
          }, 2500);
        }
      }
    } catch (error: any) {
      aiLogger.error(`Error in replacement decision: ${error.message}`);
      
      // Ultimate fallback - first eligible
      if (savedNominee) {
        const firstEligible = activeHouseguests.find(houseguest => 
          !houseguest.isHoH && 
          !houseguest.isNominated && 
          houseguest.id !== savedNominee.id && 
          !houseguest.isPovHolder
        );
        
        if (firstEligible) {
          timeoutRef.current = setTimeout(() => {
            handleSelectReplacement(firstEligible);
          }, 2500);
        }
      }
    }
  }, [hoh, gameState, toast, aiLogger, game, aiSystem]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    makeReplacementDecision,
    cleanup
  };
};
