
import { useRef, useCallback } from 'react';
import { BigBrotherGame } from '../../../models/game/BigBrotherGame';
import { RelationshipSystem } from '../../../systems/relationship';
import { CompetitionSystem } from '../../../systems/competition-system';
import { AIIntegrationSystem } from '../../../systems/ai-integration';
import { DealSystem } from '../../../systems/deal-system';
import { Logger } from '../../../utils/logger';
import { GameState } from '../../../models/game-state';

export function useSystems(gameState: GameState) {
  const gameRef = useRef<BigBrotherGame | null>(null);
  const relationshipSystemRef = useRef<RelationshipSystem | null>(null);
  const competitionSystemRef = useRef<CompetitionSystem | null>(null);
  const aiSystemRef = useRef<AIIntegrationSystem | null>(null);
  const promiseSystemRef = useRef<any>(null);
  const dealSystemRef = useRef<DealSystem | null>(null);
  const recapGeneratorRef = useRef<any>(null);
  const loggerRef = useRef<Logger | null>(null);
  
  const initializeGameSystems = useCallback(() => {
    loggerRef.current = new Logger();
    relationshipSystemRef.current = new RelationshipSystem(loggerRef.current);
    competitionSystemRef.current = new CompetitionSystem(loggerRef.current);
    // Pass the logger as first parameter and an empty string as the API key for now
    aiSystemRef.current = new AIIntegrationSystem(loggerRef.current, "");
    dealSystemRef.current = new DealSystem(loggerRef.current);
    promiseSystemRef.current = {};
    recapGeneratorRef.current = {};
  }, []);
  
  const initializeGame = useCallback(() => {
    if (!relationshipSystemRef.current || !competitionSystemRef.current || 
        !aiSystemRef.current || !loggerRef.current) {
      console.error('Game systems not initialized');
      return;
    }
    
    gameRef.current = new BigBrotherGame(
      gameState.houseguests,
      gameState.week,
      gameState.phase
    );
  }, [gameState]);

  return {
    gameRef,
    relationshipSystemRef,
    competitionSystemRef,
    aiSystemRef,
    promiseSystemRef,
    dealSystemRef,
    recapGeneratorRef,
    loggerRef,
    initializeGameSystems,
    initializeGame
  };
}
