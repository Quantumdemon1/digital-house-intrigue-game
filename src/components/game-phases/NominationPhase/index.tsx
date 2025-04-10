
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Clock } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/use-toast';

import { useNominationCeremony } from './hooks/useNominationCeremony';
import { useAINomination } from './hooks/useAINomination';
import NominationCeremonyResult from './NominationCeremonyResult';
import NominationCeremonyProgress from './NominationCeremonyProgress';
import NomineeSelector from './NomineeSelector';
import AIDecisionIndicator from './AIDecisionIndicator';
import TimerDisplay from './TimerDisplay';

const NOMINATION_TIME_LIMIT = 60; // 60 seconds time limit

const NominationPhase: React.FC = () => {
  const { getRandomNominees, getRelationship } = useGame();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState(NOMINATION_TIME_LIMIT);
  const [timerActive, setTimerActive] = useState(true);
  
  const {
    nominees,
    setNominees,
    isNominating,
    ceremonyComplete,
    potentialNominees,
    toggleNominee,
    confirmNominations,
    gameState,
    hoh,
  } = useNominationCeremony();
  
  // Use AI nomination logic
  useAINomination({
    hoh,
    potentialNominees,
    isNominating,
    ceremonyComplete,
    getRelationship,
    confirmNominations,
    setNominees
  });
  
  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && !isNominating && !ceremonyComplete && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeRemaining, timerActive, isNominating, ceremonyComplete]);
  
  // Handle timer expiration
  const handleTimeExpired = () => {
    if (!isNominating && !ceremonyComplete) {
      setTimerActive(false);
      
      // Randomly select nominees
      const randomNominees = getRandomNominees(2, hoh ? [hoh.id] : []);
      
      // Set nominees and show toast
      setNominees(randomNominees);
      
      toast({
        title: "Time Expired!",
        description: "Nominees have been randomly selected.",
        variant: "destructive",
      });
      
      // Proceed with nomination ceremony
      setTimeout(() => {
        confirmNominations();
      }, 1500);
    }
  };
  
  // Stop timer when nominations are confirmed
  useEffect(() => {
    if (isNominating || ceremonyComplete) {
      setTimerActive(false);
    }
  }, [isNominating, ceremonyComplete]);

  if (ceremonyComplete) {
    return <NominationCeremonyResult nominees={nominees} hohName={hoh?.name} />;
  }
  
  if (isNominating) {
    return <NominationCeremonyProgress hohName={hoh?.name} />;
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
        
        {/* Timer Display - Added to top for visibility */}
        <TimerDisplay 
          timeRemaining={timeRemaining} 
          onTimeExpired={handleTimeExpired}
          totalTime={NOMINATION_TIME_LIMIT}
        />
        
        {hoh?.isPlayer ? (
          <NomineeSelector 
            potentialNominees={potentialNominees}
            nominees={nominees}
            onToggleNominee={toggleNominee}
          />
        ) : (
          <AIDecisionIndicator hohName={hoh?.name} />
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
