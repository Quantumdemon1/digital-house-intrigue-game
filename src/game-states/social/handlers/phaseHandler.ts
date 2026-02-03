
import { SocialActionHandlerParams } from '../types';
import { RelationshipEventType } from '../../../models/relationship-event';

/**
 * Handle advancing to the next game phase
 * BB USA Format: Social interaction happens ONLY after eviction, before next HoH
 * This action ends the social phase and advances to the next week
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
  
  // BB USA Format: After social phase ends, advance week and go to next HoH competition
  // This is the ONLY place where week advancement should happen
  controller.dispatch({
    type: 'ADVANCE_WEEK',
    payload: {}
  });
}
