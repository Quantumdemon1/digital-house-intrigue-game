
import React, { useState } from 'react';
import { AIDecisionCard } from '@/components/ai-feedback';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { Brain } from 'lucide-react';

interface VoterDecisionDisplayProps {
  voter: Houseguest;
  nominees: Houseguest[];
  onDecisionComplete: () => void;
}

const VoterDecisionDisplay: React.FC<VoterDecisionDisplayProps> = ({
  voter,
  nominees,
  onDecisionComplete
}) => {
  const [showDecision, setShowDecision] = useState(false);
  const [selectedNominee] = useState(nominees[Math.floor(Math.random() * nominees.length)]);

  const getDecisionReasoning = () => {
    const reasons = [
      `${selectedNominee.name} is a bigger threat to my game.`,
      `I have a closer alliance with ${nominees.find(n => n.id !== selectedNominee.id)?.name}.`,
      `${selectedNominee.name} hasn't been loyal to our alliance.`,
      `I need to vote with the house this week to avoid making waves.`,
      `This is a strategic vote to break up a strong duo in the house.`,
      `${selectedNominee.name} is too good at competitions and needs to go.`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const decision = `Vote to evict ${selectedNominee.name}`;
  const reasoning = getDecisionReasoning();

  return (
    <div className="my-2">
      {!showDecision ? (
        <Button
          variant="outline"
          size="sm"
          className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-1"
          onClick={() => setShowDecision(true)}
        >
          <Brain className="h-3 w-3" /> Show {voter.name}'s thought process
        </Button>
      ) : (
        <div className="my-4">
          <AIDecisionCard
            houseguest={voter}
            decision={decision}
            reasoning={reasoning}
            onClose={() => {
              setShowDecision(false);
              onDecisionComplete();
            }}
            decisionType="Eviction Vote"
          />
        </div>
      )}
    </div>
  );
};

export default VoterDecisionDisplay;
