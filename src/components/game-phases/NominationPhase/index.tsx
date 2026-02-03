
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import NominationContent from './components/NominationContent';
import NominationFooter from './components/NominationFooter';
import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useNominationTimer } from './hooks/useNominationTimer';
import { useAINomination } from './hooks/useAINomination';
import AIDecisionDisplay from './AIDecisionDisplay';
import { Crown, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const NominationPhase: React.FC = () => {
  const {
    gameState,
    dispatch,
    getHouseguestById,
    getRelationship,
    logger
  } = useGame();

  const hohId = gameState?.hohWinner?.id;
  const hoh = hohId ? getHouseguestById(hohId) : null;
  
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
  
  const potentialNominees = gameState.houseguests.filter(
    hg => hg.status === 'Active' && hg.id !== hohId
  );

  const isPlayerHoH = hoh?.isPlayer ?? false;

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

  useEffect(() => {
    if (ceremonyComplete && nominees.length === 2) {
      dispatch({
        type: 'SET_NOMINEES',
        payload: nominees
      });
    }
  }, [ceremonyComplete, nominees, dispatch]);

  return (
    <GameCard variant="danger" className="w-full max-w-4xl mx-auto animate-fade-in">
      <GameCardHeader variant="danger" icon={Target}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Nomination Ceremony</GameCardTitle>
            <GameCardDescription>
              {gameState.week && `Week ${gameState.week}`}
              {hoh && ` • Head of Household: ${hoh.name}`}
              {ceremonyComplete && ' • Nominations Complete'}
            </GameCardDescription>
          </div>
          {hoh && (
            <Badge variant="outline" className="bg-bb-gold/10 text-white border-white/30">
              <Crown className="h-3 w-3 mr-1" /> {hoh.name}
            </Badge>
          )}
        </div>
      </GameCardHeader>
      
      <GameCardContent>
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
      </GameCardContent>
      
      {showAIDecision && aiDecision && hoh && (
        <AIDecisionDisplay
          hohName={hoh.name}
          nominees={aiDecision.nominees}
          reasoning={aiDecision.reasoning}
          isVisible={showAIDecision}
          onClose={handleCloseAIDecision}
        />
      )}
    </GameCard>
  );
};

export default NominationPhase;
