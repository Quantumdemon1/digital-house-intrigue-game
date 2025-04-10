
import React, { createContext, useContext, useReducer, useRef, useEffect, useState, useCallback, useMemo } from 'react';

// Import Core Classes & Types
import { BigBrotherGame } from '../models/BigBrotherGame';
import { Houseguest } from '../models/houseguest';
import { RelationshipSystem } from '../systems/relationship-system';
import { CompetitionSystem } from '../systems/competition-system';
import { AIIntegrationSystem } from '../systems/ai-integration';
import { GameRecapGenerator } from '../utils/recap';
import { Logger, LogLevel } from '../utils/logger';
import * as GameStates from '../game-states';
import { GameAction, GameContextType } from './types/game-context-types';
import { IGameControllerFacade, IUIManagerFacade } from '../types/interfaces';

// Create the context
const GameContext = createContext<GameContextType | null>(null);

// --- Main Reducer ---
// Manages the top-level state, primarily the gameInstance reference
function gameReducer(state: GameContextType, action: GameAction): GameContextType {
    const { logger } = state;
    logger.debug(`Reducer Action: ${action.type}`, action.type === 'PLAYER_ACTION' ? action.payload.actionId : '');

    switch (action.type) {
        case 'START_NEW_GAME_INSTANCE':
        case 'LOAD_GAME_INSTANCE':
            // Replace the entire game instance
            return { ...state, game: action.payload.gameInstance };

        case 'TOGGLE_PAUSE':
            logger.warn("TOGGLE_PAUSE action received but pause state needs to be managed in Provider's useState.");
            return state;

        case 'FORCE_REFRESH':
            logger.debug("Forcing context refresh.");
            return { ...state };

        case 'SHOW_NARRATOR_MESSAGE':
        case 'SHOW_DIALOGUE':
            logger.warn(`UI Update action '${action.type}' received in reducer - ideally UI reads from game log/state.`);
            return state;

        default:
            if (action.type !== 'PLAYER_ACTION' && action.type !== 'SAVE_GAME_REQUEST' 
                && action.type !== 'LOAD_GAME_REQUEST' && action.type !== 'INITIALIZE_GAME') {
                logger.warn(`Unhandled action type in main reducer: ${action.type}`);
            }
            return state;
    }
}

