import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Crown, Target, Clock, BrainCircuit, SkipForward, Loader2, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { updateHouseguestMentalState } from '@/models/houseguest';
import AIThoughtDisplay from './NominationPhase/AIThoughtDisplay';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [showThoughts, setShowThoughts] = useState(true);
  const [isLoading, setIsLoading] = useState(!gameState.hohWinner);

  // Get HoH directly from gameState (it's already a full Houseguest object)
  const hoh = gameState.hohWinner 
    ? gameState.houseguests.find(h => h.id === gameState.hohWinner.id) || gameState.hohWinner
    : null;

  // Get nominees from gameState (they're already full Houseguest objects)
  const nominees = gameState?.nominees?.map(nominee => 
    gameState.houseguests.find(h => h.id === nominee.id) || nominee
  ).filter(Boolean) || [];

  // Get all eligible houseguests (active and not HoH)
  const eligibleHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active' && hg.id !== hoh?.id);

  // Wait for HoH to be set
  useEffect(() => {
    if (gameState.hohWinner) {
      setIsLoading(false);
    } else {
      // Give it a moment to load
      const timeout = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [gameState.hohWinner]);

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

  const handleSkip = () => {
    document.dispatchEvent(new Event('game:fastForward'));
  };

  const handleReturnToHoH = () => {
    dispatch({ type: 'SET_PHASE', payload: 'HoH' });
  };

  // Loading state while waiting for HoH
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-2 border-amber-100/30">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Nomination Ceremony...</p>
        </CardContent>
      </Card>
    );
  }

  // Recovery UI when HoH is missing
  if (!hoh) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-2 border-destructive/30">
        <CardContent className="p-8 space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg">
            <p className="text-destructive font-medium mb-2">
              No Head of Household detected.
            </p>
            <p className="text-sm text-muted-foreground">
              This may be a timing issue. Please return to the HoH Competition to select a winner.
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={handleReturnToHoH}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to HoH Competition
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-2 border-amber-100/30">
      <CardHeader className="bg-bb-blue text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-full">
              <Crown className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl">Nomination Ceremony</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Week {gameState.week}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* HoH Banner */}
        <div className="bg-gradient-to-r from-amber-50/50 to-amber-100/30 border-b">
          <div className="bg-bb-blue text-white p-3 flex justify-center items-center">
            <p className="text-lg font-semibold">Head of Household</p>
          </div>
          <div className="bg-bb-blue text-white p-3 flex justify-center items-center gap-3">
            <Crown className="h-6 w-6 text-amber-400" />
            <p className="text-xl md:text-2xl font-bold">{hoh.name}</p>
            <Crown className="h-6 w-6 text-amber-400" />
          </div>
        </div>
        
        {/* AI Thoughts Toggle */}
        {(ceremonyStarted && showingResults) && (
          <div className="flex items-center justify-end space-x-2">
            <Switch 
              id="show-thoughts" 
              checked={showThoughts} 
              onCheckedChange={(checked) => setShowThoughts(checked)} 
            />
            <Label htmlFor="show-thoughts" className="flex items-center cursor-pointer">
              <BrainCircuit className="w-4 h-4 mr-1 text-blue-500" />
              <span className="text-sm">Show AI Thoughts</span>
            </Label>
          </div>
        )}
        
        {/* AI Thoughts Display */}
        {(ceremonyStarted && showingResults && nominees.length === 2) && (
          <AIThoughtDisplay
            hoh={hoh}
            nominees={nominees}
            showThoughts={showThoughts}
          />
        )}
        
        {!ceremonyStarted ? (
          <div className="text-center space-y-6 py-8">
            <h3 className="text-xl font-semibold">Nomination Ceremony</h3>
            <p className="text-muted-foreground">
              The Head of Household must nominate two houseguests for eviction.
              These houseguests will have a chance to save themselves in the Power of Veto competition.
            </p>
            <Button onClick={startCeremony} className="bg-red-600 hover:bg-red-700 text-white font-medium px-6">
              Start Nomination Ceremony
            </Button>
          </div>
        ) : isAnimating ? (
          <div className="text-center space-y-6 py-12">
            <div className="animate-pulse">
              <Target className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-semibold">Making Nominations...</h3>
            </div>
          </div>
        ) : showingResults ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-10 w-10 mx-auto text-red-500 mb-2" />
              <h3 className="text-xl font-semibold mb-1">Nominations Complete</h3>
              <p className="text-muted-foreground">
                {hoh.name} has nominated:
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {nominees.map(nominee => (
                <div key={nominee?.id} className="bg-bb-blue text-white p-3 rounded-md">
                  <Target className="h-5 w-5 mx-auto text-red-500 mb-2" />
                  <h4 className="font-semibold text-lg text-center">{nominee?.name}</h4>
                  <p className="text-sm text-center text-white/70">{nominee?.occupation}</p>
                </div>
              ))}
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
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default NominationPhase;
