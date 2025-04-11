
/**
 * @file models/game/types.ts
 * @description Type definitions for the Big Brother game
 */

import { Houseguest } from '../houseguest';
import { Alliance } from '../alliance';
import { GamePhase, GameEvent } from '../game-state';

// Re-export for backward compatibility
export type { GameEvent } from '../game-state';

export interface GameSettings {
  finalWeek: number;
}

// Rename this to avoid clash with the one in game-state.ts
export interface GameStateInterface {
  houseguests: Houseguest[];
  week: number;
  phase: GamePhase;
  hohWinner: string | null;
  povWinner: string | null;
  nominees: string[];
  evicted: Houseguest[];
  jury: Houseguest[];
  juryMembers: string[];
  winner: Houseguest | null;
  runnerUp: Houseguest | null;
  finalTwo: Houseguest[];
  currentWeek: number;
  relationshipSystem: any;
  competitionSystem: any;
  aiSystem: any;
  allianceSystem: any;
  currentState: any;
  currentLocation: string;
  eventLog: GameEvent[];
  gameLog: GameEvent[];
}

// This is the actual GameState type that BigBrotherGame implements
export type GameState = GameStateInterface;
