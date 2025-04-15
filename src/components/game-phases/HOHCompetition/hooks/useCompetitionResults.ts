
import { useToast } from '@/components/ui/use-toast';
import { useGame } from '@/contexts/GameContext';
import { CompetitionType, Houseguest } from '@/models/houseguest';

/**
 * Hook for handling competition results
 */
export const useCompetitionResults = () => {
  const { gameState, dispatch, logger } = useGame();
  const { toast } = useToast();
  
  /**
   * Process competition results and update the game state
   */
  const processResults = (
    competitionWinner: Houseguest,
    activeHouseguests: Houseguest[]
  ) => {
    logger?.info(`Competition winner selected: ${competitionWinner.name}`);

    // Generate random results
    const positions = activeHouseguests.map(guest => ({
      name: guest.name,
      id: guest.id,
      position: Math.random() // random value for sorting
    })).sort((a, b) => a.position - b.position).map((guest, index) => ({
      name: guest.name,
      id: guest.id,
      position: index + 1
    }));

    // Make sure the winner is in first place
    const winnerIndex = positions.findIndex(p => p.id === competitionWinner.id);
    if (winnerIndex > 0) {
      const temp = positions[0];
      positions[0] = positions[winnerIndex];
      positions[winnerIndex] = temp;
    }
    
    logger?.info("Setting competition results for display");
    
    // Update game state with new HoH
    logger?.info(`Dispatching SET_HOH action for ${competitionWinner.name}`);
    dispatch({
      type: 'SET_HOH',
      payload: competitionWinner
    });

    // Log the event
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: 'HoH',
        type: 'COMPETITION',
        description: `${competitionWinner.name} won the Head of Household competition.`,
        involvedHouseguests: [competitionWinner.id]
      }
    });

    // Show toast
    toast({
      title: "HoH Competition Results",
      description: `${competitionWinner.name} is the new Head of Household!`,
    });
    
    return positions;
  };
  
  return { processResults };
};
