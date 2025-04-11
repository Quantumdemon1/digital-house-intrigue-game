import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Houseguest, CompetitionType } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { Trophy, Loader, ShieldCheck } from 'lucide-react';

const POVCompetition: React.FC = () => {
  const {
    gameState,
    dispatch,
    getActiveHouseguests
  } = useGame();
  const [isCompeting, setIsCompeting] = useState(false);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const activeHouseguests = getActiveHouseguests();
  const nominees = gameState.nominees;
  const startCompetition = () => {
    setIsCompeting(true);

    // Simulate the competition running
    setTimeout(() => {
      // Determine the winner (random for now)
      const competitionWinner = activeHouseguests[Math.floor(Math.random() * activeHouseguests.length)];
      setWinner(competitionWinner);

      // Update game state with new PoV winner
      dispatch({
        type: 'SET_POV_WINNER',
        payload: competitionWinner
      });

      // Log the event
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'PoV',
          type: 'COMPETITION',
          description: `${competitionWinner.name} won the Power of Veto competition.`,
          involvedHouseguests: [competitionWinner.id]
        }
      });

      // Continue to PoV meeting phase after a delay
      setTimeout(() => {
        dispatch({
          type: 'SET_PHASE',
          payload: 'PoVMeeting'
        });
      }, 5000);
    }, 3000);
  };
  if (winner) {
    return <Card className="shadow-lg border-bb-blue">
        <CardHeader className="bg-bb-blue text-white">
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2" /> Power of Veto Results
          </CardTitle>
          <CardDescription className="text-white/80">
            Competition Complete
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-6">
            <div className="camera-lens w-24 h-24 mb-2 border-4 border-bb-blue">
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-700">
                {winner.name.charAt(0)}
              </div>
            </div>
            
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold">{winner.name} wins!</h3>
              <p className="text-muted-foreground">New Power of Veto Holder</p>
            </div>
            
            <Trophy className="text-bb-blue w-10 h-10 mb-4" />
          </div>
          
          <div className="mt-6 text-center text-muted-foreground">
            Continuing to PoV Meeting...
            <div className="mt-2 animate-pulse">
              <Loader className="inline-block" />
            </div>
          </div>
        </CardContent>
      </Card>;
  }
  if (isCompeting) {
    return <Card className="shadow-lg border-bb-blue">
        <CardHeader className="bg-bb-blue text-white">
          <CardTitle>Power of Veto Competition</CardTitle>
          <CardDescription className="text-white/80">
            Week {gameState.week}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="animate-pulse">
              <Loader className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold mt-4">Competition in Progress...</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Houseguests are competing for the Power of Veto
            </p>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <ShieldCheck className="mr-2" /> Power of Veto Competition
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Competition Time</h3>
          <p>
            The Power of Veto competition is about to begin. The winner will have the power to save
            one of the nominees (or themselves) from eviction.
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Nominees</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {nominees.map(nominee => {
              const houseguest = activeHouseguests.find(hg => hg.id === nominee.id);
              return houseguest ? <div key={houseguest.id} className="flex items-center text-sm">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    {houseguest.name.charAt(0)}
                  </div>
                  <span>
                    {houseguest.name}
                    {houseguest.isPlayer && <span className="text-bb-green text-xs ml-1">(You)</span>}
                  </span>
                </div> : null;
            })}
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current Houseguests:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activeHouseguests.map(houseguest => <div key={houseguest.id} className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  {houseguest.name.charAt(0)}
                </div>
                <span>
                  {houseguest.name}
                  {houseguest.isPlayer && <span className="text-bb-green text-xs ml-1">(You)</span>}
                </span>
              </div>)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 bg-[#005a9a]">
        <div className="w-full">
          <Button onClick={startCompetition} disabled={isCompeting} className="w-full">
            Start Power of Veto Competition
          </Button>
        </div>
      </CardFooter>
    </Card>;
};

export default POVCompetition;
