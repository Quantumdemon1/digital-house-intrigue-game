
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import NominationHeader from './components/NominationHeader';
import NominationContent from './components/NominationContent';
import NominationFooter from './components/NominationFooter';
import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useNominationTimer } from './hooks/useNominationTimer';
import { useAINomination } from './hooks/useAINomination';
import AIDecisionDisplay from './AIDecisionDisplay';
import { Houseguest } from '@/models/houseguest';

const NominationPhase: React.FC = () => {
  const {
    gameState,
    dispatch,
    getHouseguestById,
    getRelationship,
    logger
  } = useGame();

  // Convert HoH ID to Houseguest object
  const hohId = gameState?.hohWinner?.id;
  const hoh = hohId ? getHouseguestById(hohId) : null;
  
  // Local state and ceremony hooks
  const { 
    nominees, 
    setNominees,
    isNominating,
    ceremonyComplete,
    startCeremony,
    confirmNominations 
  } = useNominationCeremony(hoh);

  const {
    timeRemaining,
    totalTime,
    hasTimeExpired,
    startTimer,
    resetTimer
  } = useNominationTimer(60);
  
  // Get all eligible houseguests (active and not HoH)
  const potentialNominees = gameState.houseguests.filter(
    hg => hg.status === 'Active' && hg.id !== hohId
  );

  // Determine if player is HoH
  const isPlayerHoH = hoh?.isPlayer ?? false;

  // Handle AI nomination if HoH is AI-controlled
  const {
    aiProcessed,
    showAIDecision,
    aiDecision,
    handleCloseAIDecision
  } = useAINomination({
    hoh,
    potentialNominees,
    isNominating,
    ceremonyComplete,
    getRelationship,
    confirmNominations,
    setNominees
  });

  // Continue to Power of Veto phase
  const continueToPoV = () => {
    if (nominees.length !== 2) {
      return;
    }
    
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_pov',
        params: {}
      }
    });
  };

  // After nominations are confirmed, update game state
  useEffect(() => {
    if (ceremonyComplete && nominees.length === 2) {
      dispatch({
        type: 'SET_NOMINEES',
        payload: nominees
      });
    }
  }, [ceremonyComplete, nominees, dispatch]);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-2 border-amber-100/30">
      <NominationHeader 
        hoh={hoh}
        ceremonyComplete={ceremonyComplete}
        week={gameState.week}
      />
      
      {!ceremonyComplete ? (
        <NominationContent 
          hoh={hoh!} 
          startCeremony={startCeremony}
          isPlayerHoH={isPlayerHoH}
        />
      ) : (
        <NominationFooter 
          nominees={nominees}
          ceremonyComplete={ceremonyComplete}
          continueToPoV={continueToPoV}
        />
      )}
      
      {/* AI Decision Display */}
      {showAIDecision && aiDecision && hoh && (
        <AIDecisionDisplay
          hohName={hoh.name}
          nominees={aiDecision.nominees}
          reasoning={aiDecision.reasoning}
          isVisible={showAIDecision}
          onClose={handleCloseAIDecision}
        />
      )}
    </Card>
  );
};

export default NominationPhase;
