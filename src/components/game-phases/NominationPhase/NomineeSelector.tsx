
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { Badge } from '@/components/ui/badge';

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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
      {potentialNominees.map(houseguest => {
        const isSelected = nominees.some(nominee => nominee.id === houseguest.id);
        return (
          <div 
            key={houseguest.id} 
            className={`border rounded-lg p-3 cursor-pointer transition-all ${
              isSelected ? 'border-bb-red bg-red-50' : 'hover:border-gray-400'
            }`}
            onClick={() => onToggleNominee(houseguest)}
          >
            <div className="flex flex-col items-center">
              <div className="camera-lens w-12 h-12 mb-2">
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
                  {houseguest.name.charAt(0)}
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{houseguest.name}</p>
                {isSelected && (
                  <Badge variant="destructive" className="mt-1">
                    Nominated
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NomineeSelector;
