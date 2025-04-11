
import { useState, useMemo, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';

export const useNominationCeremony = () => {
    const { gameState, dispatch, logger } = useGame();

    // Local state for UI selection only
    const [selectedNomineesUI, setSelectedNomineesUI] = useState<Houseguest[]>([]);

    // Derive state from the central game instance
    const hoh = useMemo(() => {
        return gameState.hohWinner;
    }, [gameState.hohWinner]);
    
    const { getActiveHouseguests } = useGame();
    const activeHouseguests = getActiveHouseguests();
    
    // Filter out the HoH from potential nominees
    const potentialNominees = useMemo(() => {
        return activeHouseguests.filter(houseguest => houseguest.id !== hoh?.id);
    }, [activeHouseguests, hoh]);
    
    const isPlayerHoh = hoh?.isPlayer ?? false;

    // Determine if the ceremony is complete based on game state
    const ceremonyComplete = useMemo(() => {
        if (!gameState) return false;
        // Check if nominees have been selected in the game state
        return gameState.nominees.length === 2;
    }, [gameState]);

    const isNominating = useMemo(() => {
        // Logic to determine if we are in nomination phase and nominations are not yet complete
        return gameState.phase === 'Nomination' && !ceremonyComplete;
    }, [gameState.phase, ceremonyComplete]);

    // Handle UI selection toggle
    const toggleNominee = (houseguest: Houseguest) => {
        if (ceremonyComplete) return;
        
        setSelectedNomineesUI(prev => {
            if (prev.some(nominee => nominee.id === houseguest.id)) {
                return prev.filter(nominee => nominee.id !== houseguest.id);
            } else if (prev.length < 2) {
                return [...prev, houseguest];
            }
            return prev;
        });
    };

    // Dispatch action to confirm nominations
    const confirmNominations = useCallback(() => {
        if (selectedNomineesUI.length !== 2) return;
        
        // Log the action being dispatched
        logger.info(`Player Action: Confirming nominations for ${selectedNomineesUI.map(n => n.name).join(' and ')}`);
        
        dispatch({
            type: 'PLAYER_ACTION',
            payload: {
                actionId: 'make_nominations',
                params: {
                    nomineeIds: selectedNomineesUI.map(nominee => nominee.id)
                }
            }
        });
        
        // Directly set nominees for immediate UI feedback
        // This may be overridden by the state machine later
        dispatch({
            type: 'SET_NOMINEES',
            payload: selectedNomineesUI
        });
        
    }, [selectedNomineesUI, dispatch, logger]);

    // Handle time expiry with random nominees
    const handleTimeExpired = useCallback(() => {
        if (ceremonyComplete || !isNominating) return;
        
        // Get the function from outside the component
        const getRandomNominees = useGame().getRandomNominees;
        const randomNominees = getRandomNominees(2, [hoh?.id || '']);
        
        logger.info('Nomination timer expired, selecting random nominees');
        
        setSelectedNomineesUI(randomNominees);
        
        setTimeout(() => {
            dispatch({
                type: 'PLAYER_ACTION',
                payload: {
                    actionId: 'make_nominations',
                    params: {
                        nomineeIds: randomNominees.map(nominee => nominee.id),
                        isAutomatic: true
                    }
                }
            });
            
            // Directly set nominees for immediate UI feedback
            dispatch({
                type: 'SET_NOMINEES',
                payload: randomNominees
            });
        }, 1000);
    }, [ceremonyComplete, isNominating, dispatch, hoh, logger]);

    return {
        nominees: selectedNomineesUI,
        setNominees: setSelectedNomineesUI,
        isNominating,
        ceremonyComplete,
        potentialNominees,
        toggleNominee,
        confirmNominations,
        gameState,
        hoh,
        handleTimeExpired,
        getRelationship: useGame().getRelationship
    };
};
