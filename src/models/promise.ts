
/**
 * @file models/promise.ts
 * @description Promise type definition for the game
 */

import { Houseguest } from "./houseguest";

export type PromiseStatus = 'pending' | 'active' | 'fulfilled' | 'broken' | 'expired';
export type PromiseType = 'safety' | 'vote' | 'final_2' | 'alliance_loyalty' | 'information';

export interface Promise {
  id: string;
  type: PromiseType;
  description: string;
  fromId: string;
  toId: string;
  week: number;
  status: PromiseStatus;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  conditionMet?: boolean;
  impactLevel: 'low' | 'medium' | 'high';
}

export interface PromiseDisplayData extends Promise {
  fromName: string;
  toName: string;
}
