
import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle, ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';
import { AIDecisionCard } from '@/components/ai-feedback';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface CompletedStageProps {
  useVeto: boolean;
  povHolder: Houseguest | null;
  savedNominee: Houseguest | null;
  replacementNominee: Houseguest | null;
  hoh: Houseguest | null;
  nominees: Houseguest[];
}

const CompletedStage: React.FC<CompletedStageProps> = ({
  useVeto,
  povHolder,
  savedNominee,
  replacementNominee,
  hoh,
  nominees
}) => {
  const { dispatch } = useGame();
  const [showDecisionSummary, setShowDecisionSummary] = useState(false);
  
  const handleContinue = () => {
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_eviction',
        params: {}
      }
    });
  };

  const currentNominees = useVeto
    ? nominees.map(nominee => (nominee.id === savedNominee?.id ? replacementNominee : nominee))
    : nominees;

  const filteredNominees = currentNominees.filter(Boolean);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center items-center gap-3">
          <Shield className="h-8 w-8 text-bb-green" />
          <h3 className="text-2xl font-display font-bold text-foreground">Meeting Complete</h3>
          <Shield className="h-8 w-8 text-bb-green" />
        </div>
      </div>
      
      {/* Decision Result */}
      <div className="max-w-md mx-auto p-6 rounded-xl border bg-gradient-to-b from-card to-muted/20">
        <h4 className="font-semibold text-lg text-center mb-4 text-foreground">
          {povHolder?.name}'s Decision
        </h4>
        
        <div className="flex justify-center mb-6">
          {useVeto ? (
            <div className="flex items-center gap-2 bg-bb-green/10 text-bb-green px-4 py-2 rounded-full font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              Used the Power of Veto
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-full font-semibold">
              <XCircle className="h-5 w-5" />
              Did Not Use the Veto
            </div>
          )}
        </div>
        
        {useVeto && savedNominee && (
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center p-3 rounded-lg bg-bb-green/10 border border-bb-green/20">
                <StatusAvatar name={savedNominee.name} status="safe" size="md" />
                <span className="text-sm font-medium mt-2 text-bb-green">Saved</span>
                <span className="text-xs text-muted-foreground">{savedNominee.name}</span>
              </div>
              
              {replacementNominee && (
                <>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <div className="flex flex-col items-center p-3 rounded-lg bg-bb-red/10 border border-bb-red/20">
                    <StatusAvatar name={replacementNominee.name} status="nominee" size="md" />
                    <span className="text-sm font-medium mt-2 text-bb-red">Replacement</span>
                    <span className="text-xs text-muted-foreground">{replacementNominee.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* AI Decision Summary */}
      {!showDecisionSummary && (
        <div className="text-center">
          <Button 
            onClick={() => setShowDecisionSummary(true)} 
            variant="outline"
            className="border-bb-blue/30 text-bb-blue hover:bg-bb-blue/10"
          >
            Show Decision Process
          </Button>
        </div>
      )}
      
      {showDecisionSummary && (
        <div className="max-w-lg mx-auto space-y-4">
          <AIDecisionCard
            houseguest={povHolder}
            decision={useVeto ? "Use the Power of Veto" : "Not Use the Power of Veto"}
            reasoning={
              useVeto 
                ? savedNominee?.isPlayer 
                  ? "I need to save the player since they're an important ally." 
                  : `I decided to save ${savedNominee?.name} to build trust and create a stronger alliance.`
                : "I chose not to use the veto to avoid making waves and keep myself safe for the week."
            }
            closeable={false}
            decisionType="Power of Veto"
          />
          
          {useVeto && replacementNominee && (
            <AIDecisionCard
              houseguest={hoh}
              decision={`Nominate ${replacementNominee.name}`}
              reasoning={`${replacementNominee.name} is the best strategic choice for a replacement nominee because they pose a threat to my game.`}
              closeable={false}
              decisionType="Replacement Nomination"
            />
          )}
        </div>
      )}
      
      <Separator />
      
      {/* Current Nominees */}
      <div className="p-6 rounded-xl bg-gradient-to-b from-bb-red/10 to-card border border-bb-red/20">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Target className="h-5 w-5 text-bb-red" />
          <h4 className="font-semibold text-lg text-foreground">Final Nominees</h4>
        </div>
        <div className="flex justify-center gap-6">
          {filteredNominees.map(nominee => nominee && (
            <div key={nominee.id} className="flex flex-col items-center">
              <StatusAvatar
                name={nominee.name}
                imageUrl={nominee.imageUrl}
                status="nominee"
                size="lg"
              />
              <span className="font-medium mt-2">{nominee.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Continue Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleContinue} 
          size="lg"
          className="bg-bb-blue hover:bg-bb-blue/90 text-white"
        >
          Continue to Eviction
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CompletedStage;
