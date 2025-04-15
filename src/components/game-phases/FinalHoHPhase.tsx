
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Award, ChevronRight, User2 } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FinalHoHPhase: React.FC = () => {
  const { gameState, dispatch, getActiveHouseguests } = useGame();
  const [activePart, setActivePart] = useState('part1');
  const [isCompeting, setIsCompeting] = useState(false);
  const [partWinner, setPartWinner] = useState<Houseguest | null>(null);
  
  // Check if we have winners for each part
  const part1Winner = gameState.finalHoHWinners?.part1 ? 
    gameState.houseguests.find(hg => hg.id === gameState.finalHoHWinners?.part1) : null;
    
  const part2Winner = gameState.finalHoHWinners?.part2 ? 
    gameState.houseguests.find(hg => hg.id === gameState.finalHoHWinners?.part2) : null;
    
  const part3Winner = gameState.finalHoHWinners?.part3 ? 
    gameState.houseguests.find(hg => hg.id === gameState.finalHoHWinners?.part3) : null;
  
  const finalHoH = gameState.hohWinner ? 
    gameState.houseguests.find(hg => hg.id === gameState.hohWinner) : null;
  
  // Get the final 3 houseguests
  const finalThree = getActiveHouseguests();
  const otherFinalists = finalHoH ? finalThree.filter(hg => hg.id !== finalHoH.id) : finalThree;
  
  // Start a competition for the current part
  const startCompetition = () => {
    setIsCompeting(true);
    setPartWinner(null);
    
    // Simulate the competition running
    setTimeout(() => {
      // Get eligible houseguests
      let eligibleHouseguests: Houseguest[] = [];
      
      // For part 1, all 3 compete
      if (activePart === 'part1') {
        eligibleHouseguests = finalThree;
      } 
      // For part 2, the two losers of part 1 compete
      else if (activePart === 'part2' && part1Winner) {
        eligibleHouseguests = finalThree.filter(hg => hg.id !== part1Winner.id);
      } 
      // For part 3, the winners of part 1 and 2 compete
      else if (activePart === 'part3' && part1Winner && part2Winner) {
        eligibleHouseguests = [part1Winner, part2Winner];
      }
      
      if (eligibleHouseguests.length > 0) {
        // Select random winner from eligible houseguests
        const winner = eligibleHouseguests[Math.floor(Math.random() * eligibleHouseguests.length)];
        setPartWinner(winner);
        
        // Update game state based on the part
        if (activePart === 'part1') {
          dispatch({
            type: 'PLAYER_ACTION',
            payload: {
              actionId: 'select_part1_winner',
              params: { winnerId: winner.id }
            }
          });
        } else if (activePart === 'part2') {
          dispatch({
            type: 'PLAYER_ACTION',
            payload: {
              actionId: 'select_part2_winner',
              params: { winnerId: winner.id }
            }
          });
        } else if (activePart === 'part3') {
          // Winner of part 3 becomes the final HoH
          dispatch({
            type: 'PLAYER_ACTION',
            payload: {
              actionId: 'select_part3_winner',
              params: { winnerId: winner.id }
            }
          });
          
          // Update HoH in game state
          dispatch({
            type: 'SET_HOH',
            payload: winner
          });
        }
        
        // Log the event
        dispatch({
          type: 'LOG_EVENT',
          payload: {
            week: gameState.week,
            phase: 'FinalHoH',
            type: 'COMPETITION',
            description: `${winner.name} won Part ${activePart.slice(-1)} of the Final HoH competition.`,
            involvedHouseguests: [winner.id]
          }
        });
      }
      
      // Reset competing state
      setIsCompeting(false);
    }, 3000);
  };
  
  // Choose the other finalist to go to final 2
  const chooseFinalist = (finalist: Houseguest) => {
    if (!finalHoH) return;
    
    // Update game state
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'select_finalist',
        params: { finalistId: finalist.id }
      }
    });
    
    // Log event
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: 'FinalHoH',
        type: 'FINALIST_SELECTION',
        description: `${finalHoH.name} chose ${finalist.name} to join them in the Final 2.`,
        involvedHouseguests: [finalHoH.id, finalist.id]
      }
    });
    
    // Find evicted houseguest
    const evicted = finalThree.find(hg => hg.id !== finalHoH.id && hg.id !== finalist.id);
    
    if (evicted) {
      // Log eviction
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'FinalHoH',
          type: 'EVICTION',
          description: `${evicted.name} was evicted and becomes the final juror.`,
          involvedHouseguests: [evicted.id]
        }
      });
    }
    
    // Move to jury questioning
    dispatch({
      type: 'SET_PHASE',
      payload: 'JuryQuestioning'
    });
  };
  
  // Render appropriate content based on progress
  const renderContent = () => {
    // If we have a final HoH, show finalist selection
    if (finalHoH) {
      return (
        <div className="text-center space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-amber-900">
              <Crown className="h-5 w-5 text-amber-600" />
              <h3 className="text-xl font-semibold">Final Head of Household</h3>
            </div>
            <p className="mt-2 text-amber-800">{finalHoH.name}</p>
          </div>
          
          <h3 className="text-xl font-semibold">Choose Your Final 2 Partner</h3>
          <p className="text-muted-foreground">
            As the Final HoH, you must choose which houseguest will join you in the Final 2,
            and which houseguest will be the final member of the jury.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto mt-6">
            {otherFinalists.map(finalist => (
              <div key={finalist.id} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mb-2 flex items-center justify-center">
                  <User2 className="h-8 w-8 text-gray-600" />
                </div>
                <p className="font-medium">{finalist.name}</p>
                <Button
                  variant="default"
                  className="mt-4"
                  onClick={() => chooseFinalist(finalist)}
                >
                  Take to Final 2
                </Button>
              </div>
            ))}
          </div>
        </div>
      );
    }
  
    return (
      <Tabs 
        value={activePart} 
        onValueChange={setActivePart}
        defaultValue="part1"
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger 
            value="part1"
            disabled={isCompeting}
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
          >
            Part 1
            {part1Winner && <span className="ml-1 text-green-600">✓</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="part2"
            disabled={!part1Winner || isCompeting}
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
          >
            Part 2
            {part2Winner && <span className="ml-1 text-green-600">✓</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="part3"
            disabled={!part1Winner || !part2Winner || isCompeting}
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
          >
            Part 3
            {part3Winner && <span className="ml-1 text-green-600">✓</span>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="part1" className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Endurance Competition</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            All three houseguests compete in an endurance challenge. 
            The winner advances directly to Part 3, while the other two face off in Part 2.
          </p>
          
          {isCompeting ? (
            <div className="text-center py-6 animate-pulse">
              <Award className="h-10 w-10 mx-auto mb-2 text-amber-500" />
              <p>Competition in progress...</p>
            </div>
          ) : part1Winner ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
              <p className="text-green-800 font-medium">
                {part1Winner.name} won Part 1!
              </p>
              <p className="text-sm text-green-700 mt-1">
                They will move directly to Part 3.
              </p>
              
              <Button
                variant="default"
                className="mt-4"
                onClick={() => setActivePart('part2')}
              >
                Continue to Part 2 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={startCompetition}
              disabled={isCompeting}
              className="w-full"
            >
              Start Part 1
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="part2" className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Mental Competition</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            The two losers from Part 1 compete in a mental challenge.
            The winner advances to Part 3 to face the Part 1 winner.
          </p>
          
          {isCompeting ? (
            <div className="text-center py-6 animate-pulse">
              <Award className="h-10 w-10 mx-auto mb-2 text-amber-500" />
              <p>Competition in progress...</p>
            </div>
          ) : part2Winner ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
              <p className="text-green-800 font-medium">
                {part2Winner.name} won Part 2!
              </p>
              <p className="text-sm text-green-700 mt-1">
                They will face {part1Winner?.name} in Part 3.
              </p>
              
              <Button
                variant="default"
                className="mt-4"
                onClick={() => setActivePart('part3')}
              >
                Continue to Part 3 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={startCompetition}
              disabled={isCompeting || !part1Winner}
              className="w-full"
            >
              Start Part 2
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="part3" className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Jury Questions</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            The winners of Parts 1 and 2 face off in the final competition.
            The winner becomes the Final HoH and chooses who to take to the Final 2.
          </p>
          
          {isCompeting ? (
            <div className="text-center py-6 animate-pulse">
              <Award className="h-10 w-10 mx-auto mb-2 text-amber-500" />
              <p>Competition in progress...</p>
            </div>
          ) : part3Winner ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
              <p className="text-green-800 font-medium">
                {part3Winner.name} won Part 3!
              </p>
              <p className="text-sm text-green-700 mt-1">
                They are now the Final Head of Household.
              </p>
              
              <Button
                variant="default"
                className="mt-4"
                onClick={() => {
                  // Refresh the page state to show the finalist selection
                  dispatch({
                    type: 'FORCE_REFRESH',
                    payload: {}
                  });
                }}
              >
                Continue to Final Decision <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={startCompetition}
              disabled={isCompeting || !part1Winner || !part2Winner}
              className="w-full"
            >
              Start Part 3
            </Button>
          )}
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <Card className="shadow-lg border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-400 to-amber-500 text-white">
        <CardTitle className="flex items-center">
          <Crown className="mr-2" /> Final HoH Competition
        </CardTitle>
        <CardDescription className="text-white/90">
          Week {gameState.week} - The Final Three
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">The Path to Victory</h3>
          <p className="text-sm text-muted-foreground">
            The Final Head of Household competition has three parts. The winner will decide
            who sits beside them in the Final 2, and who becomes the final member of the jury.
          </p>
        </div>
        
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default FinalHoHPhase;
