/**
 * @file models/game/gameUtils.ts
 * @description Utility functions for the Big Brother game
 */

import { GameEvent, GamePhase } from '../game-state';
import { Houseguest } from '../houseguest';
import { BigBrotherGame } from './BigBrotherGame';

/**
 * Log an event in the game
 */
export function logGameEvent(
  game: BigBrotherGame,
  eventType: string,
  description: string,
  involvedHouseguests: string[] = [],
  data?: Record<string, any>
): void {
  const event: GameEvent = {
    week: game.week,
    phase: game.phase,
    type: eventType,
    description,
    involvedHouseguests,
    timestamp: Date.now(),
    data
  };

  game.eventLog.push(event);
  game.gameLog.push(event); // Add to gameLog as well for compatibility
}

/**
 * Advances the game to the next phase
 */
export function advancePhase(game: BigBrotherGame): GamePhase {
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
  const currentPhaseIndex = phaseOrder.indexOf(game.phase);
  
  // If it's the last phase, wrap around to the first phase & increment week
  if (currentPhaseIndex === phaseOrder.length - 1) {
    game.phase = phaseOrder[0];
    game.week += 1;
    game.currentWeek = game.week;
  } else {
    // Otherwise, advance to the next phase
    game.phase = phaseOrder[currentPhaseIndex + 1];
  }

  return game.phase;
}

/**
 * Reset competition flags for a new week
 */
export function resetWeek(game: BigBrotherGame): void {
  // Clear last week's competition results
  game.houseguests.forEach(houseguest => {
    houseguest.isHoH = false;
    houseguest.isPovHolder = false;
    houseguest.isNominated = false;
  });

  game.hohWinner = null;
  game.povWinner = null;
  game.nominees = [];

  logGameEvent(game, 'system', `Week ${game.week} has begun.`);
}

/**
 * Get all active houseguests
 */
export function getActiveHouseguests(game: BigBrotherGame): Houseguest[] {
  return game.houseguests.filter(h => h.status === 'Active');
}

/**
 * Get all available voters for eviction
 * (Everyone except HoH and nominees)
 */
export function getEligibleVoters(game: BigBrotherGame): Houseguest[] {
  return getActiveHouseguests(game).filter(h => {
    const isHoh = game.hohWinner === h.id;
    const isNominated = game.nominees.includes(h.id);
    return !isHoh && !isNominated;
  });
}
