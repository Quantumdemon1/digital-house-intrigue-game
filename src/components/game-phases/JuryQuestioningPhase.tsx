
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, ChevronRight } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Badge } from '@/components/ui/badge';

const JuryQuestioningPhase: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const [questionsComplete, setQuestionsComplete] = useState(false);
  const [currentJuror, setCurrentJuror] = useState(0);
  const [isAsking, setIsAsking] = useState(false);
  
  // Get the final 2 houseguests
  const finalists = gameState.finalTwo || [];
  
  // Get all jury members
  const jurors = gameState.juryMembers
    .map(id => gameState.houseguests.find(hg => hg.id === id))
    .filter(Boolean) as Houseguest[];
  
  // Start jury questioning
  const startQuestioning = () => {
    setIsAsking(true);
    
    // Simulate jury questioning
    setTimeout(() => {
      setIsAsking(false);
      setCurrentJuror(prev => prev + 1);
      
      // Check if all jurors have asked their questions
      if (currentJuror >= jurors.length - 1) {
        setQuestionsComplete(true);
        
        // Log event
        dispatch({
          type: 'LOG_EVENT',
          payload: {
            week: gameState.week,
            phase: 'JuryQuestioning',
            type: 'JURY_QUESTIONING',
            description: `The jury questioned the Final 2 houseguests.`,
            involvedHouseguests: [...finalists.map(f => f.id), ...jurors.map(j => j.id)]
          }
        });
      }
    }, 3000);
  };
  
  // Continue to finale
  const continueToFinale = () => {
    // Update game state
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'complete_questioning',
        params: {}
      }
    });
    
    // Move to finale phase
    dispatch({
      type: 'SET_PHASE',
      payload: 'Finale'
    });
  };
  
  return (
    <Card className="shadow-lg border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2" /> Jury Questioning
        </CardTitle>
        <CardDescription className="text-white/90">
          Week {gameState.week} - The Final 2 Face the Jury
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">The Jury's Decision</h3>
          <p className="text-sm text-muted-foreground">
            The jury members will question the Final 2 houseguests about their game play.
            Afterward, they will vote for who they believe should win the game.
          </p>
        </div>
        
        {/* Final 2 Display */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
          <h4 className="text-center text-purple-800 font-medium mb-3">The Final 2</h4>
          <div className="flex justify-center gap-8">
            {finalists.map(finalist => (
              <div key={finalist.id} className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-200 rounded-full mb-2 flex items-center justify-center text-purple-800 text-xl font-bold">
                  {finalist.name.charAt(0)}
                </div>
                <p className="font-medium">{finalist.name}</p>
                {finalist.isPlayer && <Badge className="mt-1 bg-green-600">You</Badge>}
              </div>
            ))}
          </div>
        </div>
        
        {questionsComplete ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-green-800 font-medium">Questioning Complete</h3>
              <p className="text-sm text-green-700 mt-1">
                All jury members have asked their questions.
              </p>
            </div>
            
            <Button
              onClick={continueToFinale}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Continue to Final Vote <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Jury Members</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {jurors.map((juror, index) => (
                <div 
                  key={juror.id} 
                  className={`flex items-center p-3 rounded-lg border ${
                    index < currentJuror 
                      ? 'bg-gray-100 border-gray-200'
                      : index === currentJuror && isAsking
                      ? 'bg-blue-50 border-blue-200 animate-pulse'
                      : index === currentJuror
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                    {juror.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{juror.name}</p>
                    {index < currentJuror && (
                      <span className="text-xs text-green-600">Question asked</span>
                    )}
                    {index === currentJuror && isAsking && (
                      <span className="text-xs text-blue-600">Asking question...</span>
                    )}
                    {index === currentJuror && !isAsking && (
                      <span className="text-xs text-blue-600">Ready to ask</span>
                    )}
                    {index > currentJuror && (
                      <span className="text-xs text-gray-500">Waiting</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              {isAsking ? (
                <div className="animate-pulse">
                  <p className="text-blue-600">
                    {jurors[currentJuror]?.name} is asking their question...
                  </p>
                </div>
              ) : (
                <Button
                  onClick={startQuestioning}
                  disabled={isAsking}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {currentJuror === 0 ? 'Start Jury Questioning' : 'Next Juror Question'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JuryQuestioningPhase;
