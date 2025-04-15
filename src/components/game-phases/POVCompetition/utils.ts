
import { Houseguest } from '@/models/houseguest';

// Helper function to determine the winner
export const determineRandomWinner = (players: Houseguest[]): Houseguest => {
  // Simple random selection from povPlayers
  return players[Math.floor(Math.random() * players.length)];
};

// Helper to check if we have valid players for the competition
export const hasValidPlayers = (players: Houseguest[]): boolean => {
  return players && players.length > 0;
};
