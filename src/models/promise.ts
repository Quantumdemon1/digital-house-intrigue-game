
/**
 * @file src/models/promise.ts
 * @description Game promises between houseguests
 */

export interface Promise {
  id: string;
  fromHouseguestId: string;
  toHouseguestId: string;
  description: string;
  type: PromiseType;
  status: PromiseStatus;
  createdWeek: number;
  expiryWeek?: number;
  fulfilled?: boolean;
  broken?: boolean;
}

export type PromiseType = 
  | 'nomination_protection'
  | 'vote_pledge'
  | 'alliance_commitment'
  | 'information_sharing'
  | 'competition_cooperation'
  | 'final_two_deal';

export type PromiseStatus = 
  | 'active'
  | 'fulfilled'
  | 'broken'
  | 'expired';
