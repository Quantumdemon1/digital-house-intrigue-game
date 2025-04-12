
import { SocialActionHandlerParams } from '../types';
import { findPlayerHouseguest, logSocialEvent, updateRelationship } from '../utils';

/**
 * Handle relationship building with other houseguests
 */
export function handleRelationshipBuilding({ controller, targetId }: SocialActionHandlerParams): void {
  const player = findPlayerHouseguest(controller);
  const target = targetId ? controller.getHouseguestById(targetId) : undefined;
  
  if (player && target) {
    // Enhanced relationship improvement
    const improvement = Math.floor(Math.random() * 8) + 5; // 5-12 points
    
    // Update relationship
    updateRelationship(
      controller,
      player.id,
      target.id,
      improvement,
      `${player.name} spent quality time with ${target.name}`
    );
    
    // Log event
    logSocialEvent(
      controller,
      'RELATIONSHIP_BUILDING',
      `${player.name} spent quality time with ${target.name}, building a stronger bond.`,
      [player.id, target.id]
    );
  }
}
