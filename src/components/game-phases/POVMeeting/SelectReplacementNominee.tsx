
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import ReplacementNomineeSelector from './ReplacementNomineeSelector';

interface SelectReplacementNomineeProps {
  eligibleHouseguests: Houseguest[];
  onSelect: (nominee: Houseguest) => void;
}

const SelectReplacementNominee: React.FC<SelectReplacementNomineeProps> = ({
  eligibleHouseguests,
  onSelect
}) => {
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Select a Replacement Nominee</h3>
      <p className="mb-4">
        As HoH, you must choose a replacement nominee.
      </p>
      
      <ReplacementNomineeSelector 
        eligibleHouseguests={eligibleHouseguests}
        onSelect={onSelect}
      />
    </div>
  );
};

export default SelectReplacementNominee;
