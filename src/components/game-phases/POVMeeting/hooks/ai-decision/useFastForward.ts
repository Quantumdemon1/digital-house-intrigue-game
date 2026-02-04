
import { useCallback, useRef, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { GameState } from '@/contexts/types/game-context-types';
import { Logger } from '@/utils/logger';
import { config } from '@/config';

interface UseFastForwardProps {
  meetingStage: 'initial' | 'selectSaved' | 'selectReplacement' | 'complete';
  povHolder: Houseguest | null;
  nominees: Houseguest[];
  gameState: GameState;
  handleVetoDecision: (decision: boolean) => void;
}

export const useFastForward = ({
  meetingStage,
  povHolder,
  nominees,
  gameState,
  handleVetoDecision
}: UseFastForwardProps, aiLogger: Logger) => {
  const processingRef = useRef(false);

  // Fast forward handler
  const handleFastForward = useCallback(() => {
    const fastForwardHandler = () => {
      if (meetingStage === 'initial' && povHolder && !povHolder.isPlayer && !processingRef.current) {
        processingRef.current = true;
        
        try {
          // Simulate POV holder decision
          let decision = false;
          
          // POV holder saves self if nominated
          if (povHolder.isNominated) {
            decision = true;
            // Delay to show decision process
            setTimeout(() => {
              handleVetoDecision(true);
            }, config.NPC_NOMINATION_REVEAL_DELAY);
          } else {
            // Decide based on relationship with nominees
            const relationships = nominees.map(nominee => {
              const relationshipsForGuest = gameState.relationships.get(povHolder.id);
              if (relationshipsForGuest) {
                const relation = relationshipsForGuest.get(nominee.id);
                return relation ? relation.score : 0;
              }
              return 0;
            });
            
            // If any relationship is > 30, use veto
            const bestRelationship = Math.max(...relationships);
            if (bestRelationship > 30) {
              decision = true;
              // Delay to show decision process
              setTimeout(() => {
                handleVetoDecision(true);
              }, config.NPC_NOMINATION_REVEAL_DELAY);
            } else {
              decision = false;
              // Delay to show decision process
              setTimeout(() => {
                handleVetoDecision(false);
              }, config.NPC_NOMINATION_REVEAL_DELAY);
            }
          }
        } catch (error: any) {
          aiLogger.error(`Error in fast forward handler: ${error.message}`);
          // Fallback to not using veto
          handleVetoDecision(false);
        } finally {
          processingRef.current = false;
        }
      }
    };
    
    document.addEventListener('game:fastForward', fastForwardHandler);
    return () => document.removeEventListener('game:fastForward', fastForwardHandler);
  }, [meetingStage, povHolder, nominees, gameState.relationships, handleVetoDecision, aiLogger]);

  // Register the fast forward event listener
  useEffect(handleFastForward, [handleFastForward]);

  return { processingRef };
};
