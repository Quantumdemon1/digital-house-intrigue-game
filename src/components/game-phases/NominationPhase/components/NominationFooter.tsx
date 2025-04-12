
import React from 'react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Houseguest } from '@/models/houseguest';

export interface NominationFooterProps {
  nominees: Houseguest[];
  ceremonyComplete: boolean;
  continueToPoV: () => void;
}

const NominationFooter: React.FC<NominationFooterProps> = ({ 
  nominees, 
  ceremonyComplete,
  continueToPoV 
}) => {
  if (!ceremonyComplete) {
    return null;
  }
  
  return (
    <CardContent className="space-y-6">
      <div className="text-center mb-6">
        <Target className="h-10 w-10 mx-auto text-red-500 mb-2" />
        <h3 className="text-xl font-semibold mb-1">Nominations Complete</h3>
        <p className="text-muted-foreground">
          The Head of Household has nominated:
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        {nominees.map(nominee => (
          <div key={nominee?.id} className="bg-bb-blue text-white p-4 rounded-md text-center">
            <Target className="h-5 w-5 mx-auto text-red-500 mb-2" />
            <h4 className="font-semibold text-lg">{nominee?.name}</h4>
            <p className="text-sm font-bold text-zinc-200">{nominee?.occupation}</p>
          </div>
        ))}
      </div>
      
      <Separator className="my-6" />
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          These houseguests will compete in the Power of Veto competition for a chance to save themselves.
        </p>
        <Button 
          onClick={continueToPoV} 
          className="bg-red-600 hover:bg-red-700 text-white px-6"
        >
          Continue to Power of Veto
        </Button>
      </div>
    </CardContent>
  );
};

export default NominationFooter;
