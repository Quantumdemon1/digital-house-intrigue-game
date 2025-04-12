
import { SocialActionHandlerParams } from '../types';

/**
 * Handle movement between locations
 */
export function handleMoveLocation({ controller, locationId }: SocialActionHandlerParams): void {
  if (locationId) {
    controller.game.currentLocation = locationId;
    // No interaction cost for movement
  }
}
