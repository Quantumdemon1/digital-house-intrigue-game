
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Shuffle, Users, SkipForward } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MandatoryPlayers from './MandatoryPlayers';
import RandomPlayerSelection from './RandomPlayerSelection';
import ChipDraw from './ChipDraw';
import { usePlayerSelection } from './hooks/usePlayerSelection';

type SelectionMode = 'draw' | 'manual';

const POVPlayerSelectionContent: React.FC = () => {
  const { gameState } = useGame();
  const { 
    selectedPlayers, 
    autoSelectRandom, 
    continueToPov,
    isMandatoryPlayer
  } = usePlayerSelection();
  
  const [mode, setMode] = useState<SelectionMode>('draw');
  const [drawComplete, setDrawComplete] = useState(false);
  
  // Get mandatory and eligible players
  const hohId = gameState.hohWinner;
  const nominees = gameState.nominees || [];
  const activeHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active');
  
  const mandatoryPlayerIds = [hohId, ...nominees].filter(Boolean);
  const mandatoryPlayers = activeHouseguests.filter(hg => mandatoryPlayerIds.includes(hg.id));
  const eligiblePlayers = activeHouseguests.filter(hg => !mandatoryPlayerIds.includes(hg.id));
  
  // Calculate how many random players needed (6 total - mandatory)
  const numToDraw = Math.min(6 - mandatoryPlayers.length, eligiblePlayers.length);
  
  const handleDrawComplete = (drawnIds: string[]) => {
    setDrawComplete(true);
    // The usePlayerSelection hook will handle adding these
  };
  
  const handleSkipDraw = () => {
    autoSelectRandom();
    setDrawComplete(true);
  };
  
  const handleSwitchToManual = () => {
    setMode('manual');
  };
  
  // Auto-continue after draw is complete
  useEffect(() => {
    if (drawComplete && selectedPlayers.length >= 3) {
      const timer = setTimeout(() => {
        continueToPov();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [drawComplete, selectedPlayers.length]);
  
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Users className="mr-2" /> Power of Veto Player Selection
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameState.week} - Select 6 Houseguests to Compete
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {mode === 'draw' && !drawComplete ? (
          <ChipDraw
            eligiblePlayers={eligiblePlayers}
            mandatoryPlayers={mandatoryPlayers}
            numToDraw={numToDraw}
            onDrawComplete={handleDrawComplete}
            onSkip={handleSkipDraw}
          />
        ) : (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Player Selection</h3>
            <p className="text-sm text-muted-foreground mb-4">
              In Big Brother, six houseguests compete in the Power of Veto competition:
              the HoH, the two nominees, and three randomly selected houseguests.
            </p>
            
            {/* Player selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MandatoryPlayers />
              <RandomPlayerSelection />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4 bg-bb-blue/90 flex flex-col md:flex-row gap-3">
        {mode === 'draw' && !drawComplete ? (
          <Button 
            variant="secondary" 
            onClick={handleSwitchToManual}
            className="md:mr-auto"
          >
            Manual Selection
          </Button>
        ) : (
          <>
            <Button 
              variant="secondary" 
              onClick={autoSelectRandom}
              className="md:mr-auto"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Random Selection
            </Button>
            
            <Button 
              onClick={continueToPov}
              disabled={selectedPlayers.length < 3 || selectedPlayers.length > 6}
              className="bg-bb-green hover:bg-bb-green/90 text-white"
            >
              Continue to PoV Competition
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default POVPlayerSelectionContent;
