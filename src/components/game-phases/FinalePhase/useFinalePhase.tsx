
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import confetti from 'canvas-confetti';

export const useFinalePhase = (
  gameState: any,
  dispatch: any,
  getRelationship: (guest1Id: string, guest2Id: string) => number
) => {
  const { toast } = useToast();
  
  type FinaleStage = 'HoHCompetition' | 'FinalDecision' | 'JuryVote' | 'Results';
  
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
    }, 3000);
  };
  
  const handleJuryVoteComplete = (gameWinner: Houseguest, runnerUp: Houseguest) => {
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

  const continueToGameSummary = () => {
    dispatch({ type: 'SET_PHASE', payload: 'GameOver' });
  };
  
  return {
    stage,
    finalHoH,
    finalist,
    evicted,
    winner,
    activeHouseguests,
    player,
    startFinalHoHCompetition,
    handleFinalHoHDecision,
    handleJuryVoteComplete,
    continueToGameSummary
  };
};
