
import { Houseguest } from '@/models/houseguest';

export interface AIDecision {
  nominees: Houseguest[];
  reasoning: string;
}

export interface UseAINominationProps {
  hoh: Houseguest | null;
  potentialNominees: Houseguest[];
  isNominating: boolean;
  ceremonyComplete: boolean;
  getRelationship: (guestId1: string, guestId2: string) => number;
  confirmNominations: () => void;
  setNominees: (nominees: Houseguest[]) => void;
}

export interface UseAINominationReturn {
  aiProcessed: boolean;
  showAIDecision: boolean;
  aiDecision: AIDecision | null;
  handleCloseAIDecision: () => void;
}
