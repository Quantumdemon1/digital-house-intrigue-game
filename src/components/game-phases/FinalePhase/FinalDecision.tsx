
import React from 'react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { Crown } from 'lucide-react';

interface FinalDecisionProps {
  finalHoH: Houseguest;
  activeHouseguests: Houseguest[];
  handleFinalHoHDecision: (selectedHouseguest: Houseguest) => void;
}

const FinalDecision: React.FC<FinalDecisionProps> = ({ 
  finalHoH, 
  activeHouseguests,
  handleFinalHoHDecision
}) => {
  return (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-bold mb-2">Your Final Decision</h3>
      <div className="bg-blue-50 p-3 rounded-md">
        <Crown className="inline-block text-bb-blue mr-1" />
        <span>As the Final HoH, you must choose who to take to the final 2</span>
      </div>
      
      <p className="text-muted-foreground">
        Choose carefully! The jury will vote between you and your chosen finalist.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto">
        {activeHouseguests.filter(hg => hg.id !== finalHoH.id).map(houseguest => (
          <div key={houseguest.id} className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-3">
              {houseguest.name.charAt(0)}
            </div>
            <p className="font-semibold mb-3">{houseguest.name}</p>
            <Button
              variant="outline"
              className="border-2 hover:border-bb-blue"
              onClick={() => handleFinalHoHDecision(houseguest)}
            >
              Take to Final 2
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinalDecision;
