
import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';
import { AIDecisionCard } from '@/components/ai-feedback';

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
  
  // Continue to Eviction Phase
  const handleContinue = () => {
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_eviction',
        params: {}
      }
    });
  };

  // Get current nominees after the meeting
  const currentNominees = useVeto
    ? nominees.map(nominee => (nominee.id === savedNominee?.id ? replacementNominee : nominee))
    : nominees;

  const filteredNominees = currentNominees.filter(Boolean);
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center">
          <Shield className="h-10 w-10 text-green-600" />
          <h3 className="text-xl font-semibold mx-2">Meeting Results</h3>
          <Shield className="h-10 w-10 text-green-600" />
        </div>
        
        <Card className="border-green-200 mb-6">
          <CardContent className="py-6">
            <h4 className="font-semibold text-lg text-center mb-4">
              {povHolder?.name}'s Decision:
            </h4>
            
            <div className="flex justify-center items-center">
              {useVeto ? (
                <div className="flex items-center justify-center bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Used the Power of Veto</span>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
                  <XCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Did Not Use the Power of Veto</span>
                </div>
              )}
            </div>
            
            {useVeto && savedNominee && (
              <div className="mt-4 text-center">
                <p className="mb-2">Removed from the block:</p>
                <div className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-lg">
                  {savedNominee.name}
                </div>
              </div>
            )}
            
            {useVeto && replacementNominee && (
              <div className="mt-4 text-center">
                <p className="mb-2">Replacement nominee:</p>
                <div className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-lg">
                  {replacementNominee.name}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {!showDecisionSummary && (
          <Button 
            onClick={() => setShowDecisionSummary(true)} 
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            Show Decision Process
          </Button>
        )}
        
        {showDecisionSummary && (
          <div className="max-w-lg mx-auto mt-4 space-y-4">
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
      </div>
      
      <Separator />
      
      <div className="bg-red-50 p-4 rounded-md">
        <h4 className="font-semibold text-center mb-3">Current Nominees</h4>
        <div className="flex justify-center gap-4">
          {filteredNominees.map(nominee => nominee && (
            <div key={nominee.id} className="bg-red-100 px-3 py-2 rounded-md flex items-center">
              <User className="h-4 w-4 mr-2 text-red-600" />
              <span>{nominee.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleContinue} 
          className="bg-bb-blue hover:bg-blue-700 text-white"
        >
          Continue to Eviction <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CompletedStage;
