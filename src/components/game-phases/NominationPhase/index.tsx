
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import NominationContent from './components/NominationContent';
import NomineeSelector from './NomineeSelector';
import KeyCeremony from './KeyCeremony';
import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useAINomination } from './hooks/useAINomination';
import AIDecisionDisplay from './AIDecisionDisplay';
import { Crown, Target, Users, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';

type NominationStage = 'pre-ceremony' | 'player-selection' | 'key-ceremony' | 'complete';

const NominationPhase: React.FC = () => {
  const {
    gameState,
    dispatch,
    getRelationship,
  } = useGame();

  const [stage, setStage] = useState<NominationStage>('pre-ceremony');
  const spectatorAutoStartRef = useRef(false);
  
  // Look up HoH directly from reducer state to ensure isPlayer is accurate
  const hohId = typeof gameState?.hohWinner === 'string' 
    ? gameState.hohWinner 
    : gameState?.hohWinner?.id;
  
  const hoh = hohId 
    ? gameState.houseguests.find(h => h.id === hohId) || null
    : null;
  
  const { 
    nominees, 
    setNominees,
    isNominating,
    ceremonyComplete,
    startCeremony,
    confirmNominations 
  } = useNominationCeremony(hoh);
  
  const potentialNominees = gameState.houseguests.filter(
    hg => hg.status === 'Active' && hg.id !== hohId
  );

  const isPlayerHoH = hoh?.isPlayer ?? false;

  // Handle stage transition when ceremony starts
  const handleStartCeremony = useCallback(() => {
    startCeremony();
    if (isPlayerHoH) {
      setStage('player-selection');
    }
    // AI nominations are handled by the hook
  }, [startCeremony, isPlayerHoH]);

  // Toggle nominee selection for player
  const handleToggleNominee = useCallback((houseguest: Houseguest) => {
    setNominees(prev => {
      const isSelected = prev.some(n => n.id === houseguest.id);
      if (isSelected) {
        return prev.filter(n => n.id !== houseguest.id);
      }
      if (prev.length >= 2) {
        return [...prev.slice(1), houseguest];
      }
      return [...prev, houseguest];
    });
  }, [setNominees]);

  // Player confirms their selections and moves to key ceremony
  const handleConfirmSelection = useCallback(() => {
    if (nominees.length === 2) {
      setStage('key-ceremony');
    }
  }, [nominees.length]);

  // AI nomination handler
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

  // Redirect to final stages if not enough houseguests
  useEffect(() => {
    const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
    
    // If only 2 houseguests, go to Jury Questioning
    if (activeHouseguests.length <= 2) {
      dispatch({ type: 'SET_PHASE', payload: 'JuryQuestioning' });
      return;
    }
    
    // If 3 or fewer houseguests, shouldn't be in Nomination - redirect to Final HoH
    if (activeHouseguests.length <= 3 && !gameState.isFinalStage) {
      dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
    }
  }, [gameState.houseguests, gameState.isFinalStage, dispatch]);

  // When AI makes decision, move to key ceremony
  useEffect(() => {
    if (aiProcessed && nominees.length === 2 && !isPlayerHoH && stage !== 'key-ceremony' && stage !== 'complete') {
      setStage('key-ceremony');
    }
  }, [aiProcessed, nominees.length, isPlayerHoH, stage]);

  // Auto-start nomination in spectator mode
  useEffect(() => {
    if (gameState.isSpectatorMode && stage === 'pre-ceremony' && !spectatorAutoStartRef.current && !isPlayerHoH) {
      spectatorAutoStartRef.current = true;
      const timer = setTimeout(() => {
        handleStartCeremony();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isSpectatorMode, stage, isPlayerHoH, handleStartCeremony]);

  // Handle key ceremony completion
  const handleKeyCeremonyComplete = useCallback(() => {
    confirmNominations();
    setStage('complete');
  }, [confirmNominations]);

  // Continue to PoV after ceremony
  const continueToPoV = useCallback(() => {
    if (nominees.length !== 2) return;
    
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_pov',
        params: {}
      }
    });
  }, [nominees.length, dispatch]);

  // Sync nominees to game state when ceremony completes
  useEffect(() => {
    if (stage === 'complete' && nominees.length === 2) {
      dispatch({
        type: 'SET_NOMINEES',
        payload: nominees
      });
    }
  }, [stage, nominees, dispatch]);

  // Key Ceremony stage
  if (stage === 'key-ceremony' && hoh && nominees.length === 2) {
    return (
      <KeyCeremony
        hoh={hoh}
        nominees={nominees}
        eligibleHouseguests={potentialNominees}
        onComplete={handleKeyCeremonyComplete}
      />
    );
  }

  // Player selection stage
  if (stage === 'player-selection' && isPlayerHoH && hoh) {
    return (
      <GameCard variant="danger" className="w-full max-w-4xl mx-auto animate-fade-in">
        <GameCardHeader variant="danger" icon={Target}>
          <div className="flex items-center justify-between w-full">
            <div>
              <GameCardTitle>Make Your Nominations</GameCardTitle>
              <GameCardDescription>
                Week {gameState.week} • Select two houseguests for eviction
              </GameCardDescription>
            </div>
            <Badge variant="outline" className="bg-bb-gold/10 text-white border-white/30">
              <Crown className="h-3 w-3 mr-1" /> {hoh.name}
            </Badge>
          </div>
        </GameCardHeader>
        
        <GameCardContent className="space-y-6">
          {/* Selected nominees display */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Users className="h-4 w-4" />
              Your Nominations ({nominees.length}/2)
            </div>
            {nominees.length > 0 ? (
              <div className="flex gap-4">
                {nominees.map(nominee => (
                  <div key={nominee.id} className="flex items-center gap-2 px-3 py-2 bg-bb-red/10 border border-bb-red/30 rounded-lg">
                    <span className="font-medium text-bb-red">{nominee.name}</span>
                    <button 
                      onClick={() => handleToggleNominee(nominee)}
                      className="text-bb-red/60 hover:text-bb-red"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Click on houseguests below to nominate them
              </p>
            )}
          </div>

          {/* Nominee selector grid */}
          <NomineeSelector
            potentialNominees={potentialNominees}
            nominees={nominees}
            onToggleNominee={handleToggleNominee}
          />
          
          {/* Confirm button */}
          <Button
            onClick={handleConfirmSelection}
            disabled={nominees.length !== 2}
            size="lg"
            className="w-full bg-bb-red hover:bg-bb-red/90 disabled:opacity-50"
          >
            <Check className="h-5 w-5 mr-2" />
            Confirm Nominations & Begin Key Ceremony
          </Button>
        </GameCardContent>
      </GameCard>
    );
  }

  // Complete stage - show summary and continue button
  if (stage === 'complete') {
    return (
      <GameCard variant="danger" className="w-full max-w-4xl mx-auto animate-fade-in">
        <GameCardHeader variant="danger" icon={Target}>
          <div className="flex items-center justify-between w-full">
            <div>
              <GameCardTitle>Nominations Complete</GameCardTitle>
              <GameCardDescription>
                Week {gameState.week} • The ceremony has concluded
              </GameCardDescription>
            </div>
          </div>
        </GameCardHeader>
        
        <GameCardContent className="space-y-6 text-center">
          <div className="p-6 bg-bb-red/10 rounded-lg border border-bb-red/30">
            <h3 className="text-lg font-bold text-bb-red mb-4">Nominated for Eviction</h3>
            <div className="flex justify-center gap-8">
              {nominees.map(nominee => (
                <div key={nominee.id} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-bb-red/20 border-2 border-bb-red flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-bb-red">
                      {nominee.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold">{nominee.name}</span>
                  {nominee.isPlayer && <Badge variant="secondary" className="mt-1">You</Badge>}
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={continueToPoV} size="lg" className="w-full">
            Continue to PoV Player Selection
          </Button>
        </GameCardContent>
      </GameCard>
    );
  }

  // Pre-ceremony stage (default)
  return (
    <GameCard variant="danger" className="w-full max-w-4xl mx-auto animate-fade-in">
      <GameCardHeader variant="danger" icon={Target}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Nomination Ceremony</GameCardTitle>
            <GameCardDescription>
              {gameState.week && `Week ${gameState.week}`}
              {hoh && ` • Head of Household: ${hoh.name}`}
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
        <NominationContent 
          hoh={hoh!} 
          startCeremony={handleStartCeremony}
          isPlayerHoH={isPlayerHoH}
        />
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
