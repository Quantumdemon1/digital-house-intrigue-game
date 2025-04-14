
/**
 * @file systems/promise/promise-effects.ts
 * @description Functions for determining the relationship effects of promises
 */

import { Promise, PromiseStatus, PromiseType } from '../../models/promise';
import type { BigBrotherGame } from '../../models/game/BigBrotherGame';
import type { Logger } from '../../utils/logger';

/**
 * Calculate the relationship impact of a promise being kept or broken
 */
export function getPromiseImpact(promise: Promise): number {
  const baseImpact = 10; // Default impact
  
  if (promise.status === 'fulfilled') {
    // Positive impact for kept promises
    switch (promise.type) {
      case 'final_2':
        return baseImpact * 2.5; // Very high impact
      case 'safety':
        return baseImpact * 2; // High impact
      case 'alliance_loyalty':
        return baseImpact * 1.5; // Medium-high impact
      default:
        return baseImpact;
    }
  } else if (promise.status === 'broken') {
    // Negative impact for broken promises
    switch (promise.type) {
      case 'final_2':
        return baseImpact * -3; // Severe negative impact
      case 'safety':
        return baseImpact * -2.5; // Very high negative impact
      case 'alliance_loyalty':
        return baseImpact * -2; // High negative impact
      default:
        return baseImpact * -1.5; // Standard negative impact
    }
  }
  
  // No impact for other statuses
  return 0;
}

/**
 * Spread information about a betrayal to other houseguests
 */
export function spreadBetrayalInformation(
  game: BigBrotherGame,
  brokenPromise: Promise,
  logger: Logger
): void {
  if (!game) return;
  
  // There's a chance other houseguests find out about the betrayal
  const promisee = game.getHouseguestById(brokenPromise.toId);
  if (!promisee) return;
  
  // Promisee will tell their allies about the betrayal
  const alliances = game.allianceSystem?.getAllAlliances() || [];
  const promiseeAlliances = alliances.filter((a: any) => 
    a.members.some((m: any) => m.id === brokenPromise.toId)
  );
  
  if (promiseeAlliances.length > 0) {
    // Collect allies from all alliances
    const allies = new Set<string>();
    promiseeAlliances.forEach((alliance: any) => {
      alliance.members.forEach((m: any) => {
        if (m.id !== brokenPromise.toId && m.id !== brokenPromise.fromId) {
          allies.add(m.id);
        }
      });
    });
    
    // Tell allies about the betrayal
    allies.forEach(allyId => {
      const promiser = game.getHouseguestById(brokenPromise.fromId)?.name || "Someone";
      const promiseeName = promisee.name;
      
      game.relationshipSystem.addRelationshipEvent(
        allyId,
        brokenPromise.fromId,
        'heard_about_betrayal',
        `Heard that ${promiser} broke their promise to ${promiseeName}`,
        -10,
        true // This can decay over time
      );
    });
    
    logger.info(`${promisee.name} told their allies about ${game.getHouseguestById(brokenPromise.fromId)?.name}'s betrayal`);
  }
}
