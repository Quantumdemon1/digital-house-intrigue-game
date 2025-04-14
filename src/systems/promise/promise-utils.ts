/**
 * @file systems/promise/promise-utils.ts
 * @description Utility functions for evaluating promises and determining outcomes
 */

import { Promise, PromiseStatus, PromiseType } from '../../models/promise';

/**
 * Evaluates a promise based on an action and parameters to determine if it should be fulfilled, broken, or remain pending
 * @param promise The promise to evaluate
 * @param actionType The game action that occurred
 * @param params Action parameters for context
 * @returns New promise status after evaluation
 */
export function evaluatePromise(promise: Promise, actionType: string, params: any): PromiseStatus {
  // Skip if it's already fulfilled, broken, or expired
  if (promise.status !== 'pending' && promise.status !== 'active') {
    return promise.status;
  }
  
  // Evaluate based on promise type
  switch (promise.type) {
    case 'safety':
      // Check if this is a nomination action and the promisee was nominated by the promiser
      if (actionType === 'NOMINATE' && 
          params.nominatorId === promise.fromId && 
          params.nomineeId === promise.toId) {
        return 'broken';
      }
      break;
      
    case 'vote':
      // Check if this is a voting action
      if (actionType === 'CAST_VOTE' && params.voterId === promise.fromId) {
        // If context has specific vote target, check if the vote matches
        if (promise.context && promise.context.voteTarget) {
          return params.voteFor === promise.context.voteTarget ? 'fulfilled' : 'broken';
        }
        // Otherwise, check if the vote aligns with what the promisee wanted
        else if (promise.context && promise.context.promiseePreference) {
          return params.voteFor === promise.context.promiseePreference ? 'fulfilled' : 'broken';
        }
      }
      break;
      
    case 'alliance_loyalty':
      // Alliance betrayal (nominating alliance member)
      if (actionType === 'NOMINATE' && 
          params.nominatorId === promise.fromId &&
          promise.context && promise.context.allianceMembers && 
          promise.context.allianceMembers.includes(params.nomineeId)) {
        return 'broken';  
      }
      
      // Alliance betrayal (voting against alliance member)
      if (actionType === 'CAST_VOTE' && 
          params.voterId === promise.fromId &&
          promise.context && promise.context.allianceMembers && 
          promise.context.allianceMembers.includes(params.voteAgainst)) {
        return 'broken';
      }
      break;
      
    case 'information':
      // Information promises are fulfilled when specified information is shared
      if (actionType === 'SHARE_INFO' && 
          params.fromId === promise.fromId && 
          params.toId === promise.toId) {
        return 'fulfilled';
      }
      break;
      
    case 'final_2':
      // Final 2 promises can only be evaluated at the end
      if (actionType === 'FINAL_SELECTION' && 
          params.selecterId === promise.fromId) {
        return params.selectedId === promise.toId ? 'fulfilled' : 'broken';
      }
      break;
  }
  
  // If we got here, the promise status hasn't changed
  return promise.status;
}
