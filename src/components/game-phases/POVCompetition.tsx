import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, ShieldCheck, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';

// Types of competitions that can be held
const COMPETITION_TYPES: CompetitionType[] = ['physical', 'mental', 'endurance', 'luck', 'social'];

const POVCompetition: React.FC = () => {
  const { gameState, dispatch, getActiveHouseguests } = useGame();
  const { toast } = useToast();
  const [isCompeting, setIsCompeting] = useState(false);
  const [competitionType, setCompetitionType] = useState('');
  const [povPlayers, setPovPlayers] = useState<Houseguest[]>([]);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const [compComplete, setCompComplete] = useState(false);

  // Get active houseguests, nominees, and HoH
  const activeHouseguests = getActiveHouseguests();
  const nominees = gameState.nominees;
  const hoh = gameState.hohWinner;

  // Initialize POV players (nominees, HoH, and up to 3 random players)
  useEffect(() => {
    if (!povPlayers.length && nominees.length > 0 && hoh) {
      // Always include nominees and HoH
      const mandatoryPlayers = [...nominees];
      if (!nominees.some(nom => nom.id === hoh.id)) {
        mandatoryPlayers.push(hoh);
      }
      
      // Select random players to fill remaining spots (up to 6 total players)
      const remainingCount = 6 - mandatoryPlayers.length;
      const eligibleForRandom = activeHouseguests.filter(guest => 
        !mandatoryPlayers.some(player => player.id === guest.id)
      );
      
      const randomPlayers = [...eligibleForRandom]
        .sort(() => Math.random() - 0.5)
        .slice(0, remainingCount);
      
      setPovPlayers([...mandatoryPlayers, ...randomPlayers]);
    }
  }, [nominees, hoh, activeHouseguests, povPlayers.length]);

  // Start the competition
  const startCompetition = () => {
    const randomType = COMPETITION_TYPES[Math.floor(Math.random() * COMPETITION_TYPES.length)];
    setCompetitionType(randomType);
    setIsCompeting(true);
    
    toast({
      title: "Veto Competition Started",
      description: `Today's competition is ${randomType}-based!`,
    });
    
    // Simulate competition duration
    setTimeout(determineWinner, 2000);
  };

  // Determine the competition winner based on houseguest stats and some randomness
  const determineWinner = () => {
    if (!povPlayers.length) return;

    // Get the relevant stat based on competition type
    const getRelevantStat = (guest: Houseguest): number => {
      switch (competitionType) {
        case 'physical': return guest.stats.physical;
        case 'mental': return guest.stats.mental;
        case 'endurance': return guest.stats.endurance;
        case 'social': return guest.stats.social;
        case 'luck': return guest.stats.luck;
        default: return Math.floor(Math.random() * 10) + 1;
      }
    };
    
    // Calculate scores with relevant stat + randomness
    const playerScores = povPlayers.map(player => {
      const baseStat = getRelevantStat(player);
      const randomFactor = Math.random() * 10; // Random factor from 0 to 10
      return {
        player,
        score: baseStat + randomFactor
      };
    });
    
    // Sort by score (highest first) and get the winner
    playerScores.sort((a, b) => b.score - a.score);
    const povWinner = playerScores[0].player;
    setWinner(povWinner);
    
    // Update game state with winner
    dispatch({ type: 'SET_POV_WINNER', payload: povWinner });
    
    // Log the event
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: 'PoV',
        type: 'COMPETITION_WIN',
        description: `${povWinner.name} won the Power of Veto competition!`,
        involvedHouseguests: [povWinner.id],
      }
    });
    
    setIsCompeting(false);
    setCompComplete(true);

    toast({
      title: "We Have a Winner!",
      description: `${povWinner.name} has won the Power of Veto!`,
      variant: "default",
    });
    
    // Advance to Veto Meeting phase after a delay
    setTimeout(() => {
      dispatch({ type: 'SET_PHASE', payload: 'PoVMeeting' });
    }, 4000);
  };

  // Calculate the win chance for display purposes
  const calculateWinChance = (houseguest: Houseguest): string => {
    if (!competitionType) return 'TBD';
    
    // Get base stat
    let baseStat;
    switch (competitionType) {
      case 'physical': baseStat = houseguest.stats.physical; break;
      case 'mental': baseStat = houseguest.stats.mental; break;
      case 'endurance': baseStat = houseguest.stats.endurance; break;
      case 'social': baseStat = houseguest.stats.social; break; 
      case 'luck': baseStat = houseguest.stats.luck; break;
      default: baseStat = 5;
    }
    
    // Calculate approximate win percentage based on stat
    return `${Math.min(Math.round(baseStat * 10), 90)}%`;
  };

  // Render
  return (
    <Card className="shadow-lg border-bb-green">
      <CardHeader className="bg-bb-green text-bb-dark">
        <CardTitle className="flex items-center">
          <Award className="mr-2" /> Power of Veto Competition
        </CardTitle>
        <CardDescription className="text-bb-dark/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!isCompeting && !compComplete ? (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Power of Veto Players</h3>
            
            {povPlayers.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {povPlayers.map(player => (
                    <div 
                      key={player.id} 
                      className="border rounded-md p-3 flex flex-col items-center"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl mb-2">
                        {player.name.charAt(0)}
                      </div>
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.isHoH ? 'HoH' : player.isNominated ? 'Nominee' : 'Player'}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="bg-bb-green hover:bg-bb-green/80 text-bb-dark" 
                  onClick={startCompetition}
                >
                  Start Veto Competition
                </Button>
              </>
            ) : (
              <p>Selecting players for the veto competition...</p>
            )}
          </div>
        ) : isCompeting ? (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Competition in Progress</h3>
            <div className="mb-6">
              <Badge className="mb-2 text-lg bg-bb-green text-bb-dark">
                {competitionType} Competition
              </Badge>
              <p className="text-muted-foreground">
                The houseguests are competing for the Power of Veto...
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {povPlayers.map(player => (
                <div 
                  key={player.id}
                  className="border rounded-md p-3 flex flex-col items-center animate-pulse"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl mb-2">
                    {player.name.charAt(0)}
                  </div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm">
                    Win chance: {calculateWinChance(player)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">
              <Award className="inline-block mr-2 text-yellow-500" />
              Power of Veto Winner
            </h3>
            
            {winner && (
              <div className="max-w-md mx-auto border border-bb-green rounded-lg p-4 mb-6">
                <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
                  {winner.name.charAt(0)}
                </div>
                <div className="text-xl font-bold">{winner.name}</div>
                <div className="text-muted-foreground">
                  Has won the Power of Veto!
                </div>
                <div className="mt-4">
                  <ShieldCheck className="mx-auto text-bb-green h-8 w-8" />
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-4">
              Moving to the Veto Meeting, where the winner will decide whether to use the power...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default POVCompetition;
