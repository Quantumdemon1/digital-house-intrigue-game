
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AIDecisionIndicatorProps {
  hohName?: string;
}

const AIDecisionIndicator: React.FC<AIDecisionIndicatorProps> = ({ hohName }) => {
  return (
    <div className="flex flex-col items-center py-6">
      <div className="animate-spin mb-4">
        <Loader2 className="h-8 w-8 text-bb-red" />
      </div>
      <p className="text-center">
        {hohName || 'The Head of Household'} is deciding on nominations...
      </p>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        This may take a moment
      </p>
    </div>
  );
};

export default AIDecisionIndicator;
