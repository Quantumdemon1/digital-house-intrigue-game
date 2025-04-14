
/**
 * @file systems/promise/index.ts
 * @description Promise system for tracking and managing promises between houseguests
 */

import { Logger } from "@/utils/logger";
import { BigBrotherGame } from "@/models/game/BigBrotherGame";
import { Promise, PromiseType, PromiseStatus } from "@/models/promise";
import { v4 as uuidv4 } from 'uuid';

export class PromiseSystem {
  private game: BigBrotherGame | null = null;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  setGame(game: BigBrotherGame): void {
    this.game = game;
    
    // Initialize promises array if it doesn't exist
    if (!game.promises) {
      game.promises = [];
    }
    
    this.logger.info("Promise system initialized");
  }

  createPromise(
    fromId: string,
    toId: string,
    type: PromiseType,
    description: string
  ): Promise | null {
    if (!this.game) {
      this.logger.error("Cannot create promise: Game not set");
      return null;
    }

    const fromHouseguest = this.game.getHouseguestById(fromId);
    const toHouseguest = this.game.getHouseguestById(toId);

    if (!fromHouseguest || !toHouseguest) {
      this.logger.error(`Cannot create promise: Invalid houseguest IDs (${fromId}, ${toId})`);
      return null;
    }

    // Determine impact level based on promise type
    const impactLevel = this.getImpactLevel(type);

    const promise: Promise = {
      id: uuidv4(),
      type,
      description,
      fromId,
      toId,
      week: this.game.week,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      impactLevel
    };

    this.game.promises.push(promise);

    this.logger.info(`Promise created from ${fromHouseguest.name} to ${toHouseguest.name}: ${description}`);

    // Log game event
    this.game.logEvent(
      "promise_made",
      `${fromHouseguest.name} made a promise to ${toHouseguest.name}`,
      [fromId, toId],
      { promiseId: promise.id, promiseType: type }
    );

    return promise;
  }

  getPromisesForHouseguest(houseguestId: string): Promise[] {
    if (!this.game || !this.game.promises) {
      return [];
    }

    return this.game.promises.filter(
      p => p.fromId === houseguestId || p.toId === houseguestId
    );
  }

  getActivePromises(): Promise[] {
    if (!this.game || !this.game.promises) {
      return [];
    }

    return this.game.promises.filter(
      p => p.status === 'active' || p.status === 'pending'
    );
  }

  getPromiseById(id: string): Promise | undefined {
    if (!this.game || !this.game.promises) {
      return undefined;
    }

    return this.game.promises.find(p => p.id === id);
  }

  updatePromiseStatus(promiseId: string, status: PromiseStatus): boolean {
    if (!this.game || !this.game.promises) {
      this.logger.error("Cannot update promise: Game not set");
      return false;
    }

    const promiseIndex = this.game.promises.findIndex(p => p.id === promiseId);
    
    if (promiseIndex === -1) {
      this.logger.error(`Cannot update promise: Promise ID ${promiseId} not found`);
      return false;
    }

    this.game.promises[promiseIndex] = {
      ...this.game.promises[promiseIndex],
      status,
      updatedAt: Date.now()
    };

    const promise = this.game.promises[promiseIndex];
    const fromHouseguest = this.game.getHouseguestById(promise.fromId);
    const toHouseguest = this.game.getHouseguestById(promise.toId);

    if (fromHouseguest && toHouseguest) {
      this.logger.info(`Promise from ${fromHouseguest.name} to ${toHouseguest.name} status updated: ${status}`);

      // Log game event for status changes
      if (status === 'fulfilled') {
        this.game.logEvent(
          "promise_fulfilled",
          `${fromHouseguest.name} fulfilled their promise to ${toHouseguest.name}`,
          [promise.fromId, promise.toId],
          { promiseId: promise.id, promiseType: promise.type }
        );
      } else if (status === 'broken') {
        this.game.logEvent(
          "promise_broken",
          `${fromHouseguest.name} broke their promise to ${toHouseguest.name}`,
          [promise.fromId, promise.toId],
          { promiseId: promise.id, promiseType: promise.type }
        );
      }
    }

    return true;
  }

  private getImpactLevel(type: PromiseType): 'low' | 'medium' | 'high' {
    switch (type) {
      case 'safety':
      case 'final_2':
        return 'high';
      case 'vote':
      case 'alliance_loyalty':
        return 'medium';
      case 'information':
        return 'low';
      default:
        return 'medium';
    }
  }

  // Check promises that may be affected by a game event
  checkPromisesForEvent(eventType: string, data: any): void {
    if (!this.game || !this.game.promises) {
      return;
    }

    // For each active promise, evaluate if the event affects it
    this.game.promises
      .filter(p => p.status === 'active')
      .forEach(promise => {
        switch (eventType) {
          case 'nomination':
            // Check safety promises
            if (promise.type === 'safety' && data.nominatedBy === promise.fromId && data.nominatedId === promise.toId) {
              this.breakPromise(promise.id, `${promise.fromId} nominated ${promise.toId} despite promising safety`);
            }
            break;
          
          case 'vote':
            // Check voting promises
            if (promise.type === 'vote' && data.voter === promise.fromId) {
              // Logic to check if the vote aligns with what was promised
            }
            break;

          case 'eviction':
            // Check alliance loyalty promises
            if (promise.type === 'alliance_loyalty' && data.evictedId === promise.toId) {
              // Check if the person who promised loyalty voted for their eviction
            }
            break;
        }
      });
  }

  breakPromise(promiseId: string, reason: string): void {
    const promise = this.getPromiseById(promiseId);
    if (!promise) return;

    this.updatePromiseStatus(promiseId, 'broken');
    
    if (!this.game) return;
    
    // Apply negative relationship impact based on promise importance
    const relationshipSystem = this.game.relationshipSystem;
    if (relationshipSystem) {
      const impactValues = {
        'low': -15,
        'medium': -25,
        'high': -40
      };
      
      const impact = impactValues[promise.impactLevel];
      relationshipSystem.updateRelationship(promise.toId, promise.fromId, impact, "broke_promise");
      
      // Also impact the houseguest's relationship with allies of the promised houseguest
      const alliances = this.game.allianceSystem?.getAlliancesForHouseguest(promise.toId) || [];
      alliances.forEach(alliance => {
        alliance.members
          .filter(memberId => memberId !== promise.toId && memberId !== promise.fromId)
          .forEach(memberId => {
            relationshipSystem.updateRelationship(memberId, promise.fromId, Math.floor(impact / 2), "ally_broke_promise");
          });
      });
    }
  }

  fulfillPromise(promiseId: string): void {
    const promise = this.getPromiseById(promiseId);
    if (!promise) return;

    this.updatePromiseStatus(promiseId, 'fulfilled');
    
    if (!this.game) return;
    
    // Apply positive relationship impact
    const relationshipSystem = this.game.relationshipSystem;
    if (relationshipSystem) {
      const impactValues = {
        'low': 10,
        'medium': 15,
        'high': 25
      };
      
      const impact = impactValues[promise.impactLevel];
      relationshipSystem.updateRelationship(promise.toId, promise.fromId, impact, "kept_promise");
    }
  }
}
