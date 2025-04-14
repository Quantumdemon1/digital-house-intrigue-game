/**
 * @file systems/promise/promise-effects.ts
 * @description Functions for determining the impact of promises and their effects on the game
 */

import { Promise, PromiseType } from '../../models/promise';
import { BigBrotherGame } from '../../models/game/BigBrotherGame';
import { Logger } from '../../utils/logger';

/**
 * Calculate the relationship impact of a promise based on its type and status
 * @param promise The promise to calculate impact for
 * @returns A numeric value representing relationship impact (positive or negative)
 */
export function getPromiseImpact(promise: Promise): number {
  // Base values
  const basePositive = 15;  // Base value for kept promises
  const baseNegative = -25; // Base value for broken promises
  
  // Impact multipliers by promise type (higher = more impactful)
  const impactMultiplier: Record<PromiseType, number> = {
    'safety': 1.5,       // Safety promises are very important
    'final_2': 2.0,      // Final 2 deals are the most impactful
    'vote': 1.0,         // Vote promises have standard impact
    'alliance_loyalty': 1.8, // Alliance loyalty is quite important
    'information': 0.7   // Information sharing is less impactful
  };
  
  // Calculate impact based on status and type
  if (promise.status === 'fulfilled') {
    return Math.round(basePositive * impactMultiplier[promise.type]);
  } else if (promise.status === 'broken') {
    return Math.round(baseNegative * impactMultiplier[promise.type]);
  }
  
  // For pending/active/expired promises, no impact yet
  return 0;
}

/**
 * When a promise is broken, determine who should learn about it and how it affects relationships
 * @param game Current game instance
 * @param promise The broken promise
 * @param logger Logger instance for recording events
 */
export function spreadBetrayalInformation(game: BigBrotherGame, promise: Promise, logger: Logger): void {
  if (promise.status !== 'broken') return;
  
  const promiser = game.getHouseguestById(promise.fromId);
  const promisee = game.getHouseguestById(promise.toId);
  
  if (!promiser || !promisee) return;
  
  // The person who was betrayed always knows
  logger.info(`${promisee.name} knows that ${promiser.name} broke their promise.`);
  
  // Others who find out depend on various factors
  const chanceToFind = {
    // Base chance for someone to find out about the betrayal
    'base': 0.2,
    // When houseguests are close to the betrayed person
    'closeToBetrayed': 0.6,
    // When houseguests are close to the betrayer
    'closeToBetrayer': 0.3,
    // When houseguests are in same alliance
    'sameAlliance': 0.8
  };
  
  // Check each active houseguest to see if they find out
  game.getActiveHouseguests().forEach(hg => {
    // Skip the parties directly involved
    if (hg.id === promiser.id || hg.id === promisee.id) return;
    
    let findOutChance = chanceToFind.base;
    
    // Adjust chance based on relationships
    const relationToBetrayed = game.relationshipSystem.getRelationship(hg.id, promisee.id);
    const relationToBetrayer = game.relationshipSystem.getRelationship(hg.id, promiser.id);
    
    if (relationToBetrayed > 50) findOutChance = Math.max(findOutChance, chanceToFind.closeToBetrayed);
    if (relationToBetrayer > 50) findOutChance = Math.max(findOutChance, chanceToFind.closeToBetrayer);
    
    // Check if they're in the same alliance
    const inSameAlliance = game.allianceSystem?.areInSameAlliance(hg.id, promisee.id) || false;
    if (inSameAlliance) findOutChance = Math.max(findOutChance, chanceToFind.sameAlliance);
    
    // Determine if they find out
    if (Math.random() < findOutChance) {
      logger.info(`${hg.name} found out about ${promiser.name}'s betrayal of ${promisee.name}.`);
      
      // Create a mild negative relationship impact
      game.relationshipSystem.addRelationshipEvent(
        hg.id,
        promiser.id,
        'discovered_betrayal',
        `${hg.name} learned that ${promiser.name} broke a promise to ${promisee.name}`,
        Math.round(getPromiseImpact(promise) * 0.4), // 40% of the original impact
        false // These impressions tend to stick
      );
    }
  });
}
