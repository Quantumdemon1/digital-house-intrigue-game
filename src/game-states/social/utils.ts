
import { IGameControllerFacade } from '../../types/interfaces';
import { RelationshipData } from './types';

/**
 * Helper functions for social interaction handlers
 */

/**
 * Get or create a relationship between two houseguests
 */
export function getOrCreateRelationship(
  controller: IGameControllerFacade,
  guest1Id: string, 
  guest2Id: string
): RelationshipData {
  return controller.relationshipSystem.getOrCreateRelationship(guest1Id, guest2Id);
}

/**
 * Find the player houseguest from a list of active houseguests
 */
export function findPlayerHouseguest(controller: IGameControllerFacade) {
  return controller.getActiveHouseguests().find(hg => hg.isPlayer);
}

/**
 * Log a social interaction event
 */
export function logSocialEvent(
  controller: IGameControllerFacade,
  eventType: string,
  description: string,
  involvedHouseguests: string[],
  metadata?: any
) {
  controller.dispatch({
    type: 'LOG_EVENT',
    payload: {
      week: controller.week,
      phase: 'SocialInteraction',
      type: eventType,
      description,
      involvedHouseguests,
      metadata
    }
  });
}

/**
 * Update relationship between two houseguests
 */
export function updateRelationship(
  controller: IGameControllerFacade,
  guestId1: string,
  guestId2: string,
  change: number,
  note: string
) {
  controller.dispatch({
    type: 'UPDATE_RELATIONSHIPS',
    payload: {
      guestId1,
      guestId2,
      change,
      note
    }
  });
}
