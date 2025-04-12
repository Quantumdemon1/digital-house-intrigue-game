
import { useCallback } from 'react';
import { AIDecision } from './types';

interface UseAIDecisionDisplayProps {
  setShowAIDecision: (show: boolean) => void;
  confirmNominations: () => void;
}

export const useAIDecisionDisplay = ({
  setShowAIDecision,
  confirmNominations
}: UseAIDecisionDisplayProps) => {
  
  // Handle closing the AI decision display
  const handleCloseAIDecision = useCallback(() => {
    setShowAIDecision(false);
    // After showing the AI decision and user closes the dialog, confirm nominations
    confirmNominations();
  }, [confirmNominations, setShowAIDecision]);

  return {
    handleCloseAIDecision
  };
};
