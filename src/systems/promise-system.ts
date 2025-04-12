/**
 * @file systems/promise-system.ts
 * @description System to handle promises between houseguests
 */

import { Promise, PromiseStatus, evaluatePromise, getPromiseImpact } from '../models/promise';
import type { BigBrotherGame } from '../models/game/BigBrotherGame';
import type { Logger } from '../utils/logger';

export class PromiseSystem {
  private logger: Logger;
  private game: BigBrotherGame | null = null;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Set the game instance
   */
  setGame(game: BigBrotherGame): void {
    this.game = game;
    
    // Initialize promises array if needed
    if (!this.game.promises) {
      this.game.promises = [];
    }
  }
  
  /**
   * Create a new promise between houseguests
   */
  createPromise(
    fromId: string, 
    toId: string, 
    type: string, 
    description: string, 
    context: Record<string, any> = {}
  ): Promise {
    if (!this.game) {
      throw new Error("Game not set in PromiseSystem");
    }
    
    const promise: Promise = {
      id: `promise-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fromId,
      toId,
      type: type as any, // Type assertion since we're passing string
      description,
      madeOnWeek: this.game.week,
      status: 'pending',
      context
    };
    
    // Add to game state
    this.game.promises.push(promise);
    
    this.logger.info(`Promise made: ${promise.description}`, {
      fromId, 
      toId, 
      type
    });
    
    return promise;
  }
  
  /**
   * Get all promises for a specific houseguest (made by or to them)
   */
  getPromisesForHouseguest(houseguestId: string): Promise[] {
    if (!this.game || !this.game.promises) {
      return [];
    }
    
    return this.game.promises.filter(p => 
      p.fromId === houseguestId || p.toId === houseguestId
    );
  }
  
  /**
   * Get promises between two specific houseguests
   */
  getPromisesBetween(guest1Id: string, guest2Id: string): Promise[] {
    if (!this.game || !this.game.promises) {
      return [];
    }
    
    return this.game.promises.filter(p => 
      (p.fromId === guest1Id && p.toId === guest2Id) || 
      (p.fromId === guest2Id && p.toId === guest1Id)
    );
  }
  
  /**
   * Evaluate promises based on game action
   */
  evaluatePromisesForAction(actionType: string, params: any): void {
    if (!this.game || !this.game.promises || !this.game.relationshipSystem) {
      return;
    }
    
    // Filter only pending promises
    const pendingPromises = this.game.promises.filter(p => p.status === 'pending');
    
    // Check each promise to see if this action impacts its status
    for (const promise of pendingPromises) {
      const newStatus = evaluatePromise(promise, actionType, params);
      
      // If status changed, update it and apply effects
      if (newStatus !== 'pending' && newStatus !== promise.status) {
        // Update the promise status
        promise.status = newStatus;
        promise.context.evaluatedOnWeek = this.game.week;
        
        // Calculate relationship impact
        const relationshipImpact = getPromiseImpact(promise);
        
        // Get houseguest names for logging
        const promiser = this.game.getHouseguestById(promise.fromId)?.name || promise.fromId;
        const promisee = this.game.getHouseguestById(promise.toId)?.name || promise.toId;
        
        // Apply effects for kept promises
        if (newStatus === 'kept') {
          this.logger.info(`Promise KEPT: ${promiser} kept their promise to ${promisee}`, {
            promiseId: promise.id,
            description: promise.description
          });
          
          // Increase relationship
          this.game.relationshipSystem.addRelationshipEvent(
            promise.fromId,
            promise.toId,
            'kept_promise',
            `${promiser} kept their promise: ${promise.description}`,
            relationshipImpact,
            false // Significant events don't decay easily
          );
        } 
        // Apply effects for broken promises
        else if (newStatus === 'broken') {
          this.logger.info(`Promise BROKEN: ${promiser} broke their promise to ${promisee}`, {
            promiseId: promise.id,
            description: promise.description
          });
          
          // Major negative relationship impact
          this.game.relationshipSystem.addRelationshipEvent(
            promise.fromId,
            promise.toId,
            'betrayal',
            `${promiser} broke their promise: ${promise.description}`,
            relationshipImpact, // This will be negative
            false // Betrayals don't decay easily
          );
          
          // Possible additional impacts, like telling others about the betrayal
          this.spreadBetrayalInformation(promise);
        }
      }
    }
  }
  
  /**
   * Spread information about a betrayal to other houseguests
   */
  private spreadBetrayalInformation(brokenPromise: Promise): void {
    if (!this.game) return;
    
    // There's a chance other houseguests find out about the betrayal
    const promisee = this.game.getHouseguestById(brokenPromise.toId);
    if (!promisee) return;
    
    // Promisee will tell their allies about the betrayal
    const alliances = this.game.allianceSystem?.getAllAlliances() || [];
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
        const promiser = this.game?.getHouseguestById(brokenPromise.fromId)?.name || "Someone";
        const promiseeName = promisee.name;
        
        this.game?.relationshipSystem.addRelationshipEvent(
          allyId,
          brokenPromise.fromId,
          'heard_about_betrayal',
          `Heard that ${promiser} broke their promise to ${promiseeName}`,
          -10,
          true // This can decay over time
        );
      });
      
      this.logger.info(`${promisee.name} told their allies about ${this.game.getHouseguestById(brokenPromise.fromId)?.name}'s betrayal`);
    }
  }
}

// Export the PromiseSystem type
export type { PromiseSystem };
