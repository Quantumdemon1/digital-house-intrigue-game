
/**
 * @file models/BigBrotherGame.ts
 * @description Big Brother Game state definition
 */

import { Houseguest, HouseguestStatus } from './houseguest';
import { Alliance } from './alliance';

// Game phases
import { GamePhase, GameEvent } from './game-state';

// Re-export for backward compatibility
export type { GameEvent } from './game-state'; 

export class BigBrotherGame {
  // Game configuration
  public houseguests: Houseguest[] = [];
  public week: number = 1;
  public phase: GamePhase = 'Initialization';

  // State tracking
  public hohWinner: string | null = null;
  public povWinner: string | null = null;
  public nominees: string[] = [];
  public evicted: Houseguest[] = [];
  public jury: Houseguest[] = [];
  public juryMembers: string[] = [];
  public winner: Houseguest | null = null;
  public runnerUp: Houseguest | null = null;
  public finalTwo: Houseguest[] = [];
  public currentWeek: number = 1;
  
  // Game systems
  public relationshipSystem: any = null;
  public competitionSystem: any = null;
  public aiSystem: any = null;
  public allianceSystem: any = null;
  
  // Game state management
  public currentState: any = null;
  public currentLocation: string = 'living-room';
  public openAllianceProposalUI: () => void = () => {};
  public game: BigBrotherGame = this; // Self-reference for compatibility

  // Event log
  public eventLog: GameEvent[] = [];
  public gameLog: GameEvent[] = [];

  // Methods to support GameSummary and systems
  public getHouseguestById(id: string): Houseguest | undefined {
    return this.houseguests.find(h => h.id === id);
  }

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
      const isHoh = this.hohWinner === h.id;
      const isNominated = this.nominees.includes(h.id);
      return !isHoh && !isNominated;
    });
  }

  /**
   * Log an event in the game
   */
  logEvent(
    eventType: string,
    description: string,
    involvedHouseguests: string[] = [],
    data?: Record<string, any>
  ): void {
    const event: GameEvent = {
      week: this.week,
      phase: this.phase,
      type: eventType,
      description,
      involvedHouseguests,
      timestamp: Date.now(),
      data
    };

    this.eventLog.push(event);
    this.gameLog.push(event); // Add to gameLog as well for compatibility
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
      this.currentWeek = this.week;
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
   * Advances the week
   */
  advanceWeek(): void {
    this.week += 1;
    this.currentWeek = this.week;
    this.resetWeek();
  }

  /**
   * Creates a new instance of the game with a copy of the current state
   */
  clone(): BigBrotherGame {
    const clonedGame = new BigBrotherGame();
    
    // Copy all properties
    clonedGame.houseguests = [...this.houseguests];
    clonedGame.week = this.week;
    clonedGame.currentWeek = this.week;
    clonedGame.phase = this.phase;
    clonedGame.hohWinner = this.hohWinner;
    clonedGame.povWinner = this.povWinner;
    clonedGame.nominees = [...this.nominees];
    clonedGame.evicted = [...this.evicted];
    clonedGame.jury = [...this.jury];
    clonedGame.winner = this.winner;
    clonedGame.runnerUp = this.runnerUp;
    clonedGame.eventLog = [...this.eventLog];
    clonedGame.gameLog = [...this.eventLog]; // Set gameLog from eventLog for compatibility
    clonedGame.finalTwo = [...(this.finalTwo || [])];
    
    return clonedGame;
  }

  // Utility method for game settings - used by game states
  getGameSettings(): { finalWeek: number } {
    return {
      finalWeek: 10 // Default final week number
    };
  }

  // Method for state transitions - used by game states
  changeState(stateName: string): void {
    console.log(`BigBrotherGame: changing state to ${stateName}`);
    // In a real implementation, this would instantiate the new state
  }
}
