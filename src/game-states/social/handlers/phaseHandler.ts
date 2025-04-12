
import { SocialActionHandlerParams } from '../types';

/**
 * Handle advancing to the next game phase
 */
export function handleAdvancePhase({ controller }: SocialActionHandlerParams): void {
  // Advance to POV Competition
  controller.dispatch({
    type: 'SET_PHASE', 
    payload: 'POVCompetition'
  });
}
