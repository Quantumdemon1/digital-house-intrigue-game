
import { useCallback } from 'react';
import { GameState } from '../../models/game-state';
import { Houseguest } from '../../models/houseguest';

export const useGameHelpers = (gameState: GameState) => {
  // Helper function to get a houseguest by ID
  const getHouseguestById = useCallback((id: string) => {
    return gameState.houseguests.find(guest => guest.id === id);
  }, [gameState.houseguests]);
  
  // Helper function to get the relationship score between two houseguests
  const getRelationship = useCallback((guest1Id: string, guest2Id: string) => {
    const guest1Map = gameState.relationships.get(guest1Id);
    if (!guest1Map) return 0;
    
    const relationship = guest1Map.get(guest2Id);
    return relationship?.score || 0;
  }, [gameState.relationships]);
  
  // Helper function to get all active houseguests
  const getActiveHouseguests = useCallback(() => {
    return gameState.houseguests.filter(guest => guest.status === 'Active');
  }, [gameState.houseguests]);
  
  // Helper function to get random nominees
  const getRandomNominees = useCallback((count: number = 2, excludeIds: string[] = []) => {
    const eligibleHouseguests = gameState.houseguests.filter(
      guest => guest.status === 'Active' && !excludeIds.includes(guest.id)
    );
    
    // Shuffle array and take the first 'count' elements
    return [...eligibleHouseguests]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }, [gameState.houseguests]);
  
  return {
    getHouseguestById,
    getRelationship,
    getActiveHouseguests,
    getRandomNominees
  };
};
