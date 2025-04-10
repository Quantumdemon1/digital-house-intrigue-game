
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Check, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Houseguest } from '@/models/houseguest';
import HouseguestCard from '../HouseguestCard';

const NominationPhase: React.FC = () => {
  const { gameState, dispatch, getActiveHouseguests, getRelationship } = useGame();
  const { toast } = useToast();
  const [nominees, setNominees] = useState<Houseguest[]>([]);
  const [isNominating, setIsNominating] = useState(false);
  const [ceremonyComplete, setCeremonyComplete] = useState(false);
  const [aiProcessed, setAiProcessed] = useState(false); // Flag to prevent infinite loop

  const activeHouseguests = getActiveHouseguests();
  const hoh = gameState.hohWinner;
  
  // Filter out the HoH from potential nominees
  const potentialNominees = activeHouseguests.filter(
    houseguest => houseguest.id !== hoh?.id
  );
  
  const toggleNominee = (houseguest: Houseguest) => {
    if (nominees.find(nominee => nominee.id === houseguest.id)) {
      setNominees(nominees.filter(nominee => nominee.id !== houseguest.id));
    } else if (nominees.length < 2) {
      setNominees([...nominees, houseguest]);
    }
  };
  
  const confirmNominations = () => {
    if (nominees.length !== 2) return;
    
    setIsNominating(true);
    
    setTimeout(() => {
      // Update game state with nominations
      dispatch({ type: 'SET_NOMINEES', payload: nominees });
      
      // Update relationships - nominees will like HoH less
      nominees.forEach(nominee => {
        if (hoh) {
          dispatch({
            type: 'UPDATE_RELATIONSHIPS',
            payload: {
              guestId1: nominee.id,
              guestId2: hoh.id,
              change: -20,
              note: `${nominee.name} was nominated by ${hoh.name}`
            }
          });
        }
      });
      
      // Log the event
      dispatch({ 
        type: 'LOG_EVENT', 
        payload: {
          week: gameState.week,
          phase: 'Nomination',
          type: 'NOMINATION',
          description: `${hoh?.name} nominated ${nominees[0].name} and ${nominees[1].name} for eviction.`,
          involvedHouseguests: [...nominees.map(n => n.id), hoh?.id || ''],
        }
      });
      
      // Show toast
      toast({
        title: "Nomination Ceremony Complete",
        description: `${nominees[0].name} and ${nominees[1].name} have been nominated for eviction.`,
        variant: "default",
      });
      
      setCeremonyComplete(true);
      
      // Continue to PoV phase after a delay
      setTimeout(() => {
        dispatch({ type: 'SET_PHASE', payload: 'PoV' });
      }, 3000);
    }, 1500);
  };
  
  // If the HoH is AI, have them automatically nominate
  useEffect(() => {
    // Only process if HoH exists, HoH is AI, and we haven't already processed or started nominating
    if (hoh && !hoh.isPlayer && !isNominating && !ceremonyComplete && !aiProcessed) {
      // Set the flag to prevent multiple executions
      setAiProcessed(true);
      
      // AI logic for nominations based on relationships
      const aiNominees = potentialNominees
        .map(houseguest => ({
          houseguest,
          relationship: hoh ? getRelationship(hoh.id, houseguest.id) : 0
        }))
        .sort((a, b) => a.relationship - b.relationship) // Sort by worst relationship first
        .slice(0, 2) // Take the two worst relationships
        .map(item => item.houseguest);
      
      // Set nominees first
      setNominees(aiNominees);
      
      // Delay to simulate decision making then confirm nominations
      const timer = setTimeout(() => {
        if (aiNominees.length === 2) {
          confirmNominations();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [hoh, isNominating, ceremonyComplete, aiProcessed, potentialNominees]);

  if (ceremonyComplete) {
    return (
      <Card className="shadow-lg border-bb-red">
        <CardHeader className="bg-bb-red text-white">
          <CardTitle className="flex items-center">
            <Target className="mr-2" /> Nomination Results
          </CardTitle>
          <CardDescription className="text-white/80">
            Two houseguests have been nominated for eviction
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold">
              {hoh?.name} has nominated:
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {nominees.map(nominee => (
              <HouseguestCard key={nominee.id} houseguest={nominee} />
            ))}
          </div>
          
          <div className="mt-6 text-center text-muted-foreground">
            Continuing to Power of Veto Competition...
            <div className="mt-2 animate-pulse">
              <Clock className="inline-block" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isNominating) {
    return (
      <Card className="shadow-lg border-bb-red">
        <CardHeader className="bg-bb-red text-white">
          <CardTitle>Nomination Ceremony</CardTitle>
          <CardDescription className="text-white/80">
            In progress...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="animate-pulse">
              <Target className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold mt-4">Nomination Ceremony in Progress...</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {hoh?.name} is revealing their nominations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg border-bb-red">
      <CardHeader className="bg-bb-red text-white">
        <CardTitle className="flex items-center">
          <Target className="mr-2" /> Nomination Ceremony
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">
            {hoh?.isPlayer ? "Choose Two Houseguests to Nominate" : `${hoh?.name} must nominate two houseguests`}
          </h3>
          {hoh?.isPlayer ? (
            <p>
              As Head of Household, you must nominate two houseguests for eviction. 
              Select two houseguests below.
            </p>
          ) : (
            <p>
              {hoh?.name} is the Head of Household and must nominate two houseguests for eviction.
            </p>
          )}
        </div>
        
        {hoh?.isPlayer && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {potentialNominees.map(houseguest => {
              const isSelected = nominees.some(nominee => nominee.id === houseguest.id);
              return (
                <div 
                  key={houseguest.id} 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    isSelected ? 'border-bb-red bg-red-50' : 'hover:border-gray-400'
                  }`}
                  onClick={() => toggleNominee(houseguest)}
                >
                  <div className="flex flex-col items-center">
                    <div className="camera-lens w-12 h-12 mb-2">
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
                        {houseguest.name.charAt(0)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">{houseguest.name}</p>
                      {isSelected && (
                        <Badge variant="destructive" className="mt-1">
                          Nominated
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {hoh?.isPlayer && (
          <div className="flex justify-center mt-6">
            <Button 
              variant="destructive" 
              disabled={nominees.length !== 2 || isNominating}
              onClick={confirmNominations}
              className="bg-bb-red hover:bg-bb-red/90"
            >
              Confirm Nominations
            </Button>
          </div>
        )}
        
        {!hoh?.isPlayer && (
          <div className="flex flex-col items-center">
            <div className="animate-pulse">
              <AlertCircle className="w-12 h-12 text-bb-red" />
            </div>
            <h3 className="text-xl font-bold mt-4">Waiting for {hoh?.name}'s Decision...</h3>
          </div>
        )}
      </CardContent>
      {hoh?.isPlayer && (
        <CardFooter className="border-t p-4 bg-gray-50">
          <div className="text-sm text-muted-foreground">
            <p>Selected nominees: {nominees.length}/2</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default NominationPhase;
