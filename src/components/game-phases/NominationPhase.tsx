import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Crown, Target, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { updateHouseguestMentalState } from '@/models/houseguest';
const NominationPhase: React.FC = () => {
  const {
    gameState,
    dispatch,
    getHouseguestById,
    showToast,
    logger
  } = useGame();

  // Local state
  const [showingResults, setShowingResults] = useState(false);
  const [ceremonyStarted, setCeremonyStarted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Convert HoH ID to Houseguest object
  const hoh = gameState?.hohWinner ? getHouseguestById(gameState.hohWinner.id) : null;

  // Convert nominee IDs to Houseguest objects, if they exist
  const nominees = gameState?.nominees?.map(nomineeId => getHouseguestById(nomineeId.id)).filter(Boolean) || [];

  // Get all eligible houseguests (active and not HoH)
  const eligibleHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active' && hg.id !== hoh?.id);

  // Start the ceremony
  const startCeremony = () => {
    setCeremonyStarted(true);
    logger.info(`${hoh?.name} has started the Nomination Ceremony`);

    // Countdown sequence - for visual effect
    setTimeout(() => {
      setIsAnimating(true);
      showToast("Nomination Ceremony", {
        description: "The Head of Household must nominate two houseguests for eviction",
        variant: "info"
      });

      // After animation, show results
      setTimeout(() => {
        setIsAnimating(false);
        setShowingResults(true);

        // Generate random nominees if they don't exist yet
        if (nominees.length < 2) {
          const randomNominees = eligibleHouseguests.sort(() => 0.5 - Math.random()).slice(0, 2);

          // Update game state with nominees
          dispatch({
            type: 'SET_NOMINEES',
            payload: randomNominees
          });

          // Update mental state of nominees
          randomNominees.forEach(nominee => {
            if (nominee) {
              updateHouseguestMentalState(nominee, 'nominated');
            }
          });
          logger.info(`${hoh?.name} has nominated ${randomNominees.map(n => n.name).join(' and ')}`);
        } else {
          // Update mental state of existing nominees
          nominees.forEach(nominee => {
            if (nominee) {
              updateHouseguestMentalState(nominee, 'nominated');
            }
          });
        }
      }, 3000); // 3 second animation
    }, 1000);
  };

  // Continue to Power of Veto phase
  const continueToPoV = () => {
    if (nominees.length !== 2) {
      showToast("Cannot Continue", {
        description: "Two houseguests must be nominated first",
        variant: "error"
      });
      return;
    }
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_pov',
        params: {}
      }
    });
  };
  return <Card className="w-full max-w-4xl mx-auto shadow-lg border-2 border-amber-100/30">
      <CardHeader className="bg-bb-blue text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-full">
              <Crown className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl">Nomination Ceremony</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Week {gameState.week}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* HoH Banner */}
        <div className="bg-gradient-to-r from-amber-50/50 to-amber-100/30 border-b">
          <div>
            <p className="bg-bb-blue text-white">Head of Household</p>
            <p className="bg-bb-blue text-white">{hoh?.name || 'No HoH'}</p>
          </div>
          
        </div>
        
        {!ceremonyStarted ? <div className="text-center space-y-6 py-8">
            <h3 className="text-xl font-semibold">Nomination Ceremony</h3>
            <p className="text-muted-foreground">
              The Head of Household must nominate two houseguests for eviction.
              These houseguests will have a chance to save themselves in the Power of Veto competition.
            </p>
            <Button onClick={startCeremony} className="bg-red-600 hover:bg-red-700 text-white font-medium px-6">
              Start Nomination Ceremony
            </Button>
          </div> : isAnimating ? <div className="text-center space-y-6 py-12">
            <div className="animate-pulse">
              <Target className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-semibold">Making Nominations...</h3>
            </div>
          </div> : showingResults ? <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-10 w-10 mx-auto text-red-500 mb-2" />
              <h3 className="text-xl font-semibold mb-1">Nominations Complete</h3>
              <p className="text-muted-foreground">
                {hoh?.name} has nominated:
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {nominees.map(nominee => <div key={nominee?.id} className="bg-bb-blue text-white">
                  <Target className="h-5 w-5 mx-auto text-red-500 mb-2" />
                  <h4 className="font-semibold text-lg text-center">{nominee?.name}</h4>
                  <p className="text-sm font-bold text-center text-zinc-950">{nominee?.occupation}</p>
                </div>)}
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                These houseguests will compete in the Power of Veto competition for a chance to save themselves.
              </p>
              <Button onClick={continueToPoV} className="bg-red-600 hover:bg-red-700 text-white px-6">
                Continue to Power of Veto
              </Button>
            </div>
          </div> : null}
      </CardContent>
    </Card>;
};
export default NominationPhase;