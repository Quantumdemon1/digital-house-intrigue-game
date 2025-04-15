// This file is simplified as most helpers are directly in GameContext
// Keeping it as a module with empty export for potential future complex helper logic

import { useGame } from '../game';

export const useGameHelpers = () => {
  const {
    getHouseguestById,
    getRelationship,
    getActiveHouseguests,
    getRandomNominees
  } = useGame();

  return {
    getHouseguestById,
    getRelationship,
    getActiveHouseguests,
    getRandomNominees
  };
};

export default useGameHelpers;
