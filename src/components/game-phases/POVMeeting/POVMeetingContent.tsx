
import React from 'react';
import InitialStage from './stages/InitialStage';
import SelectSavedStage from './stages/SelectSavedStage';
import SelectReplacementStage from './stages/SelectReplacementStage';
import CompletedStage from './stages/CompletedStage';
import { usePOVMeeting } from './hooks/usePOVMeeting';

const POVMeetingContent: React.FC = () => {
  const {
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
  } = usePOVMeeting();

  // Render the appropriate stage based on the current meeting stage
  switch (meetingStage) {
    case 'initial':
      return <InitialStage 
        povHolder={povHolder} 
        nominees={nominees}
        onVetoDecision={handleVetoDecision}
      />;
    case 'selectSaved':
      return <SelectSavedStage 
        eligibleToSave={getEligibleToSave()} 
        onSaveNominee={handleSaveNominee}
      />;
    case 'selectReplacement':
      return <SelectReplacementStage 
        hoh={hoh}
        eligibleReplacements={getEligibleReplacements()}
        onSelectReplacement={handleSelectReplacement}
      />;
    case 'complete':
      return <CompletedStage 
        useVeto={useVeto}
        povHolder={povHolder}
        savedNominee={savedNominee}
        replacementNominee={replacementNominee}
        hoh={hoh}
        nominees={nominees}
      />;
    default:
      return null;
  }
};

export default POVMeetingContent;
