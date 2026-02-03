import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserX, DoorOpen, Clock, Users } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import confetti from 'canvas-confetti';
import { useGameControl } from '@/contexts/GameControlContext';
import { useGame } from '@/contexts/GameContext';

// Create a simple custom progress component
const Progress = ({
  value,
  className
}: {
  value: number;
  className?: string;
}) => {
  return <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className || ''}`}>
      <div className="h-full bg-primary transition-all" style={{
      width: `${value}%`
    }} />
    </div>;
};

interface EvictionResultsProps {
  nominees: Houseguest[];
  votes: Record<string, string>;
  tiebreakerVote?: string | null;
  hohId?: string;
  onComplete: (evictedHouseguest: Houseguest) => void;
}

type ResultStage = 'counting' | 'announcement' | 'goodbye' | 'jury' | 'complete';

const EvictionResults: React.FC<EvictionResultsProps> = ({
  nominees,
  votes,
  tiebreakerVote,
  hohId,
  onComplete
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [stage, setStage] = useState<ResultStage>('counting');
  const [evictedHouseguest, setEvictedHouseguest] = useState<Houseguest | null>(null);
  const [savedHouseguest, setSavedHouseguest] = useState<Houseguest | null>(null);
  const [goodbyeTimer, setGoodbyeTimer] = useState(30);
  const { isProcessing } = useGameControl();
  const { gameState } = useGame();

  // Check if evicted houseguest goes to jury (usually week 5+)
  const goesToJury = gameState.week >= 5;

  // Count votes for each nominee, including tiebreaker vote if present
  const allVotes = { ...votes };
  if (tiebreakerVote && hohId) {
    allVotes[hohId] = tiebreakerVote;
  }
  
  const voteCounts = Object.values(allVotes).reduce((counts, nomineeId) => {
    counts[nomineeId] = (counts[nomineeId] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const totalVotes = Object.values(allVotes).length;

  // Determine who's evicted
  useEffect(() => {
    if (!nominees || nominees.length !== 2) return;
    const nominee1Votes = voteCounts[nominees[0].id] || 0;
    const nominee2Votes = voteCounts[nominees[1].id] || 0;
    if (nominee1Votes > nominee2Votes) {
      setEvictedHouseguest(nominees[0]);
      setSavedHouseguest(nominees[1]);
    } else {
      setEvictedHouseguest(nominees[1]);
      setSavedHouseguest(nominees[0]);
    }
  }, [nominees, voteCounts]);

  // Gradually reveal votes for dramatic effect
  useEffect(() => {
    if (stage !== 'counting') return;
    
    if (revealedCount >= totalVotes) {
      const timer = setTimeout(() => {
        setStage('announcement');

        // If player is saved, celebrate with confetti
        if (savedHouseguest?.isPlayer) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 500);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setRevealedCount(prev => prev + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [revealedCount, totalVotes, savedHouseguest, stage]);

  // Goodbye timer countdown
  useEffect(() => {
    if (stage !== 'goodbye') return;
    if (goodbyeTimer <= 0) {
      if (goesToJury) {
        setStage('jury');
      } else {
        setStage('complete');
      }
      return;
    }
    const timer = setTimeout(() => {
      setGoodbyeTimer(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [stage, goodbyeTimer, goesToJury]);

  const handleCompleteEviction = () => {
    if (evictedHouseguest) {
      onComplete(evictedHouseguest);
    }
  };

  const skipGoodbye = () => {
    if (goesToJury) {
      setStage('jury');
    } else {
      setStage('complete');
    }
  };

  const proceedToJury = () => {
    setStage('complete');
  };

  // Add early return to handle case when nominees array is invalid or empty
  if (!nominees || nominees.length !== 2 || !evictedHouseguest || !savedHouseguest) {
    return <div className="p-4 text-center">
        <p>Calculating results...</p>
      </div>;
  }

  const nominee1Progress = (voteCounts[nominees[0].id] || 0) / totalVotes * 100;
  const nominee2Progress = (voteCounts[nominees[1].id] || 0) / totalVotes * 100;

  // Counting votes stage
  if (stage === 'counting') {
    return (
      <div className="space-y-6 text-center">
        <h3 className="text-xl font-bold">Eviction Results</h3>
        <div className="space-y-8">
          <p className="text-muted-foreground">
            Revealing votes: {revealedCount} of {totalVotes}
          </p>
          
          <div className="space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{nominees[0].name}</span>
                <span className="font-medium">
                  {Math.min(voteCounts[nominees[0].id] || 0, revealedCount)} votes
                </span>
              </div>
              <Progress value={nominee1Progress} className="bg-gray-200" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{nominees[1].name}</span>
                <span className="font-medium">
                  {Math.min(voteCounts[nominees[1].id] || 0, revealedCount)} votes
                </span>
              </div>
              <Progress value={nominee2Progress} className="bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Host announcement stage
  if (stage === 'announcement') {
    return (
      <div className="space-y-8 text-center">
        <div className="p-6 bg-opacity-80 rounded-lg border border-red-200 bg-gray-950">
          <div className="flex items-center justify-center mb-4">
            <UserX className="h-12 w-12 text-red-600 mr-4" />
            <h3 className="text-2xl font-bold">Eviction Result</h3>
          </div>
          
          {/* Host-style announcement */}
          <div className="space-y-4 py-4">
            <p className="text-lg text-muted-foreground italic">
              "By a vote of {voteCounts[evictedHouseguest.id] || 0} to {voteCounts[savedHouseguest.id] || 0}..."
            </p>
            
            <p className="text-3xl font-bold text-bb-red mt-4 animate-fade-in">
              {evictedHouseguest.name}
            </p>
            
            <p className="text-xl">
              "...you have been evicted from the Big Brother house."
            </p>
          </div>
          
          {evictedHouseguest.isPlayer ? (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-md">
                <p className="font-bold text-red-400">
                  You have been evicted from the Big Brother house.
                </p>
              </div>
              {goesToJury && (
                <p className="text-purple-400 font-medium">
                  You will join the jury and help decide the winner.
                </p>
              )}
              <Button 
                onClick={() => goesToJury ? setStage('jury') : setStage('complete')} 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                {goesToJury ? 'Continue as Jury Member' : 'Continue'}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setStage('goodbye')} 
              className="mt-6"
              size="lg"
            >
              <Clock className="mr-2 h-5 w-5" />
              Say Your Goodbyes
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Goodbye stage
  if (stage === 'goodbye') {
    return (
      <div className="space-y-8 text-center">
        <div className="p-6 rounded-lg border border-muted bg-card">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground mr-2" />
            <h3 className="text-xl font-bold">Say Your Goodbyes</h3>
          </div>
          
          <p className="text-muted-foreground mb-6">
            {evictedHouseguest.name} has {goodbyeTimer} seconds to say goodbye to the houseguests.
          </p>
          
          {/* Timer visual */}
          <div className="max-w-xs mx-auto mb-6">
            <Progress value={(goodbyeTimer / 30) * 100} className="h-3" />
            <p className="text-2xl font-mono font-bold mt-2">{goodbyeTimer}s</p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={skipGoodbye}>
              Skip Goodbye
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Jury announcement stage
  if (stage === 'jury') {
    return (
      <div className="space-y-8 text-center">
        <div className="p-6 rounded-lg border border-purple-200 bg-gradient-to-b from-purple-950/50 to-card">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-purple-400 mr-2" />
            <h3 className="text-xl font-bold">Jury Member</h3>
          </div>
          
          <p className="text-lg mb-4">
            "{evictedHouseguest.name}, you will now join the jury house."
          </p>
          
          <p className="text-muted-foreground mb-6">
            You will help decide who wins Big Brother.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Current jury: {gameState.juryMembers.length + 1} members
          </p>
          
          <Button onClick={proceedToJury} className="mt-6" size="lg">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Complete stage
  return (
    <div className="space-y-8 text-center">
      <div className="p-6 bg-opacity-80 rounded-lg border border-muted bg-card">
        <div className="flex items-center justify-center mb-4">
          <DoorOpen className="h-12 w-12 text-muted-foreground mr-4" />
          <h3 className="text-2xl font-bold">Eviction Complete</h3>
        </div>
        
        <p className="text-lg mb-2">
          {evictedHouseguest.name} has left the house.
        </p>
        
        {goesToJury && (
          <p className="text-muted-foreground">
            They are now a member of the jury.
          </p>
        )}
        
        <div className="mt-6">
          <Button 
            onClick={handleCompleteEviction} 
            className="bg-bb-blue hover:bg-bb-blue/90 text-white" 
            size="lg" 
            disabled={isProcessing}
          >
            <DoorOpen className="mr-2 h-5 w-5" />
            Continue to Social Time
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvictionResults;