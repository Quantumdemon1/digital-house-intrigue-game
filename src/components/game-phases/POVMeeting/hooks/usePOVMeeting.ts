
import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';
import { useVetoDecision } from './useVetoDecision';
import { useNomineeReplacement } from './useNomineeReplacement';
import { useAIDecisions } from './useAIDecisions';

export const usePOVMeeting = () => {
  const { gameState } = useGame();
  const [meetingStage, setMeetingStage] = useState<'initial' | 'selectSaved' | 'selectReplacement' | 'complete'>('initial');
  const [savedNominee, setSavedNominee] = useState<Houseguest | null>(null);
  const [replacementNominee, setReplacementNominee] = useState<Houseguest | null>(null);
  
  const povHolder = gameState.povWinner;
  const nominees = gameState.nominees;
  const hoh = gameState.hohWinner;
  // Get active houseguests directly from reducer state (avoids stale game object)
  const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
  
  // Use extracted hooks for nominee replacement logic
  const { 
    handleSaveNominee,
    handleSelectReplacement,
    completeVetoMeeting 
  } = useNomineeReplacement({
    povHolder,
    nominees,
    hoh,
    savedNominee,
    meetingStage,
    setMeetingStage,
    setReplacementNominee,
    setSavedNominee
  });
  
  // Use extracted hook for veto decision logic
  const { 
    useVeto, 
    handleVetoDecision 
  } = useVetoDecision({
    meetingStage,
    setMeetingStage,
    povHolder,
    setSavedNominee,
    completeVetoMeeting
  });
  
  // Hook for AI decision making
  useAIDecisions({
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
    activeHouseguests,
    gameState
  });
  
  const getEligibleToSave = () => nominees;
  
  const getEligibleReplacements = () => {
    const isFinal4 = activeHouseguests.length === 4;
    
    // At Final 4, if the off-block person (not HoH, not nominee) wins and uses veto,
    // they must put themselves on the block as the replacement nominee
    if (isFinal4 && povHolder) {
      const povHolderHg = activeHouseguests.find(h => h.id === povHolder.id || h.id === (povHolder as any));
      const isOffBlockPerson = povHolderHg && 
        !povHolderHg.isHoH && 
        !nominees.some(n => n.id === povHolderHg.id);
      
      if (isOffBlockPerson) {
        // The only replacement option is themselves
        return [povHolderHg];
      }
    }
    
    // Normal rules: anyone not HoH, not already nominated, not the one just saved, not PoV holder
    return activeHouseguests.filter(houseguest => 
      !houseguest.isHoH && 
      !houseguest.isNominated && 
      houseguest.id !== savedNominee?.id &&
      !houseguest.isPovHolder
    );
  };

  return {
    meetingStage,
    povHolder,
    nominees,
    hoh,
    useVeto,
    savedNominee,
    replacementNominee,
    getEligibleToSave,
    getEligibleReplacements,
    handleVetoDecision,
    handleSaveNominee,
    handleSelectReplacement,
  };
};
