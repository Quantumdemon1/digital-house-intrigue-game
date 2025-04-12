
import React from 'react';

interface InteractionsCounterProps {
  interactionsRemaining: number;
}

const InteractionsCounter: React.FC<InteractionsCounterProps> = ({ interactionsRemaining }) => {
  return (
    <div className="text-center font-medium text-blue-700 dark:text-blue-300">
      Interactions Available: {interactionsRemaining}
    </div>
  );
};

export default InteractionsCounter;
