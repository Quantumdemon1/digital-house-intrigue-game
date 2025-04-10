
import React from 'react';
import { Houseguest } from '@/models/houseguest';

interface NomineeDisplayProps {
  nominees: Houseguest[];
}

const NomineeDisplay: React.FC<NomineeDisplayProps> = ({ nominees }) => {
  return (
    <div className="flex justify-center items-center gap-10 my-6">
      {nominees.map(nominee => (
        <div key={nominee.id} className="text-center">
          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
            {nominee.name.charAt(0)}
          </div>
          <p className="font-semibold">{nominee.name}</p>
        </div>
      ))}
    </div>
  );
};

export default NomineeDisplay;
