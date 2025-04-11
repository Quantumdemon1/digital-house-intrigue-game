
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Target } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

interface NominationCeremonyResultProps {
  nominees: Houseguest[];
  hoh?: Houseguest | null;
  hohName?: string;
  onContinue?: () => void;
}

const NominationCeremonyResult: React.FC<NominationCeremonyResultProps> = ({
  nominees,
  hoh,
  hohName,
  onContinue
}) => {
  const { dispatch } = useGame();
  
  // Use either the hoh.name or the provided hohName
  const nominatorName = hoh?.name || hohName || "The HOH";
  
  // Handler for continuing to PoV - ensures the button works
  const handleContinue = () => {
    console.log("NominationCeremonyResult: Continue button clicked");
    if (onContinue) {
      console.log("NominationCeremonyResult: Calling onContinue function");
      onContinue();
    } else {
      console.log("NominationCeremonyResult: No onContinue function provided, dispatching directly");
      // Fallback if no onContinue function is provided
      dispatch({
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'continue_to_pov',
          params: {}
        }
      });
    }
  };
  
  return (
    <CardContent className="pt-6">
      <div className="flex flex-col items-center">
        <div className="bg-red-100 rounded-full p-3 mb-4">
          <Target className="w-8 h-8 text-bb-red" />
        </div>
        <h3 className="text-xl font-bold">Nominations Complete</h3>
        <p className="text-md text-muted-foreground mt-2 mb-4 text-center">
          {nominatorName} has nominated:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-2 mb-6">
          {nominees.map((nominee) => (
            <div 
              key={nominee.id} 
              className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center shadow-sm border border-border"
            >
              <div className="font-bold text-lg mb-1">{nominee.name}</div>
              <div className="text-sm text-muted-foreground">{nominee.occupation}</div>
            </div>
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground mt-2 mb-6 text-center max-w-md">
          These houseguests will compete in the Power of Veto competition 
          for a chance to save themselves from eviction.
        </div>
        
        <Button 
          onClick={handleContinue} 
          className="mt-2 bg-bb-red hover:bg-bb-red/90"
        >
          Continue to Power of Veto
        </Button>
      </div>
    </CardContent>
  );
};

export default NominationCeremonyResult;
