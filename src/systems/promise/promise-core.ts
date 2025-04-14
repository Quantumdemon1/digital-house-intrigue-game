
/**
 * @file systems/promise/promise-core.ts
 * @description Core PromiseSystem class implementation
 */

import { Promise, PromiseStatus, PromiseType } from '../../models/promise';
import type { BigBrotherGame } from '../../models/game/BigBrotherGame';
import type { Logger } from '../../utils/logger';
import { evaluatePromise } from './promise-utils';
import { getPromiseImpact, spreadBetrayalInformation } from './promise-effects';

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
    type: PromiseType, 
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
      type,
      description,
      week: this.game.week,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      impactLevel: 'medium',
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
        promise.updatedAt = Date.now();
        
        if (!promise.context) {
          promise.context = {};
        }
        promise.context.evaluatedOnWeek = this.game.week;
        
        // Calculate relationship impact
        const relationshipImpact = getPromiseImpact(promise);
        
        // Get houseguest names for logging
        const promiser = this.game.getHouseguestById(promise.fromId)?.name || promise.fromId;
        const promisee = this.game.getHouseguestById(promise.toId)?.name || promise.toId;
        
        // Apply effects for fulfilled promises
        if (newStatus === 'fulfilled') {
          this.logger.info(`Promise FULFILLED: ${promiser} kept their promise to ${promisee}`, {
            promiseId: promise.id,
            description: promise.description
          });
          
          // Increase relationship
          this.game.relationshipSystem.addRelationshipEvent(
            promise.toId,
            promise.fromId,
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
            promise.toId,
            promise.fromId,
            'betrayal',
            `${promiser} broke their promise: ${promise.description}`,
            relationshipImpact, // This will be negative
            false // Betrayals don't decay easily
          );
          
          // Possible additional impacts, like telling others about the betrayal
          spreadBetrayalInformation(this.game, promise, this.logger);
        }
      }
    }
  }
}
