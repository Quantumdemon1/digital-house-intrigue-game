/**
 * @file models/promise.ts
 * @description Promise system for tracking pledges between houseguests
 */

// Types of promises that can be made
export type PromiseType = 
  | 'safety'            // Won't nominate/target
  | 'vote'              // Vote a certain way
  | 'final_2'           // Take to final 2
  | 'alliance_loyalty'  // Stay loyal to alliance
  | 'information'       // Share information
  | 'custom';           // Other types

// Promise status
export type PromiseStatus = 
  | 'pending'  // Not yet fulfilled or broken
  | 'kept'     // Promise was kept
  | 'broken';  // Promise was broken

// Promise model
export interface Promise {
  id: string;
  fromId: string;        // ID of houseguest making the promise
  toId: string;          // ID of houseguest receiving the promise
  type: PromiseType;     // Type of promise
  description: string;   // Human-readable description
  madeOnWeek: number;    // When the promise was made
  status: PromiseStatus; // Current status
  context: {            // Additional context
    reciprocal?: boolean;      // Is this a mutual promise?
    relatedPromiseId?: string; // Reference to a related promise (e.g., reciprocal)
    initiallyBelieved?: boolean; // Whether recipient initially believed the promise
    evaluatedOnWeek?: number;  // When promise was evaluated
    [key: string]: any;        // Additional flexible context
  };
}

/**
 * Check if a promise has been kept or broken based on an action
 */
export function evaluatePromise(
  promise: Promise, 
  actionType: string,
  params: any
): PromiseStatus {
  switch (promise.type) {
    case 'safety':
      // Broken if the promiser nominates the promisee
      if (actionType === 'nominate' && params.nominatorId === promise.fromId) {
        return params.nomineeIds.includes(promise.toId) ? 'broken' : 'pending';
      }
      break;
      
    case 'vote':
      // Check if voting aligned with promise
      if (actionType === 'vote' && params.voterId === promise.fromId) {
        // Would need context about what was promised specifically
        // This is a simplification
        return promise.status; // No change without specific context
      }
      break;
      
    case 'final_2':
      // Broken if at final 3, promiser is HoH and evicts promisee
      if (actionType === 'final3_decision' && params.hohId === promise.fromId) {
        return params.evictedId === promise.toId ? 'broken' : 'pending';
      }
      
      // Kept if at final 3, promiser is HoH and keeps promisee
      if (actionType === 'finale_reached' && 
          params.finalist1Id === promise.fromId && 
          params.finalist2Id === promise.toId) {
        return 'kept';
      }
      
      if (actionType === 'finale_reached' && 
          params.finalist2Id === promise.fromId && 
          params.finalist1Id === promise.toId) {
        return 'kept';
      }
      break;
      
    case 'alliance_loyalty':
      // Broken if voted against alliance member
      if (actionType === 'vote_against_ally' && params.voterId === promise.fromId) {
        return 'broken';
      }
      break;
  }
  
  // Default to no change
  return promise.status;
}

/**
 * Get relationship impact when a promise is kept or broken
 */
export function getPromiseImpact(promise: Promise): number {
  // Base impacts
  const baseImpacts = {
    kept: {
      safety: 15,
      vote: 10,
      final_2: 25,
      alliance_loyalty: 12,
      information: 5,
      custom: 10
    },
    broken: {
      safety: -30,
      vote: -15,
      final_2: -40,
      alliance_loyalty: -25,
      information: -8,
      custom: -15
    }
  };
  
  // Get appropriate base impact
  let baseImpact = 0;
  if (promise.status === 'kept') {
    baseImpact = baseImpacts.kept[promise.type] || 10;
  } else if (promise.status === 'broken') {
    baseImpact = baseImpacts.broken[promise.type] || -15;
  }
  
  // Apply modifiers based on context
  let finalImpact = baseImpact;
  
  // Factors that can modify impact:
  // - Time since promise was made
  const weeksSincePromise = promise.context.evaluatedOnWeek - promise.madeOnWeek;
  if (weeksSincePromise > 3) {
    // Older promises have slightly less impact
    finalImpact = finalImpact * (1 - (weeksSincePromise * 0.05));
  }
  
  // - Initial belief in the promise
  if (promise.context.initiallyBelieved === false && promise.status === 'broken') {
    // Less impact if promisee didn't believe it anyway
    finalImpact = finalImpact * 0.7;
  }
  
  return finalImpact;
}
