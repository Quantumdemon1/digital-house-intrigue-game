
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';

export const useNominationCeremony = () => {
  const { gameState, dispatch, getRandomNominees, getRelationship } = useGame();
  const { toast } = useToast();
  const [nominees, setNominees] = useState<Houseguest[]>([]);
  const [isNominating, setIsNominating] = useState(false);
  const [ceremonyComplete, setCeremonyComplete] = useState(false);

  const { getActiveHouseguests } = useGame();
  const activeHouseguests = getActiveHouseguests();
  const hoh = gameState.hohWinner;
  
  // Filter out the HoH from potential nominees
  const potentialNominees = activeHouseguests.filter(
    houseguest => houseguest.id !== hoh?.id
  );
  
  const toggleNominee = (houseguest: Houseguest) => {
    if (nominees.find(nominee => nominee.id === houseguest.id)) {
      setNominees(nominees.filter(nominee => nominee.id !== houseguest.id));
    } else if (nominees.length < 2) {
      setNominees([...nominees, houseguest]);
    }
  };
  
  const confirmNominations = () => {
    if (nominees.length !== 2) return;
    
    setIsNominating(true);
    
    setTimeout(() => {
      // Update game state with nominations
      dispatch({ type: 'SET_NOMINEES', payload: nominees });
      
      // Update relationships - nominees will like HoH less
      nominees.forEach(nominee => {
        if (hoh) {
          dispatch({
            type: 'UPDATE_RELATIONSHIPS',
            payload: {
              guestId1: nominee.id,
              guestId2: hoh.id,
              change: -20,
              note: `${nominee.name} was nominated by ${hoh.name}`
            }
          });
        }
      });
      
      // Log the event
      dispatch({ 
        type: 'LOG_EVENT', 
        payload: {
          week: gameState.week,
          phase: 'Nomination',
          type: 'NOMINATION',
          description: `${hoh?.name} nominated ${nominees[0].name} and ${nominees[1].name} for eviction.`,
          involvedHouseguests: [...nominees.map(n => n.id), hoh?.id || ''],
        }
      });
      
      // Show toast
      toast({
        title: "Nomination Ceremony Complete",
        description: `${nominees[0].name} and ${nominees[1].name} have been nominated for eviction.`,
        variant: "default",
      });
      
      setCeremonyComplete(true);
      
      // Continue to PoV phase after a delay
      setTimeout(() => {
        dispatch({ type: 'SET_PHASE', payload: 'PoV' });
      }, 3000);
    }, 1500);
  };

  // Function to handle automatic nominations when time runs out
  const handleTimeExpired = () => {
    // Only run if ceremony isn't already complete and not already nominating
    if (!ceremonyComplete && !isNominating) {
      // Get two random nominees excluding HOH
      const randomNominees = getRandomNominees(2, [hoh?.id || '']);
      
      // Set the nominees
      setNominees(randomNominees);
      
      toast({
        title: "Time Expired",
        description: "Time has run out. Random nominees have been selected.",
        variant: "destructive",
      });
      
      // Then confirm these random nominations
      setTimeout(() => {
        confirmNominations();
      }, 1000);
    }
  };

  return {
    nominees,
    setNominees,
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
