
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import TimerDisplay from '../TimerDisplay';
import NomineeSelector from '../NomineeSelector';
import AIDecisionIndicator from '../AIDecisionIndicator';

interface NominationContentProps {
  hoh: Houseguest | null;
  nominees: Houseguest[];
  potentialNominees: Houseguest[];
  timeRemaining: number;
  onTimeExpired: () => void;
  onToggleNominee: (houseguest: Houseguest) => void;
  onConfirmNominations: () => void;
  isNominating: boolean;
  totalTime: number;
}

const NominationContent: React.FC<NominationContentProps> = ({
  hoh,
  nominees,
  potentialNominees,
  timeRemaining,
  onTimeExpired,
  onToggleNominee,
  onConfirmNominations,
  isNominating,
  totalTime
}) => {
  return (
    <CardContent className="pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">
          {hoh?.isPlayer ? "Choose Two Houseguests to Nominate" : `${hoh?.name} must nominate two houseguests`}
        </h3>
        {hoh?.isPlayer ? (
          <p>
            As Head of Household, you must nominate two houseguests for eviction. 
            Select two houseguests below.
          </p>
        ) : (
          <p>
            {hoh?.name} is the Head of Household and must nominate two houseguests for eviction.
          </p>
        )}
      </div>
      
      {/* Timer Display */}
      <TimerDisplay 
        timeRemaining={timeRemaining} 
        onTimeExpired={onTimeExpired}
        totalTime={totalTime}
      />
      
      {hoh?.isPlayer ? (
        <NomineeSelector 
          potentialNominees={potentialNominees}
          nominees={nominees}
          onToggleNominee={onToggleNominee}
        />
      ) : (
        <AIDecisionIndicator hohName={hoh?.name} />
      )}
      
      {hoh?.isPlayer && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="destructive" 
            disabled={nominees.length !== 2 || isNominating}
            onClick={onConfirmNominations}
            className="bg-bb-red hover:bg-bb-red/90"
          >
            Confirm Nominations
          </Button>
        </div>
      )}
    </CardContent>
  );
};

export default NominationContent;
