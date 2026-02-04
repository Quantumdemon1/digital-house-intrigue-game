
import { useToast } from '@/components/ui/use-toast';
import { useGame } from '@/contexts/GameContext';
import { Houseguest, CompetitionType } from '@/models/houseguest';
import { useRef } from 'react';

/**
 * Hook for handling competition results
 */
export const useCompetitionResults = () => {
  const { gameState, dispatch, logger } = useGame();
  const { toast } = useToast();
  const processingRef = useRef(false);
  
  /**
   * Process competition results and update the game state
   */
  const processResults = (
    competitionWinner: Houseguest,
    activeHouseguests: Houseguest[],
    competitionType?: CompetitionType
  ) => {
    if (processingRef.current) {
      logger?.warn("Already processing results, ignoring duplicate call");
      return [];
    }
    
    processingRef.current = true;
    logger?.info(`Competition winner selected: ${competitionWinner.name}`);

    // Generate score-based results instead of random
    const type = competitionType || 'mental';
    const scoredResults = activeHouseguests.map(guest => {
      let score = 1;
      
      switch (type) {
        case 'physical': score = guest.stats.physical; break;
        case 'mental': score = guest.stats.mental; break;
        case 'endurance': score = guest.stats.endurance; break;
        case 'social': score = guest.stats.social; break;
        case 'luck': score = guest.stats.luck + 5; break;
      }
      // Add randomness to make results more varied
      score *= (0.75 + Math.random() * 0.5);
      
      return { id: guest.id, name: guest.name, score };
    }).sort((a, b) => b.score - a.score);

    // Ensure the designated winner is at the top
    const winnerIdx = scoredResults.findIndex(r => r.id === competitionWinner.id);
    if (winnerIdx > 0) {
      [scoredResults[0], scoredResults[winnerIdx]] = [scoredResults[winnerIdx], scoredResults[0]];
    }

    // Convert to positions - winner guaranteed to have position: 1
    const positions = scoredResults.map((result, index) => ({
      name: result.name,
      id: result.id,
      position: index + 1
    }));
    
    logger?.info("Setting competition results for display");
    
    // Update game state with new HoH
    try {
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
    } catch (error) {
      logger?.error("Error updating game state with competition results:", error);
    } finally {
      processingRef.current = false;
    }
    
    return positions;
  };
  
  return { processResults };
};
