
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';

interface ReplacementNomineeSelectorProps {
  eligibleHouseguests: Houseguest[];
  onSelect: (replacement: Houseguest) => void;
}

const ReplacementNomineeSelector: React.FC<ReplacementNomineeSelectorProps> = ({
  eligibleHouseguests,
  onSelect
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
      {eligibleHouseguests.map(houseguest => (
        <Button 
          key={houseguest.id} 
          className="h-auto py-4 flex flex-col items-center"
          onClick={() => onSelect(houseguest)}
        >
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg mb-2">
            {houseguest.name.charAt(0)}
          </div>
          <div>{houseguest.name}</div>
        </Button>
      ))}
    </div>
  );
};

export default ReplacementNomineeSelector;
