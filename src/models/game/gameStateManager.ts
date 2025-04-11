
/**
 * @file models/game/gameStateManager.ts
 * @description Game state management functions
 */

import { BigBrotherGame } from './BigBrotherGame';
import { resetWeek } from './gameUtils';

/**
 * Advances the week
 */
export function advanceWeek(game: BigBrotherGame): void {
  game.week += 1;
  game.currentWeek = game.week;
  resetWeek(game);
}

/**
 * Utility method for game settings - used by game states
 */
export function getGameSettings(): { finalWeek: number } {
  return {
    finalWeek: 10 // Default final week number
  };
}

/**
 * Method for state transitions - used by game states
 */
export function changeGameState(game: BigBrotherGame, stateName: string): void {
  console.log(`BigBrotherGame: changing state to ${stateName}`);
  // In a real implementation, this would instantiate the new state
}

/**
 * Creates a new instance of the game with a copy of the current state
 */
export function cloneGame(game: BigBrotherGame): BigBrotherGame {
  const clonedGame = new BigBrotherGame();
  
  // Copy all properties
  clonedGame.houseguests = [...game.houseguests];
  clonedGame.week = game.week;
  clonedGame.currentWeek = game.week;
  clonedGame.phase = game.phase;
  clonedGame.hohWinner = game.hohWinner;
  clonedGame.povWinner = game.povWinner;
  clonedGame.nominees = [...game.nominees];
  clonedGame.evicted = [...game.evicted];
  clonedGame.jury = [...game.jury];
  clonedGame.winner = game.winner;
  clonedGame.runnerUp = game.runnerUp;
  clonedGame.eventLog = [...game.eventLog];
  clonedGame.gameLog = [...game.eventLog]; // Set gameLog from eventLog for compatibility
  clonedGame.finalTwo = [...(game.finalTwo || [])];
  
  return clonedGame;
}
