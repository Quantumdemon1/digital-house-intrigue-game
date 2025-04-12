
import { Houseguest } from '../../models/houseguest';
import { IGameControllerFacade } from '../../types/interfaces';

/**
 * Types for social interaction action handlers and shared functionality
 */

export interface SocialActionHandlerParams {
  controller: IGameControllerFacade;
  player?: Houseguest;
  target?: Houseguest;
  locationId?: string;
  targetId?: string;
  targetName?: string;
  discussionType?: string;
  promiseType?: string;
  promiseDescription?: string;
  rumorTargetName?: string;
}

export interface RelationshipData {
  score: number;
  alliance: string | null;
  notes: string[];
  events: any[];
  lastInteractionWeek: number;
}
