
import React from 'react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { Trophy } from 'lucide-react';

interface ResultsSectionProps {
  winner: Houseguest;
  onContinue: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ winner, onContinue }) => {
  return (
    <div className="text-center space-y-6">
      <h3 className="text-2xl font-bold mb-4">
        The Winner of Big Brother is...
      </h3>
      
      <div className="max-w-md mx-auto p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-3xl mb-3">
          {winner.name.charAt(0)}
        </div>
        <p className="text-2xl font-bold">{winner.name}!</p>
        <Trophy className="mx-auto h-12 w-12 text-yellow-500 mt-4" />
      </div>
      
      <Button 
        className="mt-6 bg-bb-blue hover:bg-blue-700"
        onClick={onContinue}
      >
        Continue to Game Summary
      </Button>
    </div>
  );
};

export default ResultsSection;
