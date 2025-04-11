
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import ReplacementNomineeSelector from '../ReplacementNomineeSelector';

interface SelectReplacementStageProps {
  hoh: Houseguest | null;
  eligibleReplacements: Houseguest[];
  onSelectReplacement: (nominee: Houseguest) => void;
}

const SelectReplacementStage: React.FC<SelectReplacementStageProps> = ({ 
  hoh, 
  eligibleReplacements,
  onSelectReplacement 
}) => {
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Select a Replacement Nominee</h3>
      <p className="mb-4">
        As HoH, you must choose a replacement nominee.
      </p>
      
      <ReplacementNomineeSelector 
        eligibleHouseguests={eligibleReplacements}
        onSelect={onSelectReplacement}
      />
    </div>
  );
};

export default SelectReplacementStage;
