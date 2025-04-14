
import { useState, useEffect } from 'react';

export function useGameDialogs() {
  const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
  const [isPromiseDialogOpen, setIsPromiseDialogOpen] = useState(false);
  const [isGameHistoryDialogOpen, setIsGameHistoryDialogOpen] = useState(false);
  const [isSaveLoadDialogOpen, setIsSaveLoadDialogOpen] = useState(false);
  
  useEffect(() => {
    // Listen for custom events to show relationships
    const handleShowRelationships = () => setIsRelationshipDialogOpen(true);
    document.addEventListener('game:showRelationships', handleShowRelationships);
    
    // Listen for custom events to show promises
    const handleShowPromises = () => setIsPromiseDialogOpen(true);
    document.addEventListener('game:showPromises', handleShowPromises);
    
    // Listen for custom events to show game history
    const handleShowGameHistory = () => setIsGameHistoryDialogOpen(true);
    document.addEventListener('game:showGameHistory', handleShowGameHistory);
    
    // Listen for custom events to show save/load
    const handleShowSaveLoad = () => setIsSaveLoadDialogOpen(true);
    document.addEventListener('game:showSaveLoad', handleShowSaveLoad);
    
    return () => {
      document.removeEventListener('game:showRelationships', handleShowRelationships);
      document.removeEventListener('game:showPromises', handleShowPromises);
      document.removeEventListener('game:showGameHistory', handleShowGameHistory);
      document.removeEventListener('game:showSaveLoad', handleShowSaveLoad);
    };
  }, []);
  
  return {
    isRelationshipDialogOpen,
    setIsRelationshipDialogOpen,
    isPromiseDialogOpen,
    setIsPromiseDialogOpen,
    isGameHistoryDialogOpen,
    setIsGameHistoryDialogOpen,
    isSaveLoadDialogOpen,
    setIsSaveLoadDialogOpen
  };
}
