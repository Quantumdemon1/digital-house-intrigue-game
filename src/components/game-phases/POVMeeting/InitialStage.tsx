
import React from 'react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';

interface InitialStageProps {
  povHolder: Houseguest | null;
  nominees: Houseguest[];
  onVetoDecision: (decision: boolean) => void;
}

const InitialStage: React.FC<InitialStageProps> = ({ 
  povHolder, 
  nominees, 
  onVetoDecision 
}) => {
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Power of Veto Meeting</h3>
      
      {povHolder && (
        <div className="max-w-md mx-auto border rounded-lg p-4 mb-6">
          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-xl mb-2">
            {povHolder.name.charAt(0)}
          </div>
          <div className="font-semibold">{povHolder.name} has the Power of Veto</div>
        </div>
      )}
      
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Current Nominees:</h4>
        <div className="flex justify-center gap-4">
          {nominees.map(nominee => (
            <div key={nominee.id} className="text-center">
              <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center text-lg mb-1">
                {nominee.name.charAt(0)}
              </div>
              <div>{nominee.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      {povHolder?.isPlayer && (
        <div className="space-x-4">
          <Button 
            className="bg-bb-green hover:bg-bb-green/80 text-bb-dark" 
            onClick={() => onVetoDecision(true)}
          >
            Use Veto
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onVetoDecision(false)}
          >
            Don't Use Veto
          </Button>
        </div>
      )}
    </div>
  );
};

export default InitialStage;
