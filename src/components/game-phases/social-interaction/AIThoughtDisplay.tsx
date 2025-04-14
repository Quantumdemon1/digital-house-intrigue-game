
import React, { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { AIThoughtBubble } from '@/components/ai-feedback';
import { useAIThoughtsContext } from '@/components/ai-feedback';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit } from 'lucide-react';

interface AIThoughtDisplayProps {
  targetId?: string;
}

const AIThoughtDisplay: React.FC<AIThoughtDisplayProps> = ({ targetId }) => {
  const { game } = useGame();
  const { thoughts, isVisible, toggleVisibility } = useAIThoughtsContext();
  const [showBadge, setShowBadge] = useState(false);
  
  // Find the target houseguest if targetId is provided
  const targetHouseguest = targetId ? game?.getHouseguestById(targetId) : null;
  
  // Get thought for this houseguest if available
  const houseguestThought = targetId && thoughts[targetId] 
    ? thoughts[targetId] 
    : null;
  
  // Show badge indicator when there's a thought but it's hidden
  useEffect(() => {
    setShowBadge(houseguestThought !== null && !isVisible);
  }, [houseguestThought, isVisible]);
  
  if (!targetHouseguest || !houseguestThought) {
    return null;
  }
  
  return (
    <div className="relative my-2">
      {showBadge && (
        <Badge 
          variant="outline"
          className="absolute -top-2 -right-2 cursor-pointer bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700"
          onClick={toggleVisibility}
        >
          <BrainCircuit className="h-3 w-3 mr-1" />
          AI Thought
        </Badge>
      )}
      
      <AIThoughtBubble
        thought={houseguestThought.thought}
        isVisible={isVisible}
        character={targetHouseguest.name}
        type={houseguestThought.type}
        position="bottom"
        className="ml-4"
      />
    </div>
  );
};

export default AIThoughtDisplay;
