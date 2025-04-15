
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle, Users, UserCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Houseguest } from '@/models/houseguest';

const POVPlayerSelection: React.FC = () => {
  const { gameState, dispatch, getHouseguestById } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [autoSelected, setAutoSelected] = useState(false);
  
  // Get HoH and nominees - they must participate
  const hohId = gameState.hohWinner;
  const nominees = gameState.nominees || [];
  
  // Get all active houseguests
  const activeHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active');
  
  // Auto-select HoH and nominees on mount
  useEffect(() => {
    const mandatoryPlayers = [hohId, ...nominees].filter(Boolean);
    setSelectedPlayers(mandatoryPlayers);
  }, [hohId, nominees]);
  
  // Check if a player is mandatory (HoH or nominee)
  const isMandatoryPlayer = (id: string) => {
    return id === hohId || nominees.includes(id);
  };
  
  // Handle checkbox change
  const handlePlayerToggle = (playerId: string, checked: boolean) => {
    if (checked) {
      // Don't exceed 6 players
      if (selectedPlayers.length >= 6) {
        return;
      }
      setSelectedPlayers([...selectedPlayers, playerId]);
    } else {
      // Don't allow deselecting mandatory players
      if (isMandatoryPlayer(playerId)) {
        return;
      }
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    }
  };
  
  // Auto-select random players to fill remaining spots
  const autoSelectRandom = () => {
    // Start with mandatory players
    const mandatoryPlayers = [hohId, ...nominees].filter(Boolean);
    
    // Get eligible houseguests for random selection
    const eligibleForRandom = activeHouseguests
      .filter(hg => !mandatoryPlayers.includes(hg.id))
      .map(hg => hg.id);
    
    // Shuffle and select enough to fill out 6 slots
    const shuffled = [...eligibleForRandom].sort(() => 0.5 - Math.random());
    const numNeeded = Math.min(6 - mandatoryPlayers.length, shuffled.length);
    const randomSelected = shuffled.slice(0, numNeeded);
    
    // Combine mandatory and random players
    const finalSelection = [...mandatoryPlayers, ...randomSelected];
    setSelectedPlayers(finalSelection);
    setAutoSelected(true);
  };
  
  // Continue to PoV competition
  const continueToPov = () => {
    // Must have between 3-6 players
    if (selectedPlayers.length < 3 || selectedPlayers.length > 6) {
      return;
    }
    
    // Update game state
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'select_pov_players',
        params: { povPlayerIds: selectedPlayers }
      }
    });
    
    // Log event
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: 'PoVPlayerSelection',
        type: 'POV_PLAYERS_SELECTED',
        description: `${selectedPlayers.length} houseguests selected for PoV competition.`,
        involvedHouseguests: selectedPlayers
      }
    });
    
    // Continue to PoV competition
    dispatch({
      type: 'SET_PHASE',
      payload: 'PoV'
    });
  };
  
  // Get a houseguest by ID with type safety
  const getHouseguest = (id: string): Houseguest | undefined => {
    return getHouseguestById(id);
  };
  
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
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Player Selection</h3>
          <p className="text-sm text-muted-foreground mb-4">
            In Big Brother, six houseguests compete in the Power of Veto competition:
            the HoH, the two nominees, and three randomly selected houseguests.
          </p>
          
          {/* Player selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center">
                <UserCheck className="h-4 w-4 mr-1 text-blue-500" />
                Mandatory Players ({Math.min(3, hohId ? 1 : 0 + nominees.length)}/3)
              </h4>
              <div className="space-y-2">
                {/* HoH */}
                <div className="flex items-center space-x-2 bg-white/10 p-2 rounded">
                  <Checkbox 
                    id={`player-${hohId}`}
                    checked={selectedPlayers.includes(hohId || '')}
                    disabled
                  />
                  <label htmlFor={`player-${hohId}`} className="flex items-center">
                    <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded mr-2">HoH</span>
                    {getHouseguest(hohId || '')?.name || 'Head of Household'}
                  </label>
                </div>
                
                {/* Nominees */}
                {nominees.map(nomineeId => {
                  const nominee = getHouseguest(nomineeId);
                  return (
                    <div key={nomineeId} className="flex items-center space-x-2 bg-white/10 p-2 rounded">
                      <Checkbox 
                        id={`player-${nomineeId}`}
                        checked={selectedPlayers.includes(nomineeId)}
                        disabled
                      />
                      <label htmlFor={`player-${nomineeId}`} className="flex items-center">
                        <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded mr-2">Nominee</span>
                        {nominee?.name || 'Nominee'}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Random player selection */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium flex items-center">
                  <Shuffle className="h-4 w-4 mr-1 text-purple-500" />
                  Random Draw ({selectedPlayers.length - (hohId ? 1 : 0) - nominees.length}/{6 - (hohId ? 1 : 0) - nominees.length})
                </h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={autoSelectRandom}
                  className="text-xs"
                >
                  <Shuffle className="h-3 w-3 mr-1" /> Random
                </Button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {activeHouseguests.map(hg => {
                  // Skip mandatory players
                  if (isMandatoryPlayer(hg.id)) return null;
                  
                  return (
                    <div key={hg.id} className="flex items-center space-x-2 bg-white/5 p-2 rounded">
                      <Checkbox 
                        id={`player-${hg.id}`}
                        checked={selectedPlayers.includes(hg.id)}
                        onCheckedChange={(checked) => 
                          handlePlayerToggle(hg.id, checked as boolean)
                        }
                        disabled={!selectedPlayers.includes(hg.id) && selectedPlayers.length >= 6}
                      />
                      <label htmlFor={`player-${hg.id}`} className="text-sm">
                        {hg.name}
                        {hg.isPlayer && <span className="text-green-400 text-xs ml-1">(You)</span>}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4 bg-bb-blue/90 flex flex-col md:flex-row gap-3">
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
      </CardFooter>
    </Card>
  );
};

export default POVPlayerSelection;
