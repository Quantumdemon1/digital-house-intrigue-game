
import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';

interface InteractionsCounterProps {
  interactionsRemaining: number;
  maxInteractions?: number;
}

const InteractionsCounter: React.FC<InteractionsCounterProps> = ({ 
  interactionsRemaining,
  maxInteractions = 5 
}) => {
  const progressPercent = (interactionsRemaining / maxInteractions) * 100;
  const isLow = interactionsRemaining <= 1;
  const isEmpty = interactionsRemaining <= 0;

  return (
    <div className={`
      p-4 rounded-xl border transition-all duration-300
      ${isEmpty 
        ? 'bg-bb-red/10 border-bb-red/30' 
        : isLow 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-bb-blue/5 border-bb-blue/20'
      }
    `}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isEmpty ? (
            <AlertCircle className="h-4 w-4 text-bb-red" />
          ) : (
            <Zap className={`h-4 w-4 ${isLow ? 'text-amber-500' : 'text-bb-blue'}`} />
          )}
          <span className={`text-sm font-medium ${isEmpty ? 'text-bb-red' : isLow ? 'text-amber-600' : 'text-foreground'}`}>
            Interactions Available
          </span>
        </div>
        <span className={`
          font-mono text-lg font-bold
          ${isEmpty ? 'text-bb-red' : isLow ? 'text-amber-500' : 'text-bb-blue'}
        `}>
          {interactionsRemaining}
        </span>
      </div>
      
      {/* Custom Progress Bar */}
      <div className={`h-2 rounded-full overflow-hidden ${isEmpty ? 'bg-bb-red/20' : isLow ? 'bg-amber-500/20' : 'bg-bb-blue/20'}`}>
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isEmpty ? 'bg-bb-red' : isLow ? 'bg-amber-500' : 'bg-bb-blue'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {isEmpty && (
        <p className="text-xs text-bb-red mt-2">
          No more actions available this phase. Advance to continue.
        </p>
      )}
    </div>
  );
};

export default InteractionsCounter;
