
import { SocialActionHandlerParams } from '../types';
import { findPlayerHouseguest, logSocialEvent, updateRelationship } from '../utils';

/**
 * Handle making promises to other houseguests
 */
export function handleMakePromise({ 
  controller, 
  targetId, 
  promiseType, 
  promiseDescription 
}: SocialActionHandlerParams): void {
  const player = findPlayerHouseguest(controller);
  const target = targetId ? controller.getHouseguestById(targetId) : undefined;
  
  if (player && target) {
    const type = promiseType || 'safety';
    const description = promiseDescription || 'a gameplay promise';
    
    // Making a promise has a positive effect on relationship
    const improvement = Math.floor(Math.random() * 6) + 7; // 7-12 points
    
    // Update relationship
    updateRelationship(
      controller,
      player.id,
      target.id,
      improvement,
      `${player.name} promised ${target.name}: ${description}`
    );
    
    // Log the promise event
    logSocialEvent(
      controller,
      'MAKE_PROMISE',
      `${player.name} made a promise to ${target.name}: ${description}`,
      [player.id, target.id],
      { promiseType: type, promiseDescription: description }
    );
  }
}
