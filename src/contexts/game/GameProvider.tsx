import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useRelationshipImpact } from '../RelationshipImpactContext';
import { BigBrotherGame } from '../../models/game/BigBrotherGame';
import { initialGameState } from '../../models/game-state';
import { GameAction } from '../types/game-context-types';
import { GameContext } from './GameContext';
import { useSystems } from './hooks/useSystems';
import { useGameReducer } from './hooks/useGameReducer';
import { useSaveLoadFunctions } from './hooks/useSaveLoadFunctions';

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const relationshipImpact = useRelationshipImpact();
  const [loading, setLoading] = useState(true);
  
  const { gameState, dispatch } = useGameReducer();
  const { 
    loggerRef,
    gameRef, 
    relationshipSystemRef, 
    competitionSystemRef, 
    aiSystemRef, 
    promiseSystemRef, 
    recapGeneratorRef,
    initializeGameSystems,
    initializeGame
  } = useSystems(gameState);
  
  const {
    saveGame,
    loadGame,
    deleteSavedGame,
    getSavedGames
  } = useSaveLoadFunctions(user, gameState);
  
  useEffect(() => {
    initializeGameSystems();
    initializeGame();
    setLoading(false);
    
    const isAuthBypass = localStorage.getItem('bypass-auth') === 'true';
    if (!user && !isAuthBypass && window.location.pathname === '/game') {
      navigate('/');
    }
  }, [initializeGameSystems, initializeGame, user, navigate]);
  
  useEffect(() => {
    if (!loading && gameState.phase === 'Setup' && window.location.pathname === '/game') {
      navigate('/setup');
    }
  }, [loading, gameState.phase, navigate]);
  
  const game = useMemo(() => gameRef.current, []);
  const relationshipSystem = useMemo(() => relationshipSystemRef.current!, []);
  const competitionSystem = useMemo(() => competitionSystemRef.current!, []);
  const aiSystem = useMemo(() => aiSystemRef.current!, []);
  const promiseSystem = useMemo(() => promiseSystemRef.current!, []);
  const recapGenerator = useMemo(() => recapGeneratorRef.current!, []);
  const logger = useMemo(() => loggerRef.current!, []);
  
  const getHouseguestById = useCallback((id: string) => {
    return game?.getHouseguestById(id);
  }, [game]);
  
  const getRelationship = useCallback((guest1Id: string, guest2Id: string) => {
    return relationshipSystem?.getRelationship(guest1Id, guest2Id) || 0;
  }, [relationshipSystem]);
  
  const getActiveHouseguests = useCallback(() => {
    return game?.getActiveHouseguests() || [];
  }, [game]);
  
  const getRandomNominees = useCallback((count: number = 2, excludeIds: string[] = []) => {
    const activeHouseguests = getActiveHouseguests();
    const eligibleHouseguests = activeHouseguests.filter(hg => !excludeIds.includes(hg.id));
    
    const shuffled = [...eligibleHouseguests].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }, [getActiveHouseguests]);
  
  const getGameStatus = useCallback(() => {
    const hohId = game?.hohWinner || null;
    const hohHouseguest = hohId ? game?.getHouseguestById(hohId) : null;
    const povId = game?.povWinner || null;
    const povHouseguest = povId ? game?.getHouseguestById(povId) : null;
    
    return {
      week: game?.week || 0,
      phase: game?.phase || 'Setup',
      hoh: hohHouseguest || null,
      nominees: game?.nominees?.join(', ') || '',
      povHolder: povHouseguest || null,
    };
  }, [game]);
  
  const showToast = useCallback((title: string, options: { description?: string; variant?: 'success' | 'error' | 'info' | 'warning'; duration?: number } = {}) => {
    toast(title, options);
  }, []);

  const contextValue = {
    game,
    gameState,
    relationshipSystem,
    competitionSystem,
    aiSystem,
    promiseSystem,
    recapGenerator,
    logger,
    dispatch,
    getHouseguestById,
    getRelationship,
    getActiveHouseguests,
    getRandomNominees,
    getGameStatus,
    showToast,
    loading,
    saveGame,
    loadGame,
    deleteSavedGame,
    getSavedGames
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
