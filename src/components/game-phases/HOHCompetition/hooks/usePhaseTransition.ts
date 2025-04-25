
import { useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';

export const usePhaseTransition = () => {
  const { dispatch } = useGame();
  
  const advanceToNomination = useCallback(() => {
    dispatch({
      type: 'SET_PHASE',
      payload: 'Nomination'
    });
  }, [dispatch]);

  return { advanceToNomination };
};

