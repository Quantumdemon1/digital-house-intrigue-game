
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useAINomination } from './hooks/useAINomination';
import NominationHeader from './components/NominationHeader';
import NominationCeremonyResult from './NominationCeremonyResult';
import NominationContent from './components/NominationContent';
import NominationFooter from './components/NominationFooter';
import AIDecisionIndicator from './AIDecisionIndicator';

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

  // Debug logs for ceremony status
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
        // Show AI decision indicator for AI HoH
        <AIDecisionIndicator hohName={hoh?.name} />
      )}
      
      <NominationFooter 
        nominees={nominees} 
        isPlayerHoh={hoh?.isPlayer ?? false} 
      />
    </Card>
  );
};

export default NominationPhase;
