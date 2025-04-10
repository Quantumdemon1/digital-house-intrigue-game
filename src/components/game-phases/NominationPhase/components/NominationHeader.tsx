
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import NominationCeremonyProgress from '../NominationCeremonyProgress';

interface NominationHeaderProps {
  hoh: Houseguest | null;
  isNominating: boolean;
  ceremonyComplete: boolean;
}

const NominationHeader: React.FC<NominationHeaderProps> = ({ 
  hoh,
  isNominating,
  ceremonyComplete
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl">Nomination Ceremony</CardTitle>
          <CardDescription>
            {hoh ? `Head of Household: ${hoh.name}` : 'No HOH Selected'}
          </CardDescription>
        </div>
        <NominationCeremonyProgress 
          hohName={hoh?.name}
          isNominating={isNominating}
          ceremonyComplete={ceremonyComplete}
        />
      </div>
    </CardHeader>
  );
};

export default NominationHeader;
