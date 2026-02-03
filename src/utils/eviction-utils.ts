
import { Dispatch } from 'react';
import { GameAction } from '@/contexts/types/game-context-types';
import { Houseguest } from '@/models/houseguest';

/**
 * Handles the eviction of a houseguest by dispatching necessary actions
 * 
 * @param dispatch - The dispatch function from the Game context
 * @param evictedHouseguest - The houseguest being evicted
 * @param isJuryEligible - Whether the houseguest is eligible for jury (usually based on week number)
 * @param week - The current week number for logging
 */
export const handleHouseguestEviction = (
  dispatch: Dispatch<GameAction>,
  evictedHouseguest: Houseguest,
  isJuryEligible: boolean,
  week: number
) => {
  console.log(`Evicting houseguest: ${evictedHouseguest.name} (${evictedHouseguest.id})`, 
    isJuryEligible ? 'to jury' : 'from house');
  
  // Log the eviction event
  dispatch({
    type: 'LOG_EVENT',
    payload: {
      week: week,
      phase: 'Eviction',
      type: 'EVICTION',
      description: `${evictedHouseguest.name} was evicted from the Big Brother house${isJuryEligible ? ' and joined the jury' : ''}.`,
      involvedHouseguests: [evictedHouseguest.id],
      metadata: { toJury: isJuryEligible }
    }
  });
  
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
