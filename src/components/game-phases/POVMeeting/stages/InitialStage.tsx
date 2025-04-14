
import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { AIDecisionCard } from '@/components/ai-feedback';

interface InitialStageProps {
  povHolder: Houseguest | null;
  nominees: Houseguest[];
  onVetoDecision: (useVeto: boolean) => void;
}

const InitialStage: React.FC<InitialStageProps> = ({
  povHolder,
  nominees,
  onVetoDecision
}) => {
  const [showDecisionCard, setShowDecisionCard] = useState(false);
  const nomineeNames = nominees.map(n => n.name).join(' and ');
  const isPlayerPovHolder = povHolder?.isPlayer || false;

  // Generate a random decision explanation for non-player POV holders
  const getDecisionExplanation = () => {
    if (povHolder?.isNominated) {
      return {
        decision: 'Use the Power of Veto',
        reasoning: `I'm currently on the block, so I need to use the veto to save myself. This is my chance to guarantee my safety this week.`,
      };
    }
    
    // If POV holder has alliances with nominees
    const reasons = [
      `${nominees[0].name} is my closest ally in the house. I need to use the veto to save them and maintain trust.`,
      `Using the veto would create more chaos and make others targets instead of me.`,
      `I need to prove my loyalty to ${nominees[0].name} by using the veto.`,
      `Not using the veto keeps the nominations the same and keeps me off the block.`,
      `Using the veto could put me at risk if the HoH nominates an ally of mine as a replacement.`,
      `${nominees[0].name} and ${nominees[1].name} are both bigger threats than me, so keeping them nominated is better for my game.`
    ];
    
    return {
      decision: Math.random() > 0.5 ? 'Use the Power of Veto' : 'Not Use the Power of Veto',
      reasoning: reasons[Math.floor(Math.random() * reasons.length)],
    };
  };
  
  const decisionInfo = getDecisionExplanation();
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Shield className="h-12 w-12 text-green-600 mx-auto" />
        <h3 className="text-xl font-semibold">Power of Veto Meeting</h3>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {povHolder?.name} has won the Power of Veto and must decide whether to use it to save one of the nominees: {nomineeNames}.
        </p>
      </div>
      
      {!isPlayerPovHolder && !showDecisionCard && (
        <div className="text-center mt-6">
          <Button 
            onClick={() => setShowDecisionCard(true)} 
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50"
          >
            Show {povHolder?.name}'s Decision Process
          </Button>
        </div>
      )}
      
      {!isPlayerPovHolder && showDecisionCard && (
        <div className="max-w-lg mx-auto mt-4">
          <AIDecisionCard
            houseguest={povHolder}
            decision={decisionInfo.decision}
            reasoning={decisionInfo.reasoning}
            onClose={() => setShowDecisionCard(false)}
            decisionType="Power of Veto"
          />
        </div>
      )}
      
      {isPlayerPovHolder ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h4 className="text-center font-semibold mb-4">What will you do with the Power of Veto?</h4>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => onVetoDecision(true)}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Use the Veto
              </Button>
              
              <Button 
                onClick={() => onVetoDecision(false)}
                variant="outline"
                className="border-red-500 text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Don't Use the Veto
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={() => onVetoDecision(true)} 
            className="bg-green-600 hover:bg-green-700 mr-4"
          >
            Use the Veto
          </Button>
          <Button 
            onClick={() => onVetoDecision(false)} 
            variant="outline" 
            className="border-red-500 text-red-700 hover:bg-red-50"
          >
            Don't Use the Veto
          </Button>
        </div>
      )}
    </div>
  );
};

export default InitialStage;
