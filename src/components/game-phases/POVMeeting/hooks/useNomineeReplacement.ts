
import { useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';

interface UseNomineeReplacementProps {
  povHolder: Houseguest | null;
  nominees: Houseguest[];
  hoh: Houseguest | null;
  savedNominee: Houseguest | null;
  meetingStage: 'initial' | 'selectSaved' | 'selectReplacement' | 'complete';
  setMeetingStage: React.Dispatch<React.SetStateAction<'initial' | 'selectSaved' | 'selectReplacement' | 'complete'>>;
  setReplacementNominee: React.Dispatch<React.SetStateAction<Houseguest | null>>;
}

export const useNomineeReplacement = ({
  povHolder,
  nominees,
  hoh,
  savedNominee,
  setMeetingStage,
  setReplacementNominee
}: UseNomineeReplacementProps) => {
  const { dispatch, gameState } = useGame();
  
  const completeVetoMeeting = useCallback((
    vetoUsed: boolean, 
    saved: Houseguest | null = null, 
    replacement: Houseguest | null = null
  ) => {
    if (vetoUsed && saved && replacement) {
      const updatedNominees = nominees
        .filter(nom => nom.id !== saved.id)
        .concat(replacement);
      
      dispatch({ type: 'SET_NOMINEES', payload: updatedNominees });
      
      if (povHolder) {
        dispatch({
          type: 'UPDATE_RELATIONSHIPS',
          payload: {
            guestId1: saved.id,
            guestId2: povHolder.id,
            change: 25,
            note: `${povHolder.name} used POV to save ${saved.name}`
          }
        });
        
        if (hoh) {
          dispatch({
            type: 'UPDATE_RELATIONSHIPS',
            payload: {
              guestId1: replacement.id,
              guestId2: hoh.id,
              change: -20,
              note: `${hoh.name} named ${replacement.name} as replacement nominee`
            }
          });
        }
        
        if (povHolder.id !== hoh?.id) {
          dispatch({
            type: 'UPDATE_RELATIONSHIPS',
            payload: {
              guestId1: replacement.id,
              guestId2: povHolder.id,
              change: -15,
              note: `${povHolder.name} used POV forcing ${replacement.name} on the block`
            }
          });
        }
      }
      
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'PoVMeeting',
          type: 'VETO_USED',
          description: `${povHolder?.name} used the Power of Veto on ${saved.name}. ${hoh?.name} named ${replacement.name} as the replacement nominee.`,
          involvedHouseguests: [povHolder?.id || '', saved.id, hoh?.id || '', replacement.id],
        }
      });
    } else {
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'PoVMeeting',
          type: 'VETO_NOT_USED',
          description: `${povHolder?.name} decided not to use the Power of Veto. The nominations remain the same.`,
          involvedHouseguests: [povHolder?.id || '', ...nominees.map(n => n.id)],
        }
      });
    }
    
    setMeetingStage('complete');
    
    setTimeout(() => {
      dispatch({ type: 'SET_PHASE', payload: 'Eviction' });
    }, 5000);
  }, [povHolder, hoh, nominees, dispatch, setMeetingStage, gameState.week]);
  
  const handleSaveNominee = useCallback((nominee: Houseguest) => {
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'save_nominee',
        params: { nomineeId: nominee.id }
      }
    });
    
    setMeetingStage('selectReplacement');
  }, [dispatch, setMeetingStage]);
  
  const handleSelectReplacement = useCallback((replacement: Houseguest) => {
    setReplacementNominee(replacement);
    
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'select_replacement',
        params: { replacementId: replacement.id }
      }
    });
    
    completeVetoMeeting(true, savedNominee, replacement);
  }, [dispatch, savedNominee, completeVetoMeeting, setReplacementNominee]);

  return {
    handleSaveNominee,
    handleSelectReplacement,
    completeVetoMeeting
  };
};
