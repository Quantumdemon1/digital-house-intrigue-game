
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { Crown } from 'lucide-react';

interface NominationHeaderProps {
  hoh: Houseguest | null;
  ceremonyComplete?: boolean;
}

const NominationHeader: React.FC<NominationHeaderProps> = ({ 
  hoh,
  ceremonyComplete
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Crown className="h-5 w-5 text-bb-gold" /> 
            Nomination Ceremony
          </CardTitle>
          <CardDescription>
            {hoh ? `Head of Household: ${hoh.name}` : 'No HOH Selected'}
            {ceremonyComplete && ' • Nominations Complete'}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
};

export default NominationHeader;