// --- Provider Component ---
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- Instantiate Systems (runs once) ---
    const loggerRef = useRef(new Logger({ logLevel: LogLevel.INFO }));
    const systemsRef = useRef({
        relationshipSystem: new RelationshipSystem(loggerRef.current),
        competitionSystem: new CompetitionSystem(loggerRef.current),
        aiSystem: new AIIntegrationSystem(loggerRef.current),
        recapGenerator: new GameRecapGenerator(),
    });

    // --- State Management ---
    const [gameInstance, setGameInstance] = useState<BigBrotherGame | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingAction, setIsProcessingAction] = useState(false);

    // --- UI Manager Facade ---
    const uiManagerFacade = useMemo<IUIManagerFacade>(() => ({
        displayNarratorMessage: (message: string) => {
            loggerRef.current.info(`[UI FACADE (Narrator)] ${message}`);
        },
        displayDialogue: (speakerName: string, text: string, mood?: string) => {
            loggerRef.current.info(`[UI FACADE (Dialogue)] ${speakerName}: ${text}`);
        },
        showChoices: async (choices: any[]) => {
            loggerRef.current.warn("[UI FACADE] showChoices called - UI component should handle choice presentation");
            return null;
        },
        updateStatus: (statusData: any) => {
            // UI components should directly use gameInstance data
        },
        initializePortraits: (houseguests: Houseguest[]) => {
            loggerRef.current.debug("[UI FACADE] initializePortraits called");
        },
        highlightSpeaker: (speakerName: string) => {
            loggerRef.current.debug(`[UI FACADE] highlightSpeaker: ${speakerName}`);
        },
        updateLocationBackground: (locationId: string) => {
            loggerRef.current.debug(`[UI FACADE] updateLocationBackground: ${locationId}`);
        },
        showEventScreen: (screenType: string, data: any) => {
            loggerRef.current.info(`[UI FACADE] showEventScreen: ${screenType}`);
        },
        hideAllEventScreens: () => {
            loggerRef.current.debug("[UI FACADE] hideAllEventScreens");
        },
        presentCompetitionChallenge: async (challengeData: any): Promise<number> => {
            loggerRef.current.warn("[UI FACADE] presentCompetitionChallenge");
            return 5; // Default difficulty
        },
        updateGameLog: (eventLog: any[]) => {
            // GameEventLog component reads directly from gameInstance.eventLog
        },
        showRecapScreen: (recapText: string) => {
            loggerRef.current.info("[UI FACADE] showRecapScreen");
        },
        showLocationChoices: async (availableActions: any[]) => {
            loggerRef.current.warn("[UI FACADE] showLocationChoices called");
            return null;
        }
    }), []);

    // --- Game Controller Facade ---
    const gameControllerFacade = useRef<IGameControllerFacade>({
        game: null, // Will be set when game instance is created
        transitionTo: async (StateType: typeof GameStates.GameStateBase) => {
            loggerRef.current.info(`Facade: Requesting transition to ${StateType.name}`);
            if (!gameInstance) { 
                loggerRef.current.error("Cannot transition, game instance is null."); 
                return; 
            }
            if (isProcessingAction) { 
                loggerRef.current.warn("Transition blocked: Action processing."); 
                return; 
            }

            try {
                await gameInstance.currentState?.exit?.();
                const newState = new StateType(gameControllerFacade.current);
                gameInstance.currentState = newState;
                await newState.enter();
                
                setGameInstance({...gameInstance}); // Trigger re-render with new state reference
                dispatch({ type: 'FORCE_REFRESH' });
            } catch (error: any) {
                loggerRef.current.error(`Error during game.transitionTo: ${error.message}`);
            }
        },
        getGameStatus: () => {
            const game = gameInstance;
            const phase = game?.currentState?.constructor?.name?.replace('State', '') || 'Unknown';
            const hohId = game?.hohWinner;
            const hohName = hohId ? game?.getHouseguestById(hohId)?.name : null;
            const nomineeNames = game?.nominees.map(id => game?.getHouseguestById(id)?.name).filter(Boolean).join(', ') || 'N/A';
            const povId = game?.povWinner;
            const povName = povId ? game?.getHouseguestById(povId)?.name : null;
            
            return {
                week: game?.week ?? 0,
                phase: phase,
                hoh: hohName || 'N/A',
                nominees: nomineeNames,
                povHolder: povName || 'N/A'
            };
        },
        handlePlayerAction: async (actionId: string, params: any): Promise<boolean> => {
            loggerRef.current.debug(`Facade: Routing player action ${actionId} to game state.`);
            if (isProcessingAction) { 
                loggerRef.current.warn("Action blocked: Already processing."); 
                return false; 
            }
            if (!gameInstance?.currentState?.handleAction) { 
                loggerRef.current.error("Cannot handle action, no current state/method."); 
                return false; 
            }

            setIsProcessingAction(true);
            let handled = false;
            try {
                handled = await gameInstance.currentState.handleAction(actionId, params);
                setGameInstance({...gameInstance}); // Update reference
                dispatch({ type: 'FORCE_REFRESH' });
            } catch(error: any) {
                loggerRef.current.error(`Error in state's handleAction (${actionId}): ${error.message}`);
            } finally {
                setIsProcessingAction(false);
            }
            return handled;
        },
        saveGame: async (): Promise<boolean> => {
            loggerRef.current.info("Facade: Save game requested.");
            if (!gameInstance) return false;
            try {
                const saveData = gameInstance.saveGame();
                localStorage.setItem('bbDigitalHouseSave_React', JSON.stringify(saveData));
                loggerRef.current.info("Game saved to localStorage.");
                uiManagerFacade.displayNarratorMessage("Game Saved!");
                return true;
            } catch (error: any) {
                loggerRef.current.error("Save game error:", error);
                uiManagerFacade.displayNarratorMessage(`Save failed: ${error.message}`);
                return false;
            }
        },
        loadGame: async (): Promise<boolean> => {
            loggerRef.current.info("Facade: Load game requested.");
            setIsLoading(true);
            try {
                const savedJson = localStorage.getItem('bbDigitalHouseSave_React');
                if (!savedJson) throw new Error("No save data found in localStorage.");
                const savedData = JSON.parse(savedJson);

                const newGame = new BigBrotherGame(
                    savedData.houseguests.find((h: any) => h.isPlayer)?.name || 'Player',
                    {
                        relationshipSystem: systemsRef.current.relationshipSystem,
                        competitionSystem: systemsRef.current.competitionSystem,
                        aiSystem: systemsRef.current.aiSystem,
                        logger: loggerRef.current,
                        gameController: gameControllerFacade.current,
                        uiManager: uiManagerFacade
                    }
                );
                
                newGame.loadGame(savedData);
                await newGame.restoreState(gameControllerFacade.current, savedData.currentStateName);
                
                setGameInstance(newGame);
                gameControllerFacade.current.game = newGame;
                dispatch({ type: 'FORCE_REFRESH' });
                
                loggerRef.current.info("Game loaded successfully.");
                uiManagerFacade.displayNarratorMessage("Game Loaded.");
                setIsLoading(false);
                return true;
            } catch (error: any) {
                loggerRef.current.error("Load game error:", error);
                uiManagerFacade.displayNarratorMessage(`Load failed: ${error.message}. Starting new game.`);
                await initializeNewGame('Player');
                setIsLoading(false);
                return false;
            }
        },
        relationshipSystem: systemsRef.current.relationshipSystem,
        competitionSystem: systemsRef.current.competitionSystem,
        aiSystem: systemsRef.current.aiSystem,
        recapGenerator: systemsRef.current.recapGenerator,
        logger: loggerRef.current,
        uiManager: uiManagerFacade,
    }).current;

    // --- Initial State Setup & Reducer Hook ---
    const initialReducerState: GameContextType = {
        game: gameInstance,
        relationshipSystem: systemsRef.current.relationshipSystem,
        competitionSystem: systemsRef.current.competitionSystem,
        aiSystem: systemsRef.current.aiSystem,
        recapGenerator: systemsRef.current.recapGenerator,
        logger: loggerRef.current,
        dispatch: () => {}, // Placeholder
        getHouseguestById: () => undefined,
        getRelationship: () => 0,
        getActiveHouseguests: () => [],
        getRandomNominees: () => [],
        getGameStatus: () => ({ week: 0, phase: 'Loading', hoh: null, nominees: 'N/A', povHolder: null }),
    };
    
    const [reducerState, dispatch] = useReducer(gameReducer, initialReducerState);

    // --- Initialization Logic ---
    const initializeNewGame = useCallback(async (playerName: string) => {
        loggerRef.current.info(`Initializing new game instance for ${playerName}...`);
        setIsLoading(true);
        
        const newGame = new BigBrotherGame(playerName || 'Player', {
            relationshipSystem: systemsRef.current.relationshipSystem,
            competitionSystem: systemsRef.current.competitionSystem,
            aiSystem: systemsRef.current.aiSystem,
            logger: loggerRef.current,
            gameController: gameControllerFacade,
            uiManager: uiManagerFacade
        });
        
        try {
            gameControllerFacade.game = newGame;
            await newGame.start(gameControllerFacade);
            setGameInstance(newGame);
            dispatch({ type: 'FORCE_REFRESH' });
            loggerRef.current.info("New game started successfully.");
        } catch (error: any) {
            loggerRef.current.error(`Error starting new game: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [uiManagerFacade]);

    // Effect to initialize game on mount
    useEffect(() => {
        if (!gameInstance && !isLoading) {
            loggerRef.current.info("Provider mounted, waiting for setup or load action.");
            setIsLoading(false);
        } else if (gameInstance) {
            setIsLoading(false);
        }
    }, [gameInstance, isLoading]);

    // --- Action Handling outside Reducer ---
    const handleAction = useCallback(async (action: GameAction) => {
        switch (action.type) {
            case 'INITIALIZE_GAME':
                await initializeNewGame(action.payload.playerName);
                break;
            case 'SAVE_GAME_REQUEST':
                await gameControllerFacade.saveGame();
                break;
            case 'LOAD_GAME_REQUEST':
                await gameControllerFacade.loadGame();
                break;
            case 'TOGGLE_PAUSE':
                setIsPaused(prev => !prev);
                break;
            case 'PLAYER_ACTION':
                if (gameInstance && !isPaused && !isProcessingAction) {
                    await gameControllerFacade.handlePlayerAction(
                        action.payload.actionId, 
                        action.payload.params
                    );
                } else if (isPaused) {
                    loggerRef.current.warn("Player action ignored: Game paused.");
                } else if (isProcessingAction) {
                    loggerRef.current.warn("Player action ignored: Action processing.");
                }
                break;
            default:
                dispatch(action);
        }
    }, [initializeNewGame, gameInstance, isPaused, isProcessingAction]);

    // --- Context Value ---
    const contextValue = useMemo<GameContextType>(() => ({
        game: gameInstance,
        relationshipSystem: systemsRef.current.relationshipSystem,
        competitionSystem: systemsRef.current.competitionSystem,
        aiSystem: systemsRef.current.aiSystem,
        recapGenerator: systemsRef.current.recapGenerator,
        logger: loggerRef.current,
        dispatch: handleAction,
        getHouseguestById: (id: string) => gameInstance?.getHouseguestById(id),
        getActiveHouseguests: () => gameInstance?.getActiveHouseguests() || [],
        getRelationship: (g1: string, g2: string) => gameInstance?.relationshipSystem.getRelationship(g1, g2) ?? 0,
        getRandomNominees: (c=2, e=[]) => {
            const active = gameInstance?.getActiveHouseguests().filter(h => !e.includes(h.id)) || [];
            return active.sort(() => 0.5 - Math.random()).slice(0, c);
        },
        getGameStatus: () => gameControllerFacade.getGameStatus(),
    }), [gameInstance, handleAction]);

    return (
        <GameContext.Provider value={contextValue}>
            {isLoading ? <div className="text-center p-4">Loading Game...</div> : children}
        </GameContext.Provider>
    );
};

// Custom hook to use the game context
export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
