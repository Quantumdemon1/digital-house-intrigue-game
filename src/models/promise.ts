/**
 * @file src/models/promise.ts
 * @description Game promises between houseguests
 */

export interface Promise {
  id: string;
  fromId: string;  // Changed from fromHouseguestId
  toId: string;    // Changed from toHouseguestId
  description: string;
  type: PromiseType;
  status: PromiseStatus;
  madeOnWeek: number;  // Changed from createdWeek
  expiryWeek?: number;
  fulfilled?: boolean;
  broken?: boolean;
  context: Record<string, any>;  // Added context property
}

export type PromiseType = 
  | 'nomination_protection'
  | 'vote_pledge'
  | 'alliance_commitment'
  | 'information_sharing'
  | 'competition_cooperation'
  | 'final_two_deal'
  | 'safety'    // Added for backward compatibility
  | 'vote'      // Added for backward compatibility
  | 'final_2'   // Added for backward compatibility
  | 'alliance_loyalty'  // Added for backward compatibility
  | 'information';      // Added for backward compatibility

export type PromiseStatus = 
  | 'pending'   // Added pending status
  | 'active'
  | 'fulfilled'
  | 'kept'      // Added kept status as synonym for fulfilled
  | 'broken'
  | 'expired';

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

/**
 * Calculate the relationship impact of a promise being kept or broken
 */
export function getPromiseImpact(promise: Promise): number {
  const baseImpact = 10; // Default impact
  
  if (promise.status === 'kept' || promise.status === 'fulfilled') {
    // Positive impact for kept promises
    switch (promise.type) {
      case 'final_two_deal':
      case 'final_2':
        return baseImpact * 2.5; // Very high impact
      case 'nomination_protection':
      case 'safety':
        return baseImpact * 2; // High impact
      case 'alliance_commitment':
      case 'alliance_loyalty':
        return baseImpact * 1.5; // Medium-high impact
      default:
        return baseImpact;
    }
  } else if (promise.status === 'broken') {
    // Negative impact for broken promises
    switch (promise.type) {
      case 'final_two_deal':
      case 'final_2':
        return baseImpact * -3; // Severe negative impact
      case 'nomination_protection':
      case 'safety':
        return baseImpact * -2.5; // Very high negative impact
      case 'alliance_commitment':
      case 'alliance_loyalty':
        return baseImpact * -2; // High negative impact
      default:
        return baseImpact * -1.5; // Standard negative impact
    }
  }
  
  // No impact for other statuses
  return 0;
}
