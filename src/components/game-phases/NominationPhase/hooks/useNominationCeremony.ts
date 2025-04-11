import { useState, useMemo, useCallback, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';

export const useNominationCeremony = () => {
    const { gameState, dispatch, logger, getActiveHouseguests, getRelationship, getRandomNominees } = useGame();

    // Local state for UI selection only
    const [selectedNomineesUI, setSelectedNomineesUI] = useState<Houseguest[]>([]);
    const [localCeremonyComplete, setLocalCeremonyComplete] = useState(false);

    // Derive state from the central game instance
    const hoh = useMemo(() => {
        const hohId = gameState.hohWinner?.id;
        return hohId ? gameState.houseguests.find(h => h.id === hohId) || null : null;
    }, [gameState.hohWinner, gameState.houseguests]);
    
    const activeHouseguests = getActiveHouseguests();
    
    // Filter out the HoH from potential nominees
    const potentialNominees = useMemo(() => {
        return activeHouseguests.filter(houseguest => houseguest.id !== hoh?.id);
    }, [activeHouseguests, hoh]);

    // Determine if the ceremony is complete based on game state
    const ceremonyComplete = useMemo(() => {
        // Check both local state and game state
        return localCeremonyComplete || gameState.nominees.length === 2;
    }, [localCeremonyComplete, gameState.nominees]);

    // Keep UI nominees synced with game state when it updates
    useEffect(() => {
        if (gameState.nominees.length === 2) {
            const nomineeObjects = gameState.nominees.map(
                nomineeId => gameState.houseguests.find(h => h.id === nomineeId.id)
            ).filter(Boolean) as Houseguest[];
            
            if (nomineeObjects.length === 2) {
                setSelectedNomineesUI(nomineeObjects);
                setLocalCeremonyComplete(true);
            }
        }
    }, [gameState.nominees, gameState.houseguests]);

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
        
        // Directly set local ceremony completion state
        setLocalCeremonyComplete(true);
        
        // Dispatch a player action to make nominations
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
        dispatch({
            type: 'SET_NOMINEES',
            payload: selectedNomineesUI
        });
        
    }, [selectedNomineesUI, dispatch, logger]);

    // Handle time expiry with random nominees
    const handleTimeExpired = useCallback(() => {
        if (ceremonyComplete || !isNominating) return;
        
        // Get random nominees using the function from context
        const randomNominees = getRandomNominees(2, [hoh?.id || '']);
        
        logger.info('Nomination timer expired, selecting random nominees');
        
        setSelectedNomineesUI(randomNominees);
        setLocalCeremonyComplete(true);
        
        // Don't wait, immediately make nominations
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
    }, [ceremonyComplete, isNominating, dispatch, hoh, logger, getRandomNominees]);

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
        getRelationship
    };
};
