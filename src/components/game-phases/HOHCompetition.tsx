import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Clock, Trophy } from 'lucide-react';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { useToast } from '@/components/ui/use-toast';
import HouseguestCard from '../HouseguestCard';

// Helper function for weighted random selection based on stats
const selectRandomWinner = (houseguests: Houseguest[], competitionType: CompetitionType): Houseguest => {
  let totalWeight = 0;
  const weights: number[] = [];

  // Calculate weights based on competition type
  houseguests.forEach(houseguest => {
    let weight = 1; // Base weight

    // Adjust weight based on competition type and related stats
    switch (competitionType) {
      case 'physical':
        weight = houseguest.stats.physical * 1.5;
        break;
      case 'mental':
        weight = houseguest.stats.mental * 1.5;
        break;
      case 'endurance':
        weight = houseguest.stats.endurance * 1.5;
        break;
      case 'social':
        weight = houseguest.stats.social * 1.5;
        break;
      case 'luck':
        // Everyone has roughly equal chance in luck competitions
        weight = houseguest.stats.luck + 5;
        break;
    }

    // Add some randomness
    weight *= 0.75 + Math.random() * 0.5; // 75-125% random factor

    // Add this houseguest's weight to the total
    totalWeight += weight;
    weights.push(totalWeight);
  });

  // Select a random point within the total weight range
  const selection = Math.random() * totalWeight;

  // Find the houseguest whose weight range contains the selection point
  for (let i = 0; i < weights.length; i++) {
    if (selection <= weights[i]) {
      return houseguests[i];
    }
  }

  // Fallback (should never happen)
  return houseguests[0];
};

const competitionTypes: CompetitionType[] = ['physical', 'mental', 'endurance', 'luck', 'social'];

const HOHCompetition: React.FC = () => {
  const {
    gameState,
    dispatch,
    getActiveHouseguests
  } = useGame();
  const {
    toast
  } = useToast();
  const [competitionType, setCompetitionType] = useState<CompetitionType | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [results, setResults] = useState<{
    name: string;
    position: number;
  }[]>([]);
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const activeHouseguests = getActiveHouseguests();
  const player = activeHouseguests.find(h => h.isPlayer);
  
  const startCompetition = (type: CompetitionType) => {
    setCompetitionType(type);
    setIsCompeting(true);

    // Simulate the competition running
    setTimeout(() => {
      // Verify we have houseguests before determining a winner
      if (activeHouseguests.length === 0) {
        console.error('No active houseguests available for competition');
        setIsCompeting(false);
        return;
      }
      
      // Determine the winner (weighted random based on stats)
      const competitionWinner = selectRandomWinner(activeHouseguests, type);
      
      if (!competitionWinner) {
        console.error('Failed to select a competition winner');
        setIsCompeting(false);
        return;
      }

      // Generate random results
      const positions = activeHouseguests.map(guest => ({
        name: guest.name,
        id: guest.id,
        position: Math.random() // random value for sorting
      })).sort((a, b) => a.position - b.position).map((guest, index) => ({
        name: guest.name,
        position: index + 1,
        id: guest.id
      }));

      // Make sure the winner is in first place
      const winnerIndex = positions.findIndex(p => p.id === competitionWinner.id);
      if (winnerIndex > 0) {
        const temp = positions[0];
        positions[0] = positions[winnerIndex];
        positions[winnerIndex] = temp;
      }
      setResults(positions);
      setWinner(competitionWinner);

      // Update game state with new HoH
      dispatch({
        type: 'SET_HOH',
        payload: competitionWinner
      });

      // Log the event
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'HoH',
          type: 'COMPETITION',
          description: `${competitionWinner.name} won the ${type} Head of Household competition.`,
          involvedHouseguests: [competitionWinner.id]
        }
      });

      // Show toast
      toast({
        title: "HoH Competition Results",
        description: `${competitionWinner.name} is the new Head of Household!`,
        variant: "default"
      });

      // Continue to nomination phase after a delay
      setTimeout(() => {
        dispatch({
          type: 'SET_PHASE',
          payload: 'Nomination'
        });
      }, 5000);
    }, 3000);
  };

  if (winner) {
    return <Card className="shadow-lg border-bb-blue">
        <CardHeader className="bg-bb-blue text-white">
          <CardTitle className="flex items-center">
            <Trophy className="mr-2" /> Head of Household Results
          </CardTitle>
          <CardDescription className="text-white/80">
            {competitionType} Competition Complete
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
              <p className="text-muted-foreground">New Head of Household</p>
            </div>
            
            <Crown className="text-bb-blue w-10 h-10 mb-4" />
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Final Results:</h4>
            <ol className="space-y-2">
              {results.map(result => <li key={result.name} className="flex justify-between">
                  <span className="font-medium">{result.position}. {result.name}</span>
                  {result.position === 1 && <Crown className="text-bb-blue w-4 h-4" />}
                </li>)}
            </ol>
          </div>
          
          <div className="mt-6 text-center text-muted-foreground">
            Continuing to Nominations...
            <div className="mt-2 animate-pulse">
              <Clock className="inline-block" />
            </div>
          </div>
        </CardContent>
      </Card>;
  }
  if (isCompeting) {
    return <Card className="shadow-lg border-bb-blue">
        <CardHeader className="bg-bb-blue text-white">
          <CardTitle>Head of Household Competition</CardTitle>
          <CardDescription className="text-white/80">
            {competitionType} Competition
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="animate-pulse">
              <Clock className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold mt-4">Competition in Progress...</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Houseguests are competing for Head of Household
            </p>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Crown className="mr-2" /> Head of Household Competition
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Competition Time</h3>
          <p>
            The Head of Household competition is about to begin. The winner will be safe for the week
            and will nominate two houseguests for eviction.
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Choose a Competition Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {competitionTypes.map(type => <Button key={type} variant="outline" className="h-auto py-3" onClick={() => startCompetition(type)}>
                {type}
              </Button>)}
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
          <p className="text-sm text-slate-50">
            The winner becomes the new HoH and will nominate two houseguests for eviction.
          </p>
        </div>
      </CardFooter>
    </Card>;
};

export default HOHCompetition;
