import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Crown, UserX } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

type FinaleStage = 'HoHCompetition' | 'FinalDecision' | 'JuryVote' | 'Results';

const FinalePhase: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const { toast } = useToast();
  const [stage, setStage] = useState<FinaleStage>('HoHCompetition');
  const [finalHoH, setFinalHoH] = useState<Houseguest | null>(null);
  const [finalist, setFinalist] = useState<Houseguest | null>(null);
  const [evicted, setEvicted] = useState<Houseguest | null>(null);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  
  const activeHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active');
  const player = activeHouseguests.find(hg => hg.isPlayer);
  
  const startFinalHoHCompetition = () => {
    const getCompScore = (houseguest: Houseguest) => {
      const baseScore = (
        houseguest.stats.physical + 
        houseguest.stats.mental + 
        houseguest.stats.endurance + 
        houseguest.stats.social + 
        houseguest.stats.luck
      ) / 5;
      
      return baseScore * (0.75 + Math.random() * 0.5);
    };
    
    const scores = activeHouseguests.map(hg => ({
      houseguest: hg,
      score: getCompScore(hg)
    })).sort((a, b) => b.score - a.score);
    
    const winner = scores[0].houseguest;
    setFinalHoH(winner);
    
    dispatch({ type: 'SET_HOH', payload: winner });
    
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: gameState.phase,
        type: 'COMPETITION_WIN',
        description: `${winner.name} has won the final Head of Household competition!`,
        involvedHouseguests: [winner.id]
      }
    });
    
    toast({
      title: "Final HoH Winner!",
      description: `${winner.name} has won the final Head of Household competition!`,
    });
    
    if (winner.isPlayer) {
      setStage('FinalDecision');
    } else {
      setTimeout(() => {
        const otherFinalists = activeHouseguests.filter(hg => hg.id !== winner.id);
        const { getRelationship } = useGame();
        
        let chosenFinalist: Houseguest;
        let evictedFinalist: Houseguest;
        
        if (otherFinalists.length === 2) {
          const rel1 = getRelationship(winner.id, otherFinalists[0].id);
          const rel2 = getRelationship(winner.id, otherFinalists[1].id);
          
          if (rel1 >= rel2) {
            chosenFinalist = otherFinalists[0];
            evictedFinalist = otherFinalists[1];
          } else {
            chosenFinalist = otherFinalists[1];
            evictedFinalist = otherFinalists[0];
          }
          
          setFinalist(chosenFinalist);
          setEvicted(evictedFinalist);
          
          dispatch({
            type: 'LOG_EVENT',
            payload: {
              week: gameState.week,
              phase: gameState.phase,
              type: 'eviction',
              description: `${winner.name} has chosen to evict ${evictedFinalist.name}.`,
              involvedHouseguests: [winner.id, evictedFinalist.id]
            }
          });
          
          dispatch({
            type: 'EVICT_HOUSEGUEST',
            payload: {
              evicted: evictedFinalist,
              toJury: true
            }
          });
          
          setTimeout(() => {
            setStage('JuryVote');
            determineWinner(winner, chosenFinalist);
          }, 3000);
        }
      }, 3000);
    }
  };
  
  const handleFinalHoHDecision = (selectedHouseguest: Houseguest) => {
    const evictedHouseguest = activeHouseguests.find(
      hg => hg.id !== finalHoH!.id && hg.id !== selectedHouseguest.id
    )!;
    
    setFinalist(selectedHouseguest);
    setEvicted(evictedHouseguest);
    
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: gameState.phase,
        type: 'eviction',
        description: `${finalHoH!.name} has chosen to evict ${evictedHouseguest.name}.`,
        involvedHouseguests: [finalHoH!.id, evictedHouseguest.id]
      }
    });
    
    dispatch({
      type: 'EVICT_HOUSEGUEST',
      payload: {
        evicted: evictedHouseguest,
        toJury: true
      }
    });
    
    toast({
      title: "Final Eviction",
      description: `You have evicted ${evictedHouseguest.name} from the house.`,
    });
    
    setTimeout(() => {
      setStage('JuryVote');
      determineWinner(finalHoH!, selectedHouseguest);
    }, 3000);
  };
  
  const determineWinner = (finalist1: Houseguest, finalist2: Houseguest) => {
    const { getRelationship } = useGame();
    const jury = gameState.juryMembers;
    
    let votes1 = 0;
    let votes2 = 0;
    
    jury.forEach(juror => {
      const rel1 = getRelationship(juror.id, finalist1.id);
      const rel2 = getRelationship(juror.id, finalist2.id);
      
      const adjustedRel1 = rel1 + (Math.random() * 20 - 10);
      const adjustedRel2 = rel2 + (Math.random() * 20 - 10);
      
      if (adjustedRel1 > adjustedRel2) {
        votes1++;
      } else {
        votes2++;
      }
    });
    
    const gameWinner = votes1 > votes2 ? finalist1 : finalist2;
    const runnerUp = votes1 > votes2 ? finalist2 : finalist1;
    
    setWinner(gameWinner);
    
    dispatch({
      type: 'END_GAME',
      payload: {
        winner: gameWinner,
        runnerUp: runnerUp
      }
    });
    
    toast({
      title: "We Have a Winner!",
      description: `${gameWinner.name} has won Big Brother!`,
    });
    
    if (gameWinner.isPlayer) {
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });
      }, 500);
    }
    
    setStage('Results');
  };
  
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2" /> Season Finale
        </CardTitle>
        <CardDescription className="text-white/80">
          Final Week
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {stage === 'HoHCompetition' && (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-bold mb-4">Final 3 HOH Competition</h3>
            <p className="text-muted-foreground">
              The final Head of Household will choose who to take to the final 2.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {activeHouseguests.map(houseguest => (
                <div 
                  key={houseguest.id}
                  className="border rounded-md p-4 flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
                    {houseguest.name.charAt(0)}
                  </div>
                  <p className="font-semibold">{houseguest.name}</p>
                  {houseguest.isPlayer && (
                    <span className="text-sm text-green-600">You</span>
                  )}
                </div>
              ))}
            </div>
            
            <Button 
              className="bg-bb-blue hover:bg-blue-700"
              onClick={startFinalHoHCompetition}
            >
              Start Final HoH Competition
            </Button>
          </div>
        )}
        
        {stage === 'FinalDecision' && finalHoH && finalHoH.isPlayer && (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-bold mb-2">Your Final Decision</h3>
            <div className="bg-blue-50 p-3 rounded-md">
              <Crown className="inline-block text-bb-blue mr-1" />
              <span>As the Final HoH, you must choose who to take to the final 2</span>
            </div>
            
            <p className="text-muted-foreground">
              Choose carefully! The jury will vote between you and your chosen finalist.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto">
              {activeHouseguests.filter(hg => hg.id !== finalHoH.id).map(houseguest => (
                <div key={houseguest.id} className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-3">
                    {houseguest.name.charAt(0)}
                  </div>
                  <p className="font-semibold mb-3">{houseguest.name}</p>
                  <Button
                    variant="outline"
                    className="border-2 hover:border-bb-blue"
                    onClick={() => handleFinalHoHDecision(houseguest)}
                  >
                    Take to Final 2
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {stage === 'JuryVote' && (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-bold mb-4">Jury Vote</h3>
            <p className="text-muted-foreground">
              The jury is voting for the winner...
            </p>
            
            <div className="flex justify-center items-center gap-16 my-8">
              {finalHoH && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
                    {finalHoH.name.charAt(0)}
                  </div>
                  <p className="font-semibold">{finalHoH.name}</p>
                  <p className="text-sm text-muted-foreground">Final HOH</p>
                </div>
              )}
              {finalist && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
                    {finalist.name.charAt(0)}
                  </div>
                  <p className="font-semibold">{finalist.name}</p>
                  <p className="text-sm text-muted-foreground">Finalist</p>
                </div>
              )}
            </div>
            
            <div className="animate-pulse">
              <Trophy className="mx-auto h-10 w-10 text-yellow-500" />
            </div>
          </div>
        )}
        
        {stage === 'Results' && winner && (
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold mb-4">
              The Winner of Big Brother is...
            </h3>
            
            <div className="max-w-md mx-auto p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-3xl mb-3">
                {winner.name.charAt(0)}
              </div>
              <p className="text-2xl font-bold">{winner.name}!</p>
              <Trophy className="mx-auto h-12 w-12 text-yellow-500 mt-4" />
            </div>
            
            <Button 
              className="mt-6 bg-bb-blue hover:bg-blue-700"
              onClick={() => dispatch({ type: 'SET_PHASE', payload: 'GameOver' })}
            >
              Continue to Game Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinalePhase;
