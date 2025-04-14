
import { SocialActionHandlerParams } from '../types';
import { findPlayerHouseguest, logSocialEvent, updateRelationship } from '../utils';

/**
 * Handle talking to another houseguest
 */
export function handleTalkTo({ controller, targetId }: SocialActionHandlerParams): void {
  const player = findPlayerHouseguest(controller);
  const target = targetId ? controller.getHouseguestById(targetId) : undefined;
  
  if (player && target) {
    // Base relationship improvement
    const improvement = Math.floor(Math.random() * 5) + 3; // 3-7 points
    
    // Update relationship
    updateRelationship(
      controller,
      player.id,
      target.id,
      improvement,
      `${player.name} had a conversation with ${target.name}`
    );
    
    // Log event
    logSocialEvent(
      controller,
      'CONVERSATION',
      `${player.name} had a conversation with ${target.name}.`,
      [player.id, target.id],
      { relationshipChange: improvement }  // Add relationship change to event data
    );
    
    // Dispatch UI event for relationship impact visualization
    controller.dispatch({
      type: 'RELATIONSHIP_IMPACT',
      payload: {
        targetId: target.id,
        targetName: target.name,
        value: improvement
      }
    });
  }
}
