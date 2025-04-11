
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AIDecisionIndicatorProps {
  hohName?: string | null;
}

const AIDecisionIndicator: React.FC<AIDecisionIndicatorProps> = ({ hohName }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="h-5 w-5 animate-spin text-bb-red" />
        <span className="text-lg font-medium">
          {hohName ? `${hohName} is deciding...` : 'AI is making nominations...'}
        </span>
      </div>
      <p className="text-muted-foreground text-center max-w-md">
        The Head of Household is evaluating relationships and strategy to determine nominations.
      </p>
    </div>
  );
};

export default AIDecisionIndicator;
