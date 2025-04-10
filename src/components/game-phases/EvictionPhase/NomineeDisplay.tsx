
import React from 'react';
import { Houseguest } from '@/models/houseguest';

interface NomineeDisplayProps {
  nominee: Houseguest; // Changed from nominees array to single nominee
}

const NomineeDisplay: React.FC<NomineeDisplayProps> = ({ nominee }) => {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
        {nominee.name.charAt(0)}
      </div>
      <p className="font-semibold">{nominee.name}</p>
    </div>
  );
};

export default NomineeDisplay;
