
import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { Houseguest } from '@/models/houseguest';

type MeetingStage = 'initial' | 'selectSaved' | 'selectReplacement' | 'complete';

export const usePOVMeeting = () => {
  const { gameState, dispatch, getActiveHouseguests } = useGame();
  const { toast } = useToast();
  const [useVeto, setUseVeto] = useState<boolean | null>(null);
  const [savedNominee, setSavedNominee] = useState<Houseguest | null>(null);
  const [replacementNominee, setReplacementNominee] = useState<Houseguest | null>(null);
  const [meetingStage, setMeetingStage] = useState<MeetingStage>('initial');
  
  const povHolder = gameState.povWinner;
  const nominees = gameState.nominees;
  const hoh = gameState.hohWinner;
  const activeHouseguests = getActiveHouseguests();
  
  const handleVetoDecision = (decision: boolean) => {
    setUseVeto(decision);
    
    if (decision) {
      if (povHolder && povHolder.isNominated) {
        handleSaveNominee(povHolder);
      } else {
        setMeetingStage('selectSaved');
      }
    } else {
      completeVetoMeeting(false);
    }
    
    toast({
      title: decision ? "Veto Will Be Used" : "Veto Will Not Be Used",
      description: decision 
        ? "The Power of Veto holder has decided to use the veto."
        : "The Power of Veto holder has decided not to use the veto.",
    });
  };
  
  const handleSaveNominee = (nominee: Houseguest) => {
    setSavedNominee(nominee);
    setMeetingStage('selectReplacement');
    
    toast({
      title: "Nominee Saved",
      description: `${nominee.name} has been removed from the block.`,
    });
  };
  
  const handleSelectReplacement = (replacement: Houseguest) => {
    setReplacementNominee(replacement);
    
    toast({
      title: "Replacement Nominated",
      description: `${replacement.name} has been placed on the block as a replacement nominee.`,
    });
    
    completeVetoMeeting(true, savedNominee, replacement);
  };
  
  const completeVetoMeeting = (
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
  };
  
  const getEligibleToSave = () => nominees;
  
  const getEligibleReplacements = () => {
    return activeHouseguests.filter(houseguest => 
      !houseguest.isHoH && 
      !houseguest.isNominated && 
      houseguest.id !== savedNominee?.id &&
      !houseguest.isPovHolder
    );
  };
  
  // AI Decision logic for POV holder
  useEffect(() => {
    if (
      meetingStage === 'initial' && 
      povHolder && 
      !povHolder.isPlayer && 
      useVeto === null
    ) {
      let decision = false;
      
      if (povHolder.isNominated) {
        decision = true;
      } else {
        const getRelationshipWithNominees = () => {
          let bestRelationship = -101;
          let bestNominee = null;
          
          for (const nominee of nominees) {
            if (gameState.relationships.has(povHolder.id)) {
              const relMap = gameState.relationships.get(povHolder.id);
              if (relMap && relMap.has(nominee.id)) {
                const rel = relMap.get(nominee.id)?.score || 0;
                if (rel > bestRelationship) {
                  bestRelationship = rel;
                  bestNominee = nominee;
                }
              }
            }
          }
          
          return { bestNominee, bestRelationship };
        };
        
        const { bestNominee, bestRelationship } = getRelationshipWithNominees();
        
        if (bestRelationship > 30 && bestNominee) {
          decision = true;
          setTimeout(() => handleSaveNominee(bestNominee), 1500);
        } else {
          decision = false;
        }
      }
      
      setTimeout(() => handleVetoDecision(decision), 2000);
    }
  }, [meetingStage, povHolder, useVeto, nominees]);
  
  // AI Decision logic for HoH replacement nomination
  useEffect(() => {
    if (
      meetingStage === 'selectReplacement' && 
      savedNominee && 
      hoh && 
      !hoh.isPlayer && 
      !replacementNominee
    ) {
      const eligibleReplacements = activeHouseguests.filter(houseguest => 
        !houseguest.isHoH && 
        !houseguest.isNominated && 
        houseguest.id !== savedNominee.id && 
        !houseguest.isPovHolder
      );
      
      if (eligibleReplacements.length > 0) {
        let worstRelationship = 101;
        let worstHouseguest = eligibleReplacements[0];
        
        for (const houseguest of eligibleReplacements) {
          if (gameState.relationships.has(hoh.id)) {
            const relMap = gameState.relationships.get(hoh.id);
            if (relMap && relMap.has(houseguest.id)) {
              const rel = relMap.get(houseguest.id)?.score || 0;
              if (rel < worstRelationship) {
                worstRelationship = rel;
                worstHouseguest = houseguest;
              }
            }
          }
        }
        
        setTimeout(() => handleSelectReplacement(worstHouseguest), 2500);
      }
    }
  }, [meetingStage, savedNominee, hoh, replacementNominee, activeHouseguests]);
  
  return {
    meetingStage,
    povHolder,
    nominees,
    hoh,
    useVeto,
    savedNominee,
    replacementNominee,
    handleVetoDecision,
    handleSaveNominee,
    handleSelectReplacement,
    getEligibleToSave,
    getEligibleReplacements,
  };
};
