
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Houseguest, CompetitionType } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { Trophy, Loader, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const POVCompetition: React.FC = () => {
  const {
    gameState,
    dispatch,
    getHouseguestById,
    getActiveHouseguests
  } = useGame();
  const [isCompeting, setIsCompeting] = useState(false);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  
  // Get the PoV players (or all houseguests if not set)
  const povPlayerIds = gameState.povPlayers || [];
  const povPlayers = povPlayerIds
    .map(id => getHouseguestById(id))
    .filter(Boolean);
  
  const nominees = gameState.nominees
    .map(id => getHouseguestById(id))
    .filter(Boolean);
  
  const hoh = gameState.hohWinner ? getHouseguestById(gameState.hohWinner) : null;
  
  // If no PoV players are set, show a warning
  useEffect(() => {
    if (povPlayerIds.length === 0 && !isCompeting && !winner) {
      console.warn('No PoV players selected for competition');
    }
  }, [povPlayerIds, isCompeting, winner]);
  
  const startCompetition = () => {
    setIsCompeting(true);

    // Simulate the competition running
    setTimeout(() => {
      // Verify we have PoV players before determining a winner
      if (povPlayers.length === 0) {
        console.error('No PoV players available for competition');
        setIsCompeting(false);
        return;
      }
      
      // Determine the winner (random from povPlayers)
      const competitionWinner = povPlayers[Math.floor(Math.random() * povPlayers.length)];
      
      if (!competitionWinner) {
        console.error('Failed to select a PoV competition winner');
        setIsCompeting(false);
        return;
      }
      
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
              Selected houseguests are competing for the Power of Veto
            </p>
          </div>
        </CardContent>
      </Card>;
  }
  
  return <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2" /> Power of Veto Competition
          </CardTitle>
          <Badge variant="outline" className="bg-white/10">
            {povPlayers.length} Competitors
          </Badge>
        </div>
        <CardDescription className="text-white/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Competition Time</h3>
          <p>
            The Power of Veto competition is ready to begin. Six houseguests will compete,
            and the winner will have the power to save one of the nominees from eviction.
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">PoV Competitors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-muted/20 p-4 rounded-lg">
            {povPlayers.map(player => (
              <div key={player.id} className="flex items-center gap-2 bg-white/10 p-2 rounded-md">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                  {player.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{player.name}</span>
                  <span className="text-xs opacity-70">
                    {player.id === hoh?.id ? "HoH" : 
                     nominees.some(n => n.id === player.id) ? "Nominee" : 
                     "Random Draw"}
                  </span>
                </div>
                {player.isPlayer && <span className="text-xs text-green-400 ml-1">(You)</span>}
              </div>
            ))}
            
            {/* Show placeholder cards if less than 6 competitors */}
            {Array.from({ length: Math.max(0, 6 - povPlayers.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-2 bg-white/5 p-2 rounded-md opacity-50">
                <div className="w-8 h-8 rounded-full bg-gray-300/30 flex items-center justify-center text-gray-400">
                  ?
                </div>
                <span className="text-sm">Not Selected</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 bg-[#005a9a]">
        <div className="w-full">
          <Button 
            onClick={startCompetition} 
            disabled={isCompeting || povPlayers.length === 0} 
            className="w-full"
          >
            Start Power of Veto Competition
          </Button>
        </div>
      </CardFooter>
    </Card>;
};

export default POVCompetition;
