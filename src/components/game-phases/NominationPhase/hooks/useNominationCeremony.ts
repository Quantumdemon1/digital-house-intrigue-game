
import { useState, useCallback } from 'react';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/hooks/use-toast';
import { updateHouseguestMentalState } from '@/models/houseguest';

interface UseNominationCeremonyReturn {
  nominees: Houseguest[];
  setNominees: React.Dispatch<React.SetStateAction<Houseguest[]>>;
  isNominating: boolean;
  ceremonyComplete: boolean;
  startCeremony: () => void;
  confirmNominations: () => void;
}

/**
 * Hook to manage the nomination ceremony flow
 */
export const useNominationCeremony = (hoh: Houseguest | null): UseNominationCeremonyReturn => {
  const [nominees, setNominees] = useState<Houseguest[]>([]);
  const [isNominating, setIsNominating] = useState(false);
  const [ceremonyComplete, setCeremonyComplete] = useState(false);
  const { toast } = useToast();
  
  // Start the ceremony
  const startCeremony = useCallback(() => {
    setIsNominating(true);
    
    toast({
      title: "Nomination Ceremony",
      description: "The Head of Household must nominate two houseguests for eviction.",
    });
    
    // Simulate AI thinking if needed
    if (hoh && !hoh.isPlayer) {
      // AI thinking animation will be handled by useAINomination hook
    }
  }, [hoh, toast]);
  
  // Complete the nomination process
  const confirmNominations = useCallback(() => {
    if (nominees.length !== 2) {
      toast({
        title: "Cannot Confirm",
        description: "Two houseguests must be nominated.",
        variant: "destructive"
      });
      return;
    }
    
    // Set ceremony as complete
    setIsNominating(false);
    setCeremonyComplete(true);
    
    // Update nominees' mental states
    nominees.forEach(nominee => {
      if (nominee) {
        updateHouseguestMentalState(nominee, 'nominated');
      }
    });
    
    toast({
      title: "Nominations Complete",
      description: `${nominees.map(n => n.name).join(' and ')} have been nominated.`,
      variant: "default"
    });
  }, [nominees, toast]);
  
  return {
    nominees,
    setNominees,
    isNominating,
    ceremonyComplete,
    startCeremony,
    confirmNominations
  };
};
