
import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, SkipForward, Vote, Sparkles } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface JuryVoteRevealProps {
  votes: Record<string, string>; // jurorId -> finalistId
  jurors: Houseguest[];
  finalists: [Houseguest, Houseguest];
  onComplete: (winner: Houseguest, runnerUp: Houseguest) => void;
}

const REVEAL_INTERVAL = 2500; // 2.5 seconds between reveals

const JuryVoteReveal: React.FC<JuryVoteRevealProps> = ({
  votes,
  jurors,
  finalists,
  onComplete
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [tallies, setTallies] = useState<Record<string, number>>({
    [finalists[0].id]: 0,
    [finalists[1].id]: 0
  });
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const [isRevealing, setIsRevealing] = useState(true);
  
  const votesToWin = Math.ceil(jurors.length / 2);
  const jurorOrder = [...jurors]; // Could shuffle for drama
  
  // Celebrate winner
  const celebrateWinner = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);
  
  // Reveal votes one by one
  useEffect(() => {
    if (!isRevealing || winner) return;
    if (revealedCount >= jurors.length) {
      // All votes revealed, determine winner
      const finalTallies = { ...tallies };
      const winnerFinalist = finalTallies[finalists[0].id] > finalTallies[finalists[1].id] 
        ? finalists[0] 
        : finalists[1];
      setWinner(winnerFinalist);
      celebrateWinner();
      return;
    }
    
    const timer = setTimeout(() => {
      const juror = jurorOrder[revealedCount];
      const votedFor = votes[juror.id];
      
      setTallies(prev => ({
        ...prev,
        [votedFor]: prev[votedFor] + 1
      }));
      
      setRevealedCount(prev => prev + 1);
      
      // Check for early winner
      const newTally = tallies[votedFor] + 1;
      if (newTally >= votesToWin) {
        const winnerFinalist = finalists.find(f => f.id === votedFor)!;
        setWinner(winnerFinalist);
        celebrateWinner();
      }
    }, REVEAL_INTERVAL);
    
    return () => clearTimeout(timer);
  }, [revealedCount, isRevealing, winner, jurors.length]);
  
  const handleSkipToResults = () => {
    // Calculate final tallies
    const finalTallies: Record<string, number> = {
      [finalists[0].id]: 0,
      [finalists[1].id]: 0
    };
    
    jurors.forEach(juror => {
      const votedFor = votes[juror.id];
      finalTallies[votedFor]++;
    });
    
    setTallies(finalTallies);
    setRevealedCount(jurors.length);
    
    const winnerFinalist = finalTallies[finalists[0].id] > finalTallies[finalists[1].id] 
      ? finalists[0] 
      : finalists[1];
    setWinner(winnerFinalist);
    celebrateWinner();
  };
  
  const handleContinue = () => {
    if (!winner) return;
    const runnerUp = finalists.find(f => f.id !== winner.id)!;
    onComplete(winner, runnerUp);
  };
  
  // Get revealed vote for a juror
  const getRevealedVote = (jurorIndex: number): string | null => {
    if (jurorIndex >= revealedCount) return null;
    const juror = jurorOrder[jurorIndex];
    return votes[juror.id];
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-bb-gold/30 to-amber-500/20">
          <Vote className="h-8 w-8 text-bb-gold" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground">
          {winner ? 'We Have a Winner!' : 'Reading the Votes'}
        </h3>
        <p className="text-muted-foreground">
          {winner 
            ? `By a vote of ${tallies[winner.id]}-${tallies[finalists.find(f => f.id !== winner.id)!.id]}`
            : `${votesToWin} votes to win`
          }
        </p>
      </div>
      
      {/* Finalists with tallies */}
      <div className="flex justify-center items-start gap-8 md:gap-16">
        {finalists.map(finalist => (
          <div 
            key={finalist.id}
            className={cn(
              "flex flex-col items-center p-6 rounded-xl transition-all",
              winner?.id === finalist.id 
                ? "bg-gradient-to-b from-bb-gold/30 to-card border-2 border-bb-gold shadow-game-lg scale-110" 
                : winner 
                  ? "opacity-50"
                  : "bg-card border border-border"
            )}
          >
            <div className="relative">
              <StatusAvatar
                name={finalist.name}
                imageUrl={finalist.imageUrl}
                size="xl"
                isPlayer={finalist.isPlayer}
              />
              {winner?.id === finalist.id && (
                <div className="absolute -top-3 -right-3 p-2 rounded-full bg-bb-gold shadow-lg animate-bounce">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <h4 className="text-lg font-bold mt-3 text-foreground">{finalist.name}</h4>
            
            {/* Vote tally */}
            <div className={cn(
              "mt-4 text-4xl font-display font-bold tabular-nums",
              winner?.id === finalist.id ? "text-bb-gold" : "text-foreground"
            )}>
              {tallies[finalist.id]}
            </div>
            <p className="text-sm text-muted-foreground">votes</p>
          </div>
        ))}
      </div>
      
      {/* Vote reveal grid */}
      <div className="max-w-lg mx-auto">
        <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">
          Jury Votes
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {jurorOrder.map((juror, index) => {
            const revealedVote = getRevealedVote(index);
            const votedForFinalist = revealedVote 
              ? finalists.find(f => f.id === revealedVote) 
              : null;
            
            return (
              <div 
                key={juror.id}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg transition-all",
                  revealedVote 
                    ? "bg-muted/50" 
                    : index === revealedCount 
                      ? "bg-bb-gold/20 animate-pulse ring-2 ring-bb-gold/50"
                      : "bg-muted/20"
                )}
              >
                <StatusAvatar
                  name={juror.name}
                  imageUrl={juror.imageUrl}
                  size="sm"
                />
                <span className="text-xs font-medium mt-1 text-foreground truncate w-full text-center">
                  {juror.name}
                </span>
                {revealedVote && (
                  <div className={cn(
                    "mt-1 px-2 py-0.5 rounded text-xs font-medium animate-scale-in",
                    votedForFinalist?.id === finalists[0].id 
                      ? "bg-bb-blue/20 text-bb-blue" 
                      : "bg-bb-red/20 text-bb-red"
                  )}>
                    {votedForFinalist?.name.split(' ')[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Winner announcement */}
      {winner && (
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-bb-gold">
            <Sparkles className="h-6 w-6" />
            <span className="text-xl font-display font-bold">
              Congratulations, {winner.name}!
            </span>
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground">
            {winner.isPlayer 
              ? "You are the winner of Big Brother!" 
              : `${winner.name} is the winner of Big Brother!`
            }
          </p>
          <Button 
            onClick={handleContinue}
            size="lg"
            className="bg-gradient-to-r from-bb-gold to-amber-500 hover:from-bb-gold/90 hover:to-amber-500/90 text-white"
          >
            Continue
          </Button>
        </div>
      )}
      
      {/* Skip button */}
      {!winner && (
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            onClick={handleSkipToResults}
            className="text-muted-foreground"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip to Results
          </Button>
        </div>
      )}
    </div>
  );
};

export default JuryVoteReveal;
