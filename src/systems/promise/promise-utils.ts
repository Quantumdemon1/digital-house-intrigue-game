/**
 * @file systems/promise/promise-utils.ts
 * @description Utility functions for evaluating promises
 */

import { Promise, PromiseStatus, PromiseType } from '../../models/promise';

/**
 * Evaluate if a promise has been fulfilled or broken based on a game action
 */
export function evaluatePromise(
  promise: Promise, 
  actionType: string, 
  params: any
): PromiseStatus {
  // Default to keeping the current status
  let newStatus: PromiseStatus = promise.status;
  
  // Only evaluate pending promises
  if (promise.status !== 'pending' && promise.status !== 'active') {
    return promise.status;
  }
  
  switch (promise.type) {
    case 'nomination_protection':
    case 'safety':
      // If the promiser nominated the promisee, the promise is broken
      if (actionType === 'make_nominations' && 
          params.nominatorId === promise.fromId && 
          params.nomineeIds?.includes(promise.toId)) {
        newStatus = 'broken';
      }
      break;
      
    case 'vote_pledge':
    case 'vote':
      // Check if the promiser voted as they said they would
      if (actionType === 'cast_vote' && 
          params.voterId === promise.fromId) {
        // If context specifies who to vote for, check if the promise was kept
        if (promise.context.voteFor === params.voteFor) {
          newStatus = 'kept';
        } else if (promise.context.voteFor && promise.context.voteFor !== params.voteFor) {
          newStatus = 'broken';
        }
      }
      break;
      
    case 'alliance_commitment':
    case 'alliance_loyalty':
      // Check for alliance betrayals
      if (actionType === 'nominate_ally' && 
          params.nominatorId === promise.fromId) {
        newStatus = 'broken';
      }
      break;
      
    // Other promise types would be evaluated here
  }
  
  return newStatus;
}
