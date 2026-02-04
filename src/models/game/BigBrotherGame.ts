
/**
 * @file models/game/BigBrotherGame.ts
 * @description Big Brother Game state definition - refactored into smaller files
 */

import { Houseguest, HouseguestStatus } from '../houseguest';
import { Alliance } from '../alliance';
import { GamePhase, GameEvent } from '../game-state';
import { Promise } from '../promise';
import { Deal, NPCProposal } from '../deal';
import { PromiseSystem } from '../../systems/promise-system';
import { DealSystem } from '../../systems/deal-system';
import {
  logGameEvent, 
  advancePhase, 
  resetWeek, 
  getActiveHouseguests,
  getEligibleVoters
} from './gameUtils';
import { 
  advanceWeek, 
  getGameSettings, 
  changeGameState,
  cloneGame
} from './gameStateManager';
import { GameStateInterface } from './types';

// Re-export original type for backward compatibility
export type { GameEvent } from '../game-state';

export class BigBrotherGame implements GameStateInterface {
  // Game configuration
  public houseguests: Houseguest[] = [];
  public week: number = 1;
  public phase: GamePhase = 'Initialization';

  // State tracking
  public hohWinner: string | null = null;
  public povWinner: string | null = null;
  public povPlayers: string[] = []; // Add povPlayers property
  public nominees: string[] = [];
  public evicted: Houseguest[] = [];
  public jury: Houseguest[] = [];
  public juryMembers: string[] = [];
  public winner: Houseguest | null = null;
  public runnerUp: Houseguest | null = null;
  public finalTwo: Houseguest[] = [];
  public currentWeek: number = 1;
  public finalHoHWinners: {
    part1: string | null;
    part2: string | null;
    part3: string | null;
  } = { part1: null, part2: null, part3: null }; // Add finalHoHWinners property
  
  // Game systems
  public relationshipSystem: any = null;
  public competitionSystem: any = null;
  public aiSystem: any = null;
  public allianceSystem: any = null;
  public promiseSystem: PromiseSystem | null = null;
  public dealSystem: DealSystem | null = null;
  
  // Game state management
  public currentState: any = null;
  public currentLocation: string = 'living-room';
  public openAllianceProposalUI: () => void = () => {};
  public game: BigBrotherGame = this; // Self-reference for compatibility

  // Event log
  public eventLog: GameEvent[] = [];
  public gameLog: GameEvent[] = [];
  
  // Promises system (legacy - being replaced by deals)
  public promises: Promise[] = [];
  
  // Deals & Alliances system
  public deals: Deal[] = [];
  public pendingNPCProposals: NPCProposal[] = [];

  constructor(
    houseguests: Houseguest[] = [],
    week: number = 1,
    phase: GamePhase = 'Initialization'
  ) {
    this.houseguests = houseguests;
    this.week = week;
    this.phase = phase;
    this.currentWeek = week;
  }

  // Methods to support GameSummary and systems
  public getHouseguestById(id: string): Houseguest | undefined {
    return this.houseguests.find(h => h.id === id);
  }

  // Delegate to utility functions
  public getActiveHouseguests(): Houseguest[] {
    return getActiveHouseguests(this);
  }

  public getEligibleVoters(): Houseguest[] {
    return getEligibleVoters(this);
  }

  public logEvent(
    eventType: string,
    description: string,
    involvedHouseguests: string[] = [],
    data?: Record<string, any>
  ): void {
    logGameEvent(this, eventType, description, involvedHouseguests, data);
  }

  public advancePhase(): GamePhase {
    return advancePhase(this);
  }

  public resetWeek(): void {
    resetWeek(this);
  }

  public advanceWeek(): void {
    advanceWeek(this);
  }

  public clone(): BigBrotherGame {
    return cloneGame(this);
  }

  public getGameSettings(): { finalWeek: number } {
    return getGameSettings();
  }

  public changeState(stateName: string): void {
    changeGameState(this, stateName);
  }
}
