
import React from 'react';
import { Card } from '@/components/ui/card';
import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useAINomination } from './hooks/useAINomination';
import { useNominationTimer } from './hooks/useNominationTimer';
import NominationCeremonyResult from './NominationCeremonyResult';
import NominationCeremonyProgress from './NominationCeremonyProgress';
import NominationHeader from './components/NominationHeader';
import NominationContent from './components/NominationContent';
import NominationFooter from './components/NominationFooter';

const NOMINATION_TIME_LIMIT = 60; // 60 seconds time limit

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
  } = useNominationCeremony();
  
  const { timeRemaining } = useNominationTimer({
    initialTime: NOMINATION_TIME_LIMIT,
    isNominating,
    ceremonyComplete,
    onTimeExpired: handleTimeExpired
  });
  
  // Use AI nomination logic
  useAINomination({
    hoh,
    potentialNominees,
    isNominating,
    ceremonyComplete,
    getRelationship: useNominationCeremony().getRelationship,
    confirmNominations,
    setNominees
  });
  
  // Return different views based on ceremony state
  if (ceremonyComplete) {
    return <NominationCeremonyResult nominees={nominees} hohName={hoh?.name} />;
  }
  
  if (isNominating) {
    return <NominationCeremonyProgress hohName={hoh?.name} />;
  }
  
  return (
    <Card className="shadow-lg border-bb-red">
      <NominationHeader hohName={hoh?.name} />
      <NominationContent
        hoh={hoh}
        nominees={nominees}
        potentialNominees={potentialNominees}
        timeRemaining={timeRemaining}
        onTimeExpired={handleTimeExpired}
        onToggleNominee={toggleNominee}
        onConfirmNominations={confirmNominations}
        isNominating={isNominating}
        totalTime={NOMINATION_TIME_LIMIT}
      />
      <NominationFooter 
        nominees={nominees}
        isPlayerHoh={!!hoh?.isPlayer}
      />
    </Card>
  );
};

export default NominationPhase;
