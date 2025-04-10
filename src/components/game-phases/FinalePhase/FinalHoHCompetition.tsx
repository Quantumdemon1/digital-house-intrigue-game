
import React from 'react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';

interface FinalHoHCompetitionProps {
  activeHouseguests: Houseguest[];
  startFinalHoHCompetition: () => void;
}

const FinalHoHCompetition: React.FC<FinalHoHCompetitionProps> = ({ 
  activeHouseguests, 
  startFinalHoHCompetition 
}) => {
  return (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-bold mb-4">Final 3 HoH Competition</h3>
      <p className="text-muted-foreground">
        The final Head of Household will choose who to take to the final 2.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {activeHouseguests.map(houseguest => (
          <div 
            key={houseguest.id}
            className="border rounded-md p-4 flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
              {houseguest.name.charAt(0)}
            </div>
            <p className="font-semibold">{houseguest.name}</p>
            {houseguest.isPlayer && (
              <span className="text-sm text-green-600">You</span>
            )}
          </div>
        ))}
      </div>
      
      <Button 
        className="bg-bb-blue hover:bg-blue-700"
        onClick={startFinalHoHCompetition}
      >
        Start Final HoH Competition
      </Button>
    </div>
  );
};

export default FinalHoHCompetition;
