
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface NomineeSelectorProps {
  potentialNominees: Houseguest[];
  nominees: Houseguest[];
  onToggleNominee: (houseguest: Houseguest) => void;
}

const NomineeSelector: React.FC<NomineeSelectorProps> = ({
  potentialNominees,
  nominees,
  onToggleNominee
}) => {
  const isSelected = (houseguest: Houseguest) => {
    return nominees.some(nominee => nominee.id === houseguest.id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
      {potentialNominees.map(houseguest => (
        <Button
          key={houseguest.id}
          variant={isSelected(houseguest) ? "default" : "outline"}
          className={`h-auto py-3 justify-start ${
            isSelected(houseguest) ? "bg-bb-red hover:bg-bb-red/90 text-white" : ""
          }`}
          onClick={() => onToggleNominee(houseguest)}
        >
          <div className="flex items-center w-full">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              {houseguest.name.charAt(0)}
            </div>
            <span className="flex-grow text-left">{houseguest.name}</span>
            {isSelected(houseguest) && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default NomineeSelector;
