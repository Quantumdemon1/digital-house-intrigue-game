
import React, { useState, useEffect, useContext, createContext } from 'react';
import { useGame } from '@/contexts/GameContext';

// Create a context for player selection
interface PlayerSelectionContextType {
  selectedPlayers: string[];
  autoSelected: boolean;
  isMandatoryPlayer: (id: string) => boolean;
  handlePlayerToggle: (playerId: string, checked: boolean) => void;
  autoSelectRandom: () => void;
  continueToPov: () => void;
}

const PlayerSelectionContext = createContext<PlayerSelectionContextType | undefined>(undefined);

// Provider component
export const PlayerSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gameState, dispatch } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [autoSelected, setAutoSelected] = useState(false);
  
  // Get HoH and nominees - they must participate
  const hohId = gameState.hohWinner;
  const nominees = gameState.nominees || [];
  
  // Get all active houseguests
  const activeHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active');
  
  // Auto-select HoH and nominees on mount
  useEffect(() => {
    const mandatoryPlayers = [hohId, ...nominees].filter(Boolean);
    setSelectedPlayers(mandatoryPlayers);
  }, [hohId, nominees]);
  
  // Check if a player is mandatory (HoH or nominee)
  const isMandatoryPlayer = (id: string) => {
    return id === hohId || nominees.includes(id);
  };
  
  // Handle checkbox change
  const handlePlayerToggle = (playerId: string, checked: boolean) => {
    if (checked) {
      // Don't exceed 6 players
      if (selectedPlayers.length >= 6) {
        return;
      }
      setSelectedPlayers([...selectedPlayers, playerId]);
    } else {
      // Don't allow deselecting mandatory players
      if (isMandatoryPlayer(playerId)) {
        return;
      }
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    }
  };
  
  // Auto-select random players to fill remaining spots
  const autoSelectRandom = () => {
    // Start with mandatory players
    const mandatoryPlayers = [hohId, ...nominees].filter(Boolean);
    
    // Get eligible houseguests for random selection
    const eligibleForRandom = activeHouseguests
      .filter(hg => !mandatoryPlayers.includes(hg.id))
      .map(hg => hg.id);
    
    // Shuffle and select enough to fill out 6 slots
    const shuffled = [...eligibleForRandom].sort(() => 0.5 - Math.random());
    const numNeeded = Math.min(6 - mandatoryPlayers.length, shuffled.length);
    const randomSelected = shuffled.slice(0, numNeeded);
    
    // Combine mandatory and random players
    const finalSelection = [...mandatoryPlayers, ...randomSelected];
    setSelectedPlayers(finalSelection);
    setAutoSelected(true);
  };
  
  // Continue to PoV competition
  const continueToPov = () => {
    // Must have between 3-6 players
    if (selectedPlayers.length < 3 || selectedPlayers.length > 6) {
      return;
    }
    
    // Update game state
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'select_pov_players',
        params: { povPlayerIds: selectedPlayers }
      }
    });
    
    // Log event
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: 'PoVPlayerSelection',
        type: 'POV_PLAYERS_SELECTED',
        description: `${selectedPlayers.length} houseguests selected for PoV competition.`,
        involvedHouseguests: selectedPlayers
      }
    });
    
    // Continue to PoV competition
    dispatch({
      type: 'SET_PHASE',
      payload: 'PoV'
    });
  };

  const value = {
    selectedPlayers,
    autoSelected,
    isMandatoryPlayer,
    handlePlayerToggle,
    autoSelectRandom,
    continueToPov
  };

  return (
    <PlayerSelectionContext.Provider value={value}>
      {children}
    </PlayerSelectionContext.Provider>
  );
};

// Hook for consuming the context
export const usePlayerSelection = () => {
  const context = useContext(PlayerSelectionContext);
  if (context === undefined) {
    throw new Error('usePlayerSelection must be used within a PlayerSelectionProvider');
  }
  return context;
};

// Wrapper for the provider
export const withPlayerSelectionProvider = (Component: React.ComponentType) => {
  return function WithPlayerSelectionProvider(props: any) {
    return (
      <PlayerSelectionProvider>
        <Component {...props} />
      </PlayerSelectionProvider>
    );
  };
};
