
import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';

interface NominationFooterProps {
  nominees: Houseguest[];
  isPlayerHoh: boolean;
}

const NominationFooter: React.FC<NominationFooterProps> = ({ nominees, isPlayerHoh }) => {
  if (!isPlayerHoh) return null;
  
  return (
    <CardFooter className="border-t p-4 bg-gray-50">
      <div className="text-sm text-muted-foreground">
        <p>Selected nominees: {nominees.length}/2</p>
      </div>
    </CardFooter>
  );
};

export default NominationFooter;
