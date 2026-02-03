
import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { AIDecisionCard } from '@/components/ai-feedback';
import { StatusAvatar } from '@/components/ui/status-avatar';

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

  const getDecisionExplanation = () => {
    if (povHolder?.isNominated) {
      return {
        decision: 'Use the Power of Veto',
        reasoning: `I'm currently on the block, so I need to use the veto to save myself. This is my chance to guarantee my safety this week.`,
      };
    }
    
    // Safely get nominee names with fallbacks
    const nominee1Name = nominees[0]?.name || 'the first nominee';
    const nominee2Name = nominees[1]?.name || 'the second nominee';
    
    const reasons = [
      `${nominee1Name} is my closest ally in the house. I need to use the veto to save them and maintain trust.`,
      `Using the veto would create more chaos and make others targets instead of me.`,
      `I need to prove my loyalty to ${nominee1Name} by using the veto.`,
      `Not using the veto keeps the nominations the same and keeps me off the block.`,
      `Using the veto could put me at risk if the HoH nominates an ally of mine as a replacement.`,
      `${nominee1Name} and ${nominee2Name} are both bigger threats than me, so keeping them nominated is better for my game.`
    ];
    
    return {
      decision: Math.random() > 0.5 ? 'Use the Power of Veto' : 'Not Use the Power of Veto',
      reasoning: reasons[Math.floor(Math.random() * reasons.length)],
    };
  };
  
  const decisionInfo = getDecisionExplanation();
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-bb-green/20 to-bb-gold/20">
          <Shield className="h-12 w-12 text-bb-green" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground">Power of Veto Meeting</h3>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {povHolder?.name} has won the Power of Veto and must decide whether to use it to save one of the nominees.
        </p>
      </div>
      
      {/* POV Holder and Nominees Display */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* POV Holder */}
        <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-b from-bb-green/10 to-card border border-bb-green/20">
          <StatusAvatar
            name={povHolder?.name || 'Unknown'}
            imageUrl={povHolder?.imageUrl}
            status="pov"
            size="lg"
            className="mb-3"
          />
          <span className="font-semibold text-lg text-foreground">{povHolder?.name}</span>
          <span className="text-sm text-bb-green font-medium">PoV Holder</span>
        </div>
        
        {/* Sparkles divider */}
        <div className="flex items-center">
          <Sparkles className="h-6 w-6 text-bb-gold animate-pulse" />
        </div>
        
        {/* Nominees */}
        <div className="flex gap-4">
          {nominees.map(nominee => (
            <div key={nominee.id} className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-b from-bb-red/10 to-card border border-bb-red/20">
              <StatusAvatar
                name={nominee.name}
                imageUrl={nominee.imageUrl}
                status="nominee"
                size="md"
                className="mb-2"
              />
              <span className="font-medium text-foreground">{nominee.name}</span>
              <span className="text-xs text-bb-red">Nominee</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI Decision Card for non-player */}
      {!isPlayerPovHolder && !showDecisionCard && (
        <div className="text-center">
          <Button 
            onClick={() => setShowDecisionCard(true)} 
            variant="outline"
            className="border-bb-green/30 text-bb-green hover:bg-bb-green/10"
          >
            Show {povHolder?.name}'s Decision Process
          </Button>
        </div>
      )}
      
      {!isPlayerPovHolder && showDecisionCard && (
        <div className="max-w-lg mx-auto">
          <AIDecisionCard
            houseguest={povHolder}
            decision={decisionInfo.decision}
            reasoning={decisionInfo.reasoning}
            onClose={() => setShowDecisionCard(false)}
            decisionType="Power of Veto"
          />
        </div>
      )}
      
      {/* Player Decision */}
      {isPlayerPovHolder ? (
        <div className="p-6 rounded-xl bg-gradient-to-b from-bb-green/10 to-card border border-bb-green/20 max-w-md mx-auto">
          <h4 className="text-center font-semibold text-lg mb-6 text-foreground">
            What will you do with the Power of Veto?
          </h4>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => onVetoDecision(true)}
              size="lg"
              className="bg-bb-green hover:bg-bb-green/90 text-white"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Use the Veto
            </Button>
            
            <Button 
              onClick={() => onVetoDecision(false)}
              size="lg"
              variant="outline"
              className="border-bb-red/50 text-bb-red hover:bg-bb-red/10"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Don't Use
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => onVetoDecision(true)} 
            size="lg"
            className="bg-bb-green hover:bg-bb-green/90 text-white"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Use the Veto
          </Button>
          <Button 
            onClick={() => onVetoDecision(false)} 
            size="lg"
            variant="outline" 
            className="border-bb-red/50 text-bb-red hover:bg-bb-red/10"
          >
            <XCircle className="h-5 w-5 mr-2" />
            Don't Use
          </Button>
        </div>
      )}
    </div>
  );
};

export default InitialStage;
