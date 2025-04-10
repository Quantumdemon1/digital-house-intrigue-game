
import { useState, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';

interface UseAINominationProps {
  hoh: Houseguest | null;
  potentialNominees: Houseguest[];
  isNominating: boolean;
  ceremonyComplete: boolean;
  getRelationship: (guestId1: string, guestId2: string) => number;
  confirmNominations: () => void;
  setNominees: (nominees: Houseguest[]) => void;
}

export const useAINomination = ({
  hoh,
  potentialNominees,
  isNominating,
  ceremonyComplete,
  getRelationship,
  confirmNominations,
  setNominees,
}: UseAINominationProps) => {
  const [aiProcessed, setAiProcessed] = useState(false);

  // AI nomination logic
  useEffect(() => {
    // Only process if HoH exists, HoH is AI, and we haven't already processed or started nominating
    if (hoh && !hoh.isPlayer && !isNominating && !ceremonyComplete && !aiProcessed) {
      // Set the flag to prevent multiple executions
      setAiProcessed(true);
      
      // AI logic for nominations based on relationships
      const aiNominees = potentialNominees
        .map(houseguest => ({
          houseguest,
          relationship: hoh ? getRelationship(hoh.id, houseguest.id) : 0
        }))
        .sort((a, b) => a.relationship - b.relationship) // Sort by worst relationship first
        .slice(0, 2) // Take the two worst relationships
        .map(item => item.houseguest);
      
      // Set nominees first
      setNominees(aiNominees);
      
      // Delay to simulate decision making then confirm nominations
      const timer = setTimeout(() => {
        if (aiNominees.length === 2) {
          confirmNominations();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [hoh, isNominating, ceremonyComplete, aiProcessed, potentialNominees, getRelationship, confirmNominations, setNominees]);

  return { aiProcessed };
};
