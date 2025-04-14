
import { SocialActionHandlerParams } from '../types';
import { findPlayerHouseguest, logSocialEvent, updateRelationship } from '../utils';

/**
 * Handle strategic discussions with other houseguests
 */
export function handleStrategicDiscussion({ 
  controller, 
  targetId,
  targetName,
  discussionType,
  rumorTargetName
}: SocialActionHandlerParams): void {
  const player = findPlayerHouseguest(controller);
  const target = targetId ? controller.getHouseguestById(targetId) : undefined;
  
  if (player && target) {
    const type = discussionType || 'general_strategy';
    let relationshipChange = 0;
    let eventType = 'STRATEGIC_DISCUSSION';
    let description = '';
    
    // Different outcomes based on discussion type
    switch (type) {
      case 'suggest_target':
        relationshipChange = Math.floor(Math.random() * 8) - 2; // -2 to +5
        description = `${player.name} and ${target.name} discussed potential targets in the game.`;
        break;
        
      case 'general_strategy':
        relationshipChange = Math.floor(Math.random() * 7) + 1; // +1 to +7
        description = `${player.name} and ${target.name} had a general strategy talk.`;
        break;
        
      case 'vote_intentions':
        relationshipChange = Math.floor(Math.random() * 10) - 3; // -3 to +6
        description = `${player.name} asked ${target.name} about their voting intentions.`;
        break;
        
      case 'final_two_deal':
        relationshipChange = Math.floor(Math.random() * 15) - 5; // -5 to +9
        eventType = 'FINAL_TWO_DEAL';
        description = `${player.name} proposed a final 2 deal with ${target.name}.`;
        break;
        
      case 'spread_rumor':
        const rumor = rumorTargetName || "another houseguest";
        relationshipChange = Math.floor(Math.random() * 12) - 8; // -8 to +3
        eventType = 'SPREAD_RUMOR';
        description = `${player.name} spread a rumor about ${rumor} to ${target.name}.`;
        break;
    }
    
    // Update relationship
    updateRelationship(
      controller,
      player.id,
      target.id,
      relationshipChange,
      description
    );
    
    // Log event
    logSocialEvent(
      controller,
      eventType,
      description,
      [player.id, target.id],
      { relationshipChange }  // Add relationship change to event data
    );
    
    // Dispatch UI event for relationship impact visualization
    controller.dispatch({
      type: 'RELATIONSHIP_IMPACT',
      payload: {
        targetId: target.id,
        targetName: target.name,
        value: relationshipChange
      }
    });
  }
}
