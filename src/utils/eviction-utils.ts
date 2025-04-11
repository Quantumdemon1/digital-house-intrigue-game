
import { Dispatch } from 'react';
import { GameAction } from '@/contexts/types/game-context-types';
import { Houseguest } from '@/models/houseguest';

/**
 * Handles the eviction of a houseguest by dispatching necessary actions
 * 
 * @param dispatch - The dispatch function from the Game context
 * @param evictedHouseguest - The houseguest being evicted
 * @param isJuryEligible - Whether the houseguest is eligible for jury (usually based on week number)
 */
export const handleHouseguestEviction = (
  dispatch: Dispatch<GameAction>,
  evictedHouseguest: Houseguest,
  isJuryEligible: boolean
) => {
  console.log(`Evicting houseguest: ${evictedHouseguest.name} (${evictedHouseguest.id})`, 
    isJuryEligible ? 'to jury' : 'from house');
  
  // Step 1: Dispatch player action for eviction
  dispatch({
    type: 'PLAYER_ACTION',
    payload: {
      actionId: 'evict_houseguest',
      params: {
        evictedId: evictedHouseguest.id,
        toJury: isJuryEligible
      }
    }
  });
  
  // Step 2: Directly dispatch EVICT_HOUSEGUEST action
  // This ensures immediate state updates in the reducer
  dispatch({
    type: 'EVICT_HOUSEGUEST',
    payload: {
      evicted: evictedHouseguest,
      toJury: isJuryEligible
    }
  });
};

/**
 * Completes the eviction process by advancing to the next phase
 * 
 * @param dispatch - The dispatch function from the Game context
 */
export const completeEvictionProcess = (dispatch: Dispatch<GameAction>) => {
  console.log("Completing eviction process and advancing to next phase");
  
  // Dispatch eviction_complete action to signal completion
  dispatch({
    type: 'PLAYER_ACTION',
    payload: {
      actionId: 'eviction_complete',
      params: {}
    }
  });
};
