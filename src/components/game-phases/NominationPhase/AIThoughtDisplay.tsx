
import React from 'react';
import { AIThoughtBubble } from '@/components/ai-feedback';
import { Houseguest } from '@/models/houseguest';

interface AIThoughtDisplayProps {
  hoh: Houseguest | null;
  nominees: Houseguest[];
  showThoughts: boolean;
}

const AIThoughtDisplay: React.FC<AIThoughtDisplayProps> = ({
  hoh,
  nominees,
  showThoughts
}) => {
  if (!hoh || nominees.length < 2 || !showThoughts) return null;
  
  // Get HOH thoughts about nominations
  const getHoHThought = (): string => {
    const nomineeNames = nominees.map(n => n.name).join(' and ');
    
    const thoughts = [
      `I nominated ${nomineeNames} because they're the biggest threats to my game right now.`,
      `I hope nominating ${nomineeNames} doesn't come back to haunt me later.`,
      `${nominees[0].name} and ${nominees[1].name} needed to go on the block this week. It was the safest move.`,
      `If one of them wins the veto, I'll have to rethink my strategy...`
    ];
    
    return thoughts[Math.floor(Math.random() * thoughts.length)];
  };
  
  return (
    <div className="my-4">
      <AIThoughtBubble
        thought={getHoHThought()}
        isVisible={showThoughts}
        character={hoh.name}
        className="max-w-lg mx-auto"
      />
    </div>
  );
};

export default AIThoughtDisplay;
