
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown } from 'lucide-react';
import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useNominationTimer } from './hooks/useNominationTimer';
import { useAINomination } from './hooks/useAINomination';
import CustomProgress from './CustomProgress';
import NominationHeader from './components/NominationHeader';
import NominationContent from './components/NominationContent';
import NominationFooter from './components/NominationFooter';
import AIDecisionIndicator from './AIDecisionIndicator';
import TimerDisplay from './TimerDisplay';
import NominationCeremonyResult from './NominationCeremonyResult';
import AIDecisionDisplay from './AIDecisionDisplay';

const NominationPhase = () => {
  const { game, getHouseguestById, getRelationship, getActiveHouseguests } = useGame();
  
  // Get HoH from game state
  const hohId = game?.hohWinner;
  const hoh = hohId ? getHouseguestById(hohId) : null;
  
  // Get all eligible nominees (all active houseguests except HoH)
  const potentialNominees = getActiveHouseguests().filter(h => h.id !== hohId);
  
  // Setup nomination ceremony state and handlers
  const {
    nominees,
    setNominees,
    isNominating,
    startCeremony,
    confirmNominations,
    ceremonyComplete,
  } = useNominationCeremony();
  
  // Setup timer for nomination ceremony
  const { 
    timeRemaining, 
    totalTime,
    hasTimeExpired,
    startTimer,
    resetTimer
  } = useNominationTimer();
  
  // Handle AI nominations if HoH is an AI player
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
    setNominees,
  });
  
  // Handle player nominations (not yet implemented)
  const isPlayerHoH = hoh?.isPlayer || false;
  
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-2 border-amber-100/30">
      <CardHeader className="bg-bb-blue text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-full">
              <Crown className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl">Nomination Ceremony</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Week {game.week}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* HoH Information */}
        <NominationHeader hoh={hoh} />
        
        {/* Main Content based on ceremony state */}
        {!isNominating ? (
          // Pre-ceremony state
          <NominationContent 
            hoh={hoh} 
            startCeremony={startCeremony}
            isPlayerHoH={isPlayerHoH}
          />
        ) : ceremonyComplete ? (
          // Post-ceremony state
          <NominationCeremonyResult 
            nominees={nominees} 
            hoh={hoh} 
          />
        ) : isPlayerHoH ? (
          // Player nomination process (to be implemented)
          <div className="text-center">
            <p>Player nomination UI to be implemented</p>
          </div>
        ) : (
          // AI nomination process
          <AIDecisionIndicator hohName={hoh?.name} />
        )}
        
        {/* Progress bar for timer */}
        {isNominating && !ceremonyComplete && (
          <CustomProgress value={(timeRemaining/totalTime) * 100} />
        )}
        
        {/* Footer with timer and continue button */}
        <NominationFooter 
          ceremonyComplete={ceremonyComplete} 
          nominees={nominees}
        />
        
        {/* AI Decision Display Dialog */}
        {showAIDecision && aiDecision && hoh && (
          <AIDecisionDisplay
            hohName={hoh.name}
            nominees={aiDecision.nominees.map(n => ({id: n.id, name: n.name}))}
            reasoning={aiDecision.reasoning}
            isVisible={showAIDecision}
            onClose={handleCloseAIDecision}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default NominationPhase;
