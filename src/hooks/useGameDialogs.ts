
import { useState, useEffect } from 'react';

export function useGameDialogs() {
  const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
  const [isPromiseDialogOpen, setIsPromiseDialogOpen] = useState(false);
  
  useEffect(() => {
    // Listen for custom events to show relationships
    const handleShowRelationships = () => setIsRelationshipDialogOpen(true);
    document.addEventListener('game:showRelationships', handleShowRelationships);
    
    // Listen for custom events to show promises
    const handleShowPromises = () => setIsPromiseDialogOpen(true);
    document.addEventListener('game:showPromises', handleShowPromises);
    
    return () => {
      document.removeEventListener('game:showRelationships', handleShowRelationships);
      document.removeEventListener('game:showPromises', handleShowPromises);
    };
  }, []);
  
  return {
    isRelationshipDialogOpen,
    setIsRelationshipDialogOpen,
    isPromiseDialogOpen,
    setIsPromiseDialogOpen
  };
}
