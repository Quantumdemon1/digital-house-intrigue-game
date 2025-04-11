
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { UserMinus, UserPlus } from 'lucide-react';

interface CompletedStageProps {
  useVeto: boolean | null;
  povHolder: Houseguest | null;
  savedNominee: Houseguest | null;
  replacementNominee: Houseguest | null;
  hoh: Houseguest | null;
  nominees: Houseguest[];
}

const CompletedStage: React.FC<CompletedStageProps> = ({
  useVeto,
  povHolder,
  savedNominee,
  replacementNominee,
  hoh,
  nominees
}) => {
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Veto Meeting Results</h3>
      
      {useVeto ? (
        <>
          <div className="mb-6">
            <p className="mb-2">
              <span className="font-semibold">{povHolder?.name}</span> used the Power of Veto on{' '}
              <span className="font-semibold">{savedNominee?.name}</span>
            </p>
            
            <p>
              <span className="font-semibold">{hoh?.name}</span> named{' '}
              <span className="font-semibold">{replacementNominee?.name}</span> as the replacement nominee
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-6">
            <div>
              <h4 className="font-semibold mb-2">Current Nominees</h4>
              <div className="flex flex-col items-center gap-4">
                {nominees.filter(nom => nom.id !== savedNominee?.id).map(nominee => (
                  <div key={nominee.id} className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-lg mb-1">
                      {nominee.name.charAt(0)}
                    </div>
                    <div>{nominee.name}</div>
                  </div>
                ))}
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-lg mb-1">
                    {replacementNominee?.name.charAt(0)}
                  </div>
                  <div>{replacementNominee?.name}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Saved</h4>
              <div className="flex flex-col items-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg mb-1">
                    {savedNominee?.name.charAt(0)}
                  </div>
                  <div>{savedNominee?.name}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>
          <p className="mb-6">
            <span className="font-semibold">{povHolder?.name}</span> decided not to use the Power of Veto.
            The nominations remain the same.
          </p>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Current Nominees:</h4>
            <div className="flex justify-center gap-4">
              {nominees.map(nominee => (
                <div key={nominee.id} className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-lg mb-1">
                    {nominee.name.charAt(0)}
                  </div>
                  <div>{nominee.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="text-muted-foreground mt-6">
        <p>Moving to the Eviction Phase...</p>
      </div>
    </div>
  );
};

export default CompletedStage;
