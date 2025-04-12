
import { SocialActionHandlerParams } from '../types';
import { RelationshipEventType } from '../../../models/relationship-event';

/**
 * Handle advancing to the next game phase
 */
export function handleAdvancePhase({ controller }: SocialActionHandlerParams): void {
  // Log that the player is advancing to the next phase
  const player = controller.getActiveHouseguests().find(hg => hg.isPlayer);
  
  if (player) {
    // Give a small relationship boost to all houseguests when the player moves forward
    // This represents the player using their time efficiently
    const activeHouseguests = controller.getActiveHouseguests().filter(hg => !hg.isPlayer);
    
    activeHouseguests.forEach(hg => {
      controller.dispatch({
        type: 'UPDATE_RELATIONSHIPS',
        payload: {
          guestId1: player.id,
          guestId2: hg.id,
          change: 2,
          note: "Efficiently managed game time",
          eventType: 'positive_connection' as RelationshipEventType
        }
      });
    });
  }
  
  // Advance to POV Competition
  controller.dispatch({
    type: 'SET_PHASE', 
    payload: 'POVCompetition'
  });
}
