/**
 * @file models/BigBrotherGame.ts
 * @description Big Brother Game state definition
 */

import { Houseguest, HouseguestStatus } from './houseguest';
import { Alliance } from './alliance';

// Game phases
import { GamePhase } from './game-state';

// Game event interface (now exported)
export interface GameEvent {
  week: number;
  phase: GamePhase;
  type: string;
  description: string;
  involvedHouseguests: string[];
  timestamp: number;
}

export class BigBrotherGame {
  // Game configuration
  public houseguests: Houseguest[] = [];
  public week: number = 1;
  public phase: GamePhase = 'Initialization';

  // State tracking
  public hohWinner: Houseguest | null = null;
  public povWinner: Houseguest | null = null;
  public nominees: Houseguest[] = [];
  public evicted: Houseguest[] = [];
  public jury: Houseguest[] = [];
  public winner: Houseguest | null = null;
  public runnerUp: Houseguest | null = null;
  public finalTwo: Houseguest[] = [];

  // Event log
  public eventLog: GameEvent[] = [];

  constructor(
    houseguests: Houseguest[] = [],
    week: number = 1,
    phase: GamePhase = 'Initialization'
  ) {
    this.houseguests = houseguests;
    this.week = week;
    this.phase = phase;
  }

  /**
   * Get all active houseguests
   */
  getActiveHouseguests(): Houseguest[] {
    return this.houseguests.filter(h => h.status === 'Active');
  }

  /**
   * Get all available voters for eviction
   * (Everyone except HoH and nominees)
   */
  getEligibleVoters(): Houseguest[] {
    return this.getActiveHouseguests().filter(h => {
      return !h.isHoH && !h.isNominated;
    });
  }

  /**
   * Log an event in the game
   */
  logEvent(
    eventType: string,
    description: string,
    involvedHouseguests: string[] = []
  ): void {
    const event: GameEvent = {
      week: this.week,
      phase: this.phase,
      type: eventType,
      description,
      involvedHouseguests,
      timestamp: Date.now(),
    };

    this.eventLog.push(event);
  }

  /**
   * Advances the game to the next phase
   */
  advancePhase(): GamePhase {
    // Define the phase order
    const phaseOrder: GamePhase[] = [
      'Initialization',
      'HOH Competition',
      'Nomination',
      'POV Competition',
      'POV Meeting',
      'Eviction',
      'Finale',
    ];

    // Find the current phase index
    const currentPhaseIndex = phaseOrder.indexOf(this.phase);
    
    // If it's the last phase, wrap around to the first phase & increment week
    if (currentPhaseIndex === phaseOrder.length - 1) {
      this.phase = phaseOrder[0];
      this.week += 1;
    } else {
      // Otherwise, advance to the next phase
      this.phase = phaseOrder[currentPhaseIndex + 1];
    }

    return this.phase;
  }

  /**
   * Reset competition flags for a new week
   */
  resetWeek(): void {
    // Clear last week's competition results
    this.houseguests.forEach(houseguest => {
      houseguest.isHoH = false;
      houseguest.isPovHolder = false;
      houseguest.isNominated = false;
    });

    this.hohWinner = null;
    this.povWinner = null;
    this.nominees = [];

    this.logEvent('system', `Week ${this.week} has begun.`);
  }

  /**
   * Creates a new instance of the game with a copy of the current state
   */
  clone(): BigBrotherGame {
    const clonedGame = new BigBrotherGame();
    
    // Copy all properties
    clonedGame.houseguests = [...this.houseguests];
    clonedGame.week = this.week;
    clonedGame.phase = this.phase;
    clonedGame.hohWinner = this.hohWinner;
    clonedGame.povWinner = this.povWinner;
    clonedGame.nominees = [...this.nominees];
    clonedGame.evicted = [...this.evicted];
    clonedGame.jury = [...this.jury];
    clonedGame.winner = this.winner;
    clonedGame.runnerUp = this.runnerUp;
    clonedGame.eventLog = [...this.eventLog];
    clonedGame.finalTwo = [...(this.finalTwo || [])];
    
    return clonedGame;
  }
}
