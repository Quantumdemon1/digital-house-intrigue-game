import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserX, DoorOpen, Clock, Users, Gavel, Sparkles } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import confetti from 'canvas-confetti';
import { useGameControl } from '@/contexts/GameControlContext';
import { useGame } from '@/contexts/GameContext';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { GameCard, GameCardHeader, GameCardContent, GameCardTitle } from '@/components/ui/game-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

  const goesToJury = gameState.week >= 5;

  const allVotes = { ...votes };
  if (tiebreakerVote && hohId) {
    allVotes[hohId] = tiebreakerVote;
  }
  
  const voteCounts = Object.values(allVotes).reduce((counts, nomineeId) => {
    counts[nomineeId] = (counts[nomineeId] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const totalVotes = Object.values(allVotes).length;

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

  useEffect(() => {
    if (stage !== 'counting') return;
    
    if (revealedCount >= totalVotes) {
      const timer = setTimeout(() => {
        setStage('announcement');

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

  if (!nominees || nominees.length !== 2 || !evictedHouseguest || !savedHouseguest) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse-slow">
          <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Calculating results...</p>
        </div>
      </div>
    );
  }

  // Counting votes stage - Dramatic VS layout
  if (stage === 'counting') {
    return (
      <GameCard variant="danger" className="max-w-2xl mx-auto overflow-hidden">
        <GameCardHeader variant="danger" icon={Gavel}>
          <GameCardTitle>Live Eviction Vote</GameCardTitle>
        </GameCardHeader>
        <GameCardContent className="space-y-8">
          {/* Dramatic VS Layout */}
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Nominee 1 */}
            <div className="flex flex-col items-center space-y-3">
              <StatusAvatar 
                name={nominees[0].name} 
                status="nominee" 
                size="lg"
                avatarUrl={nominees[0].avatarUrl}
              />
              <span className="font-semibold text-sm md:text-base text-center max-w-[80px] truncate">
                {nominees[0].name.split(' ')[0]}
              </span>
              <div className="vote-counter">
                <span className={cn(
                  "vote-counter-number text-bb-red",
                  revealedCount > 0 && "animating"
                )}>
                  {Math.min(voteCounts[nominees[0].id] || 0, revealedCount)}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">votes</span>
              </div>
            </div>
            
            {/* VS Divider */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-bb-red to-bb-red-dark flex items-center justify-center shadow-glow-danger">
                <span className="text-white font-bold text-lg md:text-xl themed-header">VS</span>
              </div>
            </div>
            
            {/* Nominee 2 */}
            <div className="flex flex-col items-center space-y-3">
              <StatusAvatar 
                name={nominees[1].name} 
                status="nominee" 
                size="lg"
                avatarUrl={nominees[1].avatarUrl}
              />
              <span className="font-semibold text-sm md:text-base text-center max-w-[80px] truncate">
                {nominees[1].name.split(' ')[0]}
              </span>
              <div className="vote-counter">
                <span className={cn(
                  "vote-counter-number text-bb-red",
                  revealedCount > 0 && "animating"
                )}>
                  {Math.min(voteCounts[nominees[1].id] || 0, revealedCount)}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">votes</span>
              </div>
            </div>
          </div>
          
          {/* Vote Progress */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalVotes }).map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    i < revealedCount 
                      ? "bg-bb-red shadow-glow-danger scale-110" 
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Revealing vote {Math.min(revealedCount + 1, totalVotes)} of {totalVotes}
            </p>
          </div>
        </GameCardContent>
      </GameCard>
    );
  }

  // Host announcement stage - Dramatic reveal
  if (stage === 'announcement') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Vote Results Banner */}
        <GameCard variant="danger" className="overflow-hidden">
          <GameCardHeader variant="danger" icon={UserX}>
            <GameCardTitle>Eviction Result</GameCardTitle>
          </GameCardHeader>
          <GameCardContent>
            {/* Final Vote Display */}
            <div className="flex items-center justify-center gap-6 md:gap-12 py-4">
              {/* Saved Houseguest */}
              <div className="flex flex-col items-center space-y-3 opacity-60">
                <StatusAvatar 
                  name={savedHouseguest.name} 
                  status="safe" 
                  size="lg"
                  avatarUrl={savedHouseguest.avatarUrl}
                />
                <div className="text-center">
                  <p className="font-semibold">{savedHouseguest.name.split(' ')[0]}</p>
                  <Badge variant="outline" className="mt-1 bg-bb-green/10 text-bb-green border-bb-green/30">
                    {voteCounts[savedHouseguest.id] || 0} votes
                  </Badge>
                </div>
              </div>
              
              <div className="text-2xl md:text-3xl font-bold text-muted-foreground themed-header">
                TO
              </div>
              
              {/* Evicted Houseguest */}
              <div className="flex flex-col items-center space-y-3 animate-eviction-reveal">
                <StatusAvatar 
                  name={evictedHouseguest.name} 
                  status="evicted" 
                  size="xl"
                  avatarUrl={evictedHouseguest.avatarUrl}
                />
                <div className="text-center">
                  <p className="font-bold text-lg">{evictedHouseguest.name}</p>
                  <Badge variant="destructive" className="mt-1">
                    {voteCounts[evictedHouseguest.id] || 0} votes
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Host Announcement */}
            <div className="text-center space-y-4 mt-6 py-6 border-t border-border">
              <p className="text-lg text-muted-foreground italic">
                "By a vote of{' '}
                <span className="text-bb-red font-bold">{voteCounts[evictedHouseguest.id] || 0}</span>
                {' '}to{' '}
                <span className="text-bb-green font-bold">{voteCounts[savedHouseguest.id] || 0}</span>..."
              </p>
              
              <p className="text-2xl md:text-3xl font-bold text-bb-red animate-pulse-glow themed-header">
                {evictedHouseguest.name}
              </p>
              
              <p className="text-lg md:text-xl">
                "...you have been evicted from the Big Brother house."
              </p>
            </div>
          </GameCardContent>
        </GameCard>
        
        {/* Player Evicted Banner */}
        {evictedHouseguest.isPlayer && (
          <GameCard variant="danger" className="border-2 border-bb-red animate-shake">
            <GameCardContent className="text-center py-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-bb-red/20 rounded-full mb-4">
                <UserX className="w-6 h-6 text-bb-red" />
                <span className="font-bold text-bb-red text-lg themed-header">YOU HAVE BEEN EVICTED</span>
              </div>
              {goesToJury && (
                <p className="text-purple-400 font-medium flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  You will join the jury and help decide the winner.
                </p>
              )}
            </GameCardContent>
          </GameCard>
        )}
        
        {/* Continue Button */}
        <div className="flex justify-center">
          {evictedHouseguest.isPlayer ? (
            <Button 
              onClick={() => goesToJury ? setStage('jury') : setStage('complete')} 
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Users className="mr-2 h-5 w-5" />
              {goesToJury ? 'Continue as Jury Member' : 'Continue'}
            </Button>
          ) : (
            <Button 
              onClick={() => setStage('goodbye')} 
              variant="outline"
              size="lg"
              className="border-2 hover:bg-muted"
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
    const progressPercent = (goodbyeTimer / 30) * 100;
    
    return (
      <GameCard variant="default" className="max-w-md mx-auto">
        <GameCardHeader variant="default" icon={Clock}>
          <GameCardTitle>Say Your Goodbyes</GameCardTitle>
        </GameCardHeader>
        <GameCardContent className="text-center space-y-6">
          <StatusAvatar 
            name={evictedHouseguest.name} 
            status="evicted" 
            size="xl"
            className="mx-auto"
            avatarUrl={evictedHouseguest.avatarUrl}
          />
          
          <p className="text-muted-foreground">
            {evictedHouseguest.name} has {goodbyeTimer} seconds to say goodbye.
          </p>
          
          {/* Timer Ring */}
          <div className="relative w-24 h-24 mx-auto">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted"
                strokeDasharray="100, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-bb-red transition-all duration-1000"
                strokeDasharray={`${progressPercent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono">
              {goodbyeTimer}
            </span>
          </div>
          
          <Button variant="ghost" onClick={skipGoodbye} className="text-muted-foreground hover:text-foreground">
            Skip Goodbye
          </Button>
        </GameCardContent>
      </GameCard>
    );
  }

  // Jury announcement stage
  if (stage === 'jury') {
    return (
      <GameCard variant="glass" className="max-w-md mx-auto border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-card">
        <GameCardHeader variant="default" icon={Users} iconClassName="text-purple-400">
          <GameCardTitle className="text-purple-400">Jury Member</GameCardTitle>
        </GameCardHeader>
        <GameCardContent className="text-center space-y-6">
          <StatusAvatar 
            name={evictedHouseguest.name} 
            status="evicted" 
            size="xl"
            className="mx-auto"
            avatarUrl={evictedHouseguest.avatarUrl}
          />
          
          <div className="space-y-4">
            <p className="text-lg">
              "{evictedHouseguest.name}, you will now join the jury house."
            </p>
            
            <p className="text-muted-foreground">
              You will help decide who wins Big Brother.
            </p>
            
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
              Jury Member #{gameState.juryMembers.length + 1}
            </Badge>
          </div>
          
          <Button onClick={proceedToJury} className="bg-purple-600 hover:bg-purple-700" size="lg">
            Continue
          </Button>
        </GameCardContent>
      </GameCard>
    );
  }

  // Complete stage
  return (
    <GameCard variant="default" className="max-w-md mx-auto">
      <GameCardHeader variant="primary" icon={DoorOpen}>
        <GameCardTitle>Eviction Complete</GameCardTitle>
      </GameCardHeader>
      <GameCardContent className="text-center space-y-6">
        <StatusAvatar 
          name={evictedHouseguest.name} 
          status="evicted" 
          size="xl"
          className="mx-auto"
          avatarUrl={evictedHouseguest.avatarUrl}
        />
        
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-bold">{evictedHouseguest.name}</span> has left the house.
          </p>
          
          {goesToJury && (
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
              <Users className="w-3 h-3 mr-1" />
              Now a Jury Member
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={handleCompleteEviction} 
          className="bg-bb-blue hover:bg-bb-blue/90 text-white" 
          size="lg" 
          disabled={isProcessing}
        >
          <DoorOpen className="mr-2 h-5 w-5" />
          Continue to Social Time
        </Button>
      </GameCardContent>
    </GameCard>
  );
};

export default EvictionResults;
