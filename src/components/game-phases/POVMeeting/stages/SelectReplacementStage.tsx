
import React, { useState } from 'react';
import { Crown, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { AIDecisionCard } from '@/components/ai-feedback';

interface SelectReplacementStageProps {
  hoh: Houseguest | null;
  eligibleReplacements: Houseguest[];
  onSelectReplacement: (replacement: Houseguest) => void;
}

const SelectReplacementStage: React.FC<SelectReplacementStageProps> = ({
  hoh,
  eligibleReplacements,
  onSelectReplacement
}) => {
  const [showDecisionCard, setShowDecisionCard] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState<Houseguest | null>(null);
  const isPlayerHoh = hoh?.isPlayer || false;
  
  // Generate a decision explanation for the HoH
  const getDecisionExplanation = (target: Houseguest) => {
    const reasons = [
      `${target.name} is the biggest threat to my game right now.`,
      `${target.name} hasn't been very loyal to me this week.`,
      `Putting ${target.name} on the block will keep my alliance safe.`,
      `${target.name} is a strong competitor and this is my chance to take them out.`,
      `${target.name} is a strategic player who needs to be nominated.`,
      `I need to make a big move, and nominating ${target.name} is the right decision.`
    ];
    
    return {
      decision: `Nominate ${target.name} as replacement`,
      reasoning: reasons[Math.floor(Math.random() * reasons.length)],
    };
  };
  
  // Set a random selection for the AI decision card
  const handleShowDecision = () => {
    const randomHouseguest = eligibleReplacements[Math.floor(Math.random() * eligibleReplacements.length)];
    setSelectedReplacement(randomHouseguest);
    setShowDecisionCard(true);
  };
  
  const decisionInfo = selectedReplacement ? getDecisionExplanation(selectedReplacement) : null;
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Crown className="h-12 w-12 text-amber-600 mx-auto" />
        <h3 className="text-xl font-semibold">Select Replacement Nominee</h3>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {hoh?.name} must select a replacement nominee.
        </p>
      </div>
      
      {!isPlayerHoh && !showDecisionCard && (
        <div className="text-center mt-6">
          <Button 
            onClick={handleShowDecision} 
            variant="outline"
            className="border-amber-500 text-amber-700 hover:bg-amber-50"
          >
            Show {hoh?.name}'s Decision Process
          </Button>
        </div>
      )}
      
      {!isPlayerHoh && showDecisionCard && selectedReplacement && decisionInfo && (
        <div className="max-w-lg mx-auto mt-4">
          <AIDecisionCard
            houseguest={hoh}
            decision={decisionInfo.decision}
            reasoning={decisionInfo.reasoning}
            onClose={() => {
              setShowDecisionCard(false);
              onSelectReplacement(selectedReplacement);
            }}
            decisionType="Replacement Nomination"
          />
        </div>
      )}
      
      {(!showDecisionCard || isPlayerHoh) && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="pt-6">
            <h4 className="text-center font-semibold mb-4">
              {isPlayerHoh ? "Choose a replacement nominee:" : "Available houseguests for nomination:"}
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {eligibleReplacements.map(houseguest => (
                <Button
                  key={houseguest.id}
                  onClick={() => onSelectReplacement(houseguest)}
                  variant="outline"
                  className="flex flex-col h-auto py-3 border-amber-200 hover:bg-amber-100 hover:text-amber-900"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    {houseguest.name.charAt(0)}
                  </div>
                  <span>{houseguest.name}</span>
                  <span className="text-xs text-muted-foreground">{houseguest.occupation}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SelectReplacementStage;
