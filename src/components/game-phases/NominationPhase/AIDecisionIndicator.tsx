
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AIDecisionIndicatorProps {
  hohName?: string;
}

const AIDecisionIndicator: React.FC<AIDecisionIndicatorProps> = ({ hohName }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-pulse">
        <AlertCircle className="w-12 h-12 text-bb-red" />
      </div>
      <h3 className="text-xl font-bold mt-4">Waiting for {hohName}'s Decision...</h3>
    </div>
  );
};

export default AIDecisionIndicator;
