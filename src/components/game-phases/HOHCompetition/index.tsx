
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { selectRandomWinner, competitionTypes } from './utils';
import CompetitionInitial from './CompetitionInitial';
import CompetitionInProgress from './CompetitionInProgress';
import CompetitionResults from './CompetitionResults';

const HOHCompetition: React.FC = () => {
  const {
    gameState,
    dispatch,
    getActiveHouseguests,
    game,
    logger
  } = useGame();
  const { toast } = useToast();
  
  const [competitionType, setCompetitionType] = useState<CompetitionType | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [results, setResults] = useState<{
    name: string;
    position: number;
    id: string;
  }[]>([]);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const activeHouseguests = getActiveHouseguests();
  
  // Log crucial information on component mount and state changes
  useEffect(() => {
    logger?.info(`HOHCompetition component state:`, {
      phase: gameState.phase,
      activeHouseguests: activeHouseguests.length,
      isCompeting,
      winner: winner?.name || "none",
      competitionType,
      gamePhase: game?.phase || "unknown"
    });
  }, [gameState.phase, activeHouseguests.length, isCompeting, winner, competitionType, logger, game?.phase]);
  
  useEffect(() => {
    // Only start if we're in the HoH phase and there's no competition in progress
    if (gameState.phase === 'HoH' && !isCompeting && !winner && activeHouseguests.length > 0) {
      logger?.info("Setting up competition start timeout");
      
      const timer = setTimeout(() => {
        logger?.info("Starting competition after delay");
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        logger?.info(`Selected competition type: ${randomType}`);
        startCompetition(randomType);
      }, 2000); // Increased from 1000 to 2000 for better visibility
      
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, activeHouseguests.length, isCompeting, winner, logger]);
  
  // Function to safely advance to the nomination phase
  const advanceToNomination = () => {
    logger?.info("Attempting to advance to nomination phase with multiple methods");
    
    // Method 1: Use dispatch to update the game state phase
    dispatch({
      type: 'SET_PHASE',
      payload: 'Nomination'
    });
    
    // Method 2: Try using game.changeState if available
    if (game) {
      logger?.info("Using game.changeState method to change state to NominationState");
      try {
        game.changeState('NominationState');
        logger?.info("Successfully called game.changeState('NominationState')");
      } catch (error) {
        logger?.error("Error changing game state:", error);
        
        // Method 3: As a last resort, set phase directly
        logger?.info("Attempting fallback: setting phase directly");
        if ('phase' in game) {
          game.phase = 'Nomination';
          logger?.info("Set game phase directly to Nomination");
        } else {
          logger?.error("Cannot set game phase directly, property not found");
        }
      }
    } else {
      logger?.warn("Game object not available for state transition");
    }
    
    // Method 4: Additional dispatch for the game engine
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_nominations',
        params: {}
      }
    });
  };
  
  const startCompetition = (type: CompetitionType) => {
    if (isCompeting) {
      logger?.info("Competition already in progress, ignoring start request");
      return;
    }
    
    logger?.info(`Starting ${type} competition...`);
    setCompetitionType(type);
    setIsCompeting(true);

    // Simulate the competition running
    setTimeout(() => {
      logger?.info("Competition completed, determining winner");
      // Verify we have houseguests before determining a winner
      if (activeHouseguests.length === 0) {
        logger?.error('No active houseguests available for competition');
        setIsCompeting(false);
        return;
      }
      
      // Determine the winner (weighted random based on stats)
      const competitionWinner = selectRandomWinner(activeHouseguests, type);
      
      if (!competitionWinner) {
        logger?.error('Failed to select a competition winner');
        setIsCompeting(false);
        return;
      }

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
      setResults(positions);
      setWinner(competitionWinner);

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
          description: `${competitionWinner.name} won the ${type} Head of Household competition.`,
          involvedHouseguests: [competitionWinner.id]
        }
      });

      // Show toast
      toast({
        title: "HoH Competition Results",
        description: `${competitionWinner.name} is the new Head of Household!`,
      });

      // Continue to nomination phase after a delay
      logger?.info("Scheduling transition to nomination phase");
      setTimeout(() => {
        logger?.info("Attempting to advance to nomination phase now");
        advanceToNomination();
      }, 4000); // 4 second delay before moving to nominations
    }, 3000); // Increased to show the competition in progress for 3 seconds
  };

  // Show the appropriate component based on the competition state
  if (winner) {
    return <CompetitionResults competitionType={competitionType} winner={winner} results={results} />;
  }
  
  if (isCompeting) {
    return <CompetitionInProgress competitionType={competitionType} />;
  }
  
  return <CompetitionInitial gameWeek={gameState.week} activeHouseguests={activeHouseguests} />;
};

export default HOHCompetition;
