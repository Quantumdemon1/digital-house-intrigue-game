
import { Houseguest } from '@/models/houseguest';
import { GameState } from '@/contexts/types/game-context-types';

export interface AIVetoDecisionProps {
  povHolder: Houseguest | null;
  nominees: Houseguest[];
  isNominated: boolean;
  handleVetoDecision: (decision: boolean) => void;
  handleSaveNominee: (nominee: Houseguest) => void;
}

export interface AIReplacementDecisionProps {
  hoh: Houseguest | null;
  savedNominee: Houseguest | null;
  activeHouseguests: Houseguest[];
  gameState: GameState;
  handleSelectReplacement: (replacement: Houseguest) => void;
}

export interface BestNomineeResult {
  nominee: Houseguest | null;
  score: number;
  hasAlliance: boolean;
  wasBetrayed: boolean;
}

export interface UseAIDecisionsProps {
  meetingStage: 'initial' | 'selectSaved' | 'selectReplacement' | 'complete';
  povHolder: Houseguest | null;
  nominees: Houseguest[];
  hoh: Houseguest | null;
  useVeto: boolean | null;
  savedNominee: Houseguest | null;
  replacementNominee: Houseguest | null;
  handleVetoDecision: (decision: boolean) => void;
  handleSaveNominee: (nominee: Houseguest) => void;
  handleSelectReplacement: (replacement: Houseguest) => void;
  activeHouseguests: Houseguest[];
  gameState: GameState;
}
