
import { useCallback, useRef } from 'react';
import { Houseguest } from '@/models/houseguest';
import { GameState } from '@/contexts/types/game-context-types';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/GameContext';
import { Logger } from '@/utils/logger';
import { AIVetoDecisionProps, BestNomineeResult } from './types';
import { calculateBestNomineeByRelationship } from './utils';

export const useVetoAI = (
  povHolder: Houseguest | null,
  nominees: Houseguest[],
  gameState: GameState,
  aiLogger: Logger
) => {
  const { toast } = useToast();
  const { game, aiSystem } = useGame();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const makeVetoDecision = useCallback(async ({
    povHolder,
    nominees,
    isNominated,
    handleVetoDecision,
    handleSaveNominee
  }: AIVetoDecisionProps) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      // Show thinking toast
      toast({
        title: `${povHolder?.name} is deciding...`,
        description: "The Power of Veto holder is making their decision."
      });
      
      // Self-nominations always use veto
      if (isNominated) {
        aiLogger.info(`${povHolder?.name} is nominated, automatically using veto`);
        
        timeoutRef.current = setTimeout(() => {
          handleVetoDecision(true);
          timeoutRef.current = setTimeout(() => {
            if (povHolder) {
              handleSaveNominee(povHolder);
            }
          }, 1500);
        }, 2000);
        
        return;
      }
      
      // Try to use AI system if available
      if (game && aiSystem && povHolder) {
        try {
          // Prepare context for AI decision
          const vetoContext = {
            povHolder: povHolder.name,
            isNominated: isNominated,
            nominees: nominees.map(n => n.name),
            relationships: nominees.reduce((acc, nominee) => {
              const relScore = gameState.relationships.get(povHolder.id)?.get(nominee.id)?.score || 0;
              acc[nominee.name] = relScore;
              return acc;
            }, {} as Record<string, number>)
          };
          
          // Get AI decision
          const decision = await aiSystem.makeDecision(
            povHolder.name,
            'veto',
            vetoContext,
            game
          );
          
          if (decision.useVeto) {
            aiLogger.info(`AI decision: Use veto to save ${decision.saveNominee}`);
            
            const nomineeToSave = nominees.find(n => n.name === decision.saveNominee);
            if (nomineeToSave) {
              timeoutRef.current = setTimeout(() => {
                handleVetoDecision(true);
                timeoutRef.current = setTimeout(() => {
                  handleSaveNominee(nomineeToSave);
                }, 1500);
              }, 2000);
            } else {
              throw new Error(`Could not find nominee: ${decision.saveNominee}`);
            }
          } else {
            aiLogger.info(`AI decision: Do not use veto`);
            timeoutRef.current = setTimeout(() => {
              handleVetoDecision(false);
            }, 2000);
          }
          return;
        } catch (error: any) {
          aiLogger.warn(`AI decision failed, using fallback: ${error.message}`);
          // Fall through to fallback
        }
      }
      
      // Fallback to relationship-based decision
      const bestNominee = calculateBestNomineeByRelationship(povHolder, nominees, gameState, aiLogger);
      
      if (bestNominee && bestNominee.nominee) {
        // Make decision based on relationship score and other factors
        if (
          bestNominee.score > 30 || // Good relationship
          bestNominee.hasAlliance || // In alliance
          (povHolder?.traits && povHolder.traits.includes('Loyal') && bestNominee.score > 10) // Loyal personality
        ) {
          timeoutRef.current = setTimeout(() => {
            handleVetoDecision(true);
            timeoutRef.current = setTimeout(() => {
              if (bestNominee.nominee) {
                handleSaveNominee(bestNominee.nominee);
              }
            }, 1500);
          }, 2000);
        } else {
          timeoutRef.current = setTimeout(() => {
            handleVetoDecision(false);
          }, 2000);
        }
      } else {
        // Fall back to random decision with 30% chance to use veto
        const decision = Math.random() > 0.7;
        timeoutRef.current = setTimeout(() => {
          handleVetoDecision(decision);
          
          // If using veto, pick a random nominee
          if (decision && nominees.length > 0) {
            const randomNominee = nominees[Math.floor(Math.random() * nominees.length)];
            timeoutRef.current = setTimeout(() => {
              handleSaveNominee(randomNominee);
            }, 1500);
          }
        }, 2000);
      }
    } catch (error: any) {
      aiLogger.error(`Error in veto decision: ${error.message}`);
      // Ultimate fallback - don't use veto
      timeoutRef.current = setTimeout(() => {
        handleVetoDecision(false);
      }, 2000);
    }
  }, [povHolder, nominees, gameState, toast, aiLogger, game, aiSystem]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    makeVetoDecision,
    cleanup
  };
};
