
import { useState, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';

interface UseVetoDecisionProps {
  meetingStage: 'initial' | 'selectSaved' | 'selectReplacement' | 'complete';
  setMeetingStage: React.Dispatch<React.SetStateAction<'initial' | 'selectSaved' | 'selectReplacement' | 'complete'>>;
  povHolder: Houseguest | null;
  setSavedNominee: React.Dispatch<React.SetStateAction<Houseguest | null>>;
  completeVetoMeeting: (vetoUsed: boolean, saved?: Houseguest | null, replacement?: Houseguest | null) => void;
}

export const useVetoDecision = ({
  meetingStage,
  setMeetingStage,
  povHolder,
  setSavedNominee,
  completeVetoMeeting
}: UseVetoDecisionProps) => {
  const { dispatch } = useGame();
  const [useVeto, setUseVeto] = useState<boolean | null>(null);
  
  const handleVetoDecision = useCallback((decision: boolean) => {
    setUseVeto(decision);
    
    if (decision) {
      if (povHolder && povHolder.isNominated) {
        // If POV holder is nominated, automatically save themselves
        setSavedNominee(povHolder);
        setMeetingStage('selectReplacement');
      } else {
        setMeetingStage('selectSaved');
      }
    } else {
      completeVetoMeeting(false);
    }
    
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'use_veto',
        params: { useVeto: decision }
      }
    });
  }, [povHolder, dispatch, setMeetingStage, setSavedNominee, completeVetoMeeting]);

  return {
    useVeto,
    handleVetoDecision
  };
};
