
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { usePOVMeeting } from './usePOVMeeting';
import InitialStage from './InitialStage';
import SelectSavedNominee from './SelectSavedNominee';
import SelectReplacementNominee from './SelectReplacementNominee';
import MeetingResults from './MeetingResults';

const POVMeeting: React.FC = () => {
  const {
    meetingStage,
    povHolder,
    nominees,
    handleVetoDecision,
    handleSaveNominee,
    handleSelectReplacement,
    getEligibleToSave,
    getEligibleReplacements,
    hoh,
    useVeto,
    savedNominee,
    replacementNominee
  } = usePOVMeeting();
  
  return (
    <Card className="shadow-lg border-bb-green">
      <CardHeader className="bg-bb-green text-bb-dark">
        <CardTitle className="flex items-center">
          <Shield className="mr-2" /> Power of Veto Meeting
        </CardTitle>
        <CardDescription className="text-bb-dark/80">
          Week {/* Get week from context */}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {meetingStage === 'initial' && (
          <InitialStage
            povHolder={povHolder}
            nominees={nominees}
            onVetoDecision={handleVetoDecision}
          />
        )}
        
        {meetingStage === 'selectSaved' && (
          <SelectSavedNominee
            eligibleNominees={getEligibleToSave()}
            onSaveNominee={handleSaveNominee}
          />
        )}
        
        {meetingStage === 'selectReplacement' && hoh?.isPlayer && (
          <SelectReplacementNominee 
            eligibleHouseguests={getEligibleReplacements()}
            onSelect={handleSelectReplacement}
          />
        )}
        
        {meetingStage === 'complete' && (
          <MeetingResults
            useVeto={useVeto}
            povHolder={povHolder}
            savedNominee={savedNominee}
            replacementNominee={replacementNominee}
            hoh={hoh}
            nominees={nominees}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default POVMeeting;
