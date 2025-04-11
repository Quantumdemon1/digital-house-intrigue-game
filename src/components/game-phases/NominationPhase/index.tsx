
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useAINomination } from './hooks/useAINomination';
import NominationHeader from './components/NominationHeader';
import NominationCeremonyResult from './NominationCeremonyResult';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import NominationContent from './components/NominationContent';
import NominationFooter from './components/NominationFooter';

const NominationPhase: React.FC = () => {
  const {
    nominees,
    setNominees,
    isNominating,
    ceremonyComplete,
    potentialNominees,
    toggleNominee,
    confirmNominations,
    gameState,
    hoh,
    handleTimeExpired,
    getRelationship
  } = useNominationCeremony();

  const { dispatch } = useGame();
  
  // Use the AI nomination hook for AI-controlled HoH
  useAINomination({
    hoh,
    potentialNominees,
    isNominating,
    ceremonyComplete,
    getRelationship,
    confirmNominations,
    setNominees
  });

  // Continue to next phase after nominations are completed
  const handleContinue = () => {
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_pov',
        params: {}
      }
    });
  };

  // If nominations are done, immediately show results
  useEffect(() => {
    console.log("Ceremony complete status:", ceremonyComplete);
    console.log("Current nominees:", nominees.map(n => n.name).join(", "));
  }, [ceremonyComplete, nominees]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <NominationHeader 
        hoh={hoh}
        ceremonyComplete={ceremonyComplete}
      />
      
      {ceremonyComplete ? (
        <NominationCeremonyResult 
          nominees={nominees} 
          hoh={hoh}
          onContinue={handleContinue}
        />
      ) : hoh?.isPlayer ? (
        // Only show nomination interface for player HoH
        <NominationContent 
          hoh={hoh}
          nominees={nominees}
          potentialNominees={potentialNominees}
          timeRemaining={30}
          onTimeExpired={handleTimeExpired}
          onToggleNominee={toggleNominee}
          onConfirmNominations={confirmNominations}
          isNominating={isNominating}
          totalTime={30}
        />
      ) : (
        // For AI HoH, show immediate result
        <CardContent className="text-center p-6">
          <p className="mb-4">{hoh?.name} is automatically making nominations...</p>
          <Button 
            onClick={handleTimeExpired} 
            className="bg-bb-red hover:bg-bb-red/90"
          >
            Skip Wait
          </Button>
        </CardContent>
      )}
      
      <NominationFooter 
        nominees={nominees} 
        isPlayerHoh={hoh?.isPlayer ?? false} 
      />
    </Card>
  );
};

export default NominationPhase;
