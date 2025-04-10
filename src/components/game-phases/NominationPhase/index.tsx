
import React from 'react';
import { Card } from '@/components/ui/card';
import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useNominationTimer } from './hooks/useNominationTimer';
import { useAINomination } from './hooks/useAINomination';
import NominationHeader from './components/NominationHeader';
import NominationContent from './components/NominationContent';
import NominationFooter from './components/NominationFooter';
import NominationCeremonyResult from './NominationCeremonyResult';

const NOMINATION_TIME = 60; // seconds

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

  const { timeRemaining } = useNominationTimer({
    initialTime: NOMINATION_TIME,
    isPlayer: hoh?.isPlayer ?? false,
    onTimeExpired: handleTimeExpired,
    isComplete: ceremonyComplete
  });

  // AI nomination logic
  useAINomination({
    hoh,
    potentialNominees,
    isNominating,
    ceremonyComplete,
    getRelationship,
    confirmNominations,
    setNominees
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <NominationHeader 
        hoh={hoh}
        isNominating={isNominating}
        ceremonyComplete={ceremonyComplete}
      />
      
      {ceremonyComplete ? (
        <NominationCeremonyResult 
          nominees={nominees} 
          hoh={hoh} // Pass the hoh object directly
        />
      ) : (
        <NominationContent 
          hoh={hoh}
          nominees={nominees}
          potentialNominees={potentialNominees}
          timeRemaining={timeRemaining}
          onTimeExpired={handleTimeExpired}
          onToggleNominee={toggleNominee}
          onConfirmNominations={confirmNominations}
          isNominating={isNominating}
          totalTime={NOMINATION_TIME}
        />
      )}
      
      <NominationFooter 
        nominees={nominees} 
        isPlayerHoh={hoh?.isPlayer ?? false} 
      />
    </Card>
  );
};

export default NominationPhase;
