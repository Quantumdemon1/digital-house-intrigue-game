
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Vote, ChevronRight, Trophy, User, Clock, Users } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { GameCard, GameCardHeader, GameCardContent, GameCardTitle, GameCardDescription } from '@/components/ui/game-card';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VoteReveal {
  voterId: string;
  voter: Houseguest;
  voteFor: string;
  revealed: boolean;
}

interface DramaticVoteRevealProps {
  nominee1: Houseguest;
  nominee2: Houseguest;
  voters: Houseguest[];
  votes: Record<string, string>;
  onComplete: (evictedId: string) => void;
}

export const DramaticVoteReveal: React.FC<DramaticVoteRevealProps> = ({
  nominee1,
  nominee2,
  voters,
  votes,
  onComplete
}) => {
  const { gameState } = useGame();
  const [voteReveals, setVoteReveals] = useState<VoteReveal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [revealStarted, setRevealStarted] = useState(false);
  const [voteCount, setVoteCount] = useState<Record<string, number>>({
    [nominee1.id]: 0,
    [nominee2.id]: 0
  });
  const [evicted, setEvicted] = useState<Houseguest | null>(null);
  
  // Initialize vote reveals with randomized order
  useEffect(() => {
    const reveals: VoteReveal[] = voters.map(voter => ({
      voterId: voter.id,
      voter,
      voteFor: votes[voter.id] || nominee1.id,
      revealed: false
    }));
    
    // Shuffle for dramatic effect
    const shuffled = [...reveals].sort(() => Math.random() - 0.5);
    setVoteReveals(shuffled);
  }, [voters, votes, nominee1.id]);
  
  const startReveal = () => {
    setRevealStarted(true);
    setCurrentIndex(0);
  };
  
  // Auto-reveal votes with dramatic pacing
  useEffect(() => {
    if (!revealStarted || currentIndex < 0 || evicted) return;
    
    if (currentIndex >= voteReveals.length) {
      // All votes revealed - determine evicted
      const counts = { ...voteCount };
      const evictedId = counts[nominee1.id] >= counts[nominee2.id] ? nominee1.id : nominee2.id;
      const evictedHG = evictedId === nominee1.id ? nominee1 : nominee2;
      
      setTimeout(() => {
        setEvicted(evictedHG);
      }, 2000);
      return;
    }
    
    const currentVote = voteReveals[currentIndex];
    
    const revealTimer = setTimeout(() => {
      // Reveal current vote
      setVoteReveals(prev => prev.map((v, i) => 
        i === currentIndex ? { ...v, revealed: true } : v
      ));
      
      // Update vote count
      setVoteCount(prev => ({
        ...prev,
        [currentVote.voteFor]: (prev[currentVote.voteFor] || 0) + 1
      }));
      
      // Move to next vote
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 2500);
    }, 1500);
    
    return () => clearTimeout(revealTimer);
  }, [revealStarted, currentIndex, voteReveals, evicted, nominee1, nominee2, voteCount]);
  
  const getVotesNeeded = () => Math.floor(voters.length / 2) + 1;
  
  // Eviction result
  if (evicted) {
    return (
      <GameCard variant="danger">
        <GameCardHeader variant="danger" icon={Vote}>
          <GameCardTitle>Eviction Result</GameCardTitle>
          <GameCardDescription>The votes are in</GameCardDescription>
        </GameCardHeader>
        
        <GameCardContent className="space-y-6">
          {/* Vote Tally */}
          <div className="grid grid-cols-2 gap-4">
            {[nominee1, nominee2].map(nominee => {
              const count = voteCount[nominee.id] || 0;
              const isEvicted = nominee.id === evicted.id;
              
              return (
                <div 
                  key={nominee.id}
                  className={cn(
                    "p-4 rounded-lg border text-center transition-all",
                    isEvicted 
                      ? "bg-bb-red/10 border-bb-red/50" 
                      : "bg-bb-green/10 border-bb-green/50"
                  )}
                >
                  <StatusAvatar
                    name={nominee.name}
                    imageUrl={nominee.avatarUrl}
                    status={isEvicted ? "evicted" : "safe"}
                    size="lg"
                    className="mx-auto mb-2"
                  />
                  <h4 className="font-bold">{nominee.name}</h4>
                  <p className={cn(
                    "text-3xl font-bold mt-2",
                    isEvicted ? "text-bb-red" : "text-bb-green"
                  )}>
                    {count} vote{count !== 1 ? 's' : ''}
                  </p>
                  <Badge 
                    variant={isEvicted ? "destructive" : "default"}
                    className="mt-2"
                  >
                    {isEvicted ? "EVICTED" : "SAFE"}
                  </Badge>
                </div>
              );
            })}
          </div>
          
          {/* Announcement */}
          <div className="text-center p-6 bg-bb-red/10 border border-bb-red/30 rounded-lg animate-fade-in">
            <p className="text-lg font-medium text-muted-foreground mb-2">
              By a vote of {voteCount[evicted.id] || 0} to {voteCount[evicted.id === nominee1.id ? nominee2.id : nominee1.id] || 0}...
            </p>
            <h3 className="text-2xl font-bold text-bb-red">
              {evicted.name}, you have been evicted from the Big Brother house.
            </h3>
          </div>
          
          <Button
            onClick={() => onComplete(evicted.id)}
            size="lg"
            className="w-full"
          >
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Pre-reveal state
  if (!revealStarted) {
    return (
      <GameCard variant="default">
        <GameCardHeader icon={Vote}>
          <GameCardTitle>Live Eviction Vote</GameCardTitle>
          <GameCardDescription>Week {gameState.week}</GameCardDescription>
        </GameCardHeader>
        
        <GameCardContent className="space-y-6">
          {/* Nominees */}
          <div className="p-4 bg-bb-red/5 rounded-lg border border-bb-red/20">
            <h4 className="text-center text-sm font-medium text-muted-foreground mb-4">
              NOMINEES
            </h4>
            <div className="flex justify-center items-center gap-8">
              {[nominee1, nominee2].map((nominee, index) => (
                <React.Fragment key={nominee.id}>
                  <div className="flex flex-col items-center">
                    <StatusAvatar
                      name={nominee.name}
                      imageUrl={nominee.avatarUrl}
                      status="nominee"
                      size="lg"
                    />
                    <span className="mt-2 font-semibold">{nominee.name}</span>
                    {nominee.isPlayer && <Badge variant="secondary" className="mt-1">You</Badge>}
                  </div>
                  {index === 0 && (
                    <div className="text-2xl font-bold text-muted-foreground/50">VS</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Voter Info */}
          <div className="flex items-center justify-center gap-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{voters.length} voters</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>{getVotesNeeded()} votes to evict</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground italic mb-4">
              "Houseguests, it is time to vote. One at a time, you will enter the Diary Room
              and cast your vote to evict."
            </p>
          </div>
          
          <Button
            onClick={startReveal}
            size="lg"
            className="w-full bg-gradient-to-r from-bb-red to-red-600"
          >
            Begin Vote Reveal
          </Button>
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Active reveal
  const currentVote = voteReveals[currentIndex];
  
  return (
    <GameCard variant="default">
      <GameCardHeader icon={Vote}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Live Eviction Vote</GameCardTitle>
            <GameCardDescription>Vote {Math.min(currentIndex + 1, voters.length)} of {voters.length}</GameCardDescription>
          </div>
          <Badge variant="outline" className="bg-bb-red/10 text-bb-red border-bb-red/30">
            LIVE
          </Badge>
        </div>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Vote Tally */}
        <div className="grid grid-cols-2 gap-4">
          {[nominee1, nominee2].map(nominee => {
            const count = voteCount[nominee.id] || 0;
            const needed = getVotesNeeded();
            const percentage = (count / needed) * 100;
            
            return (
              <div key={nominee.id} className="text-center">
                <StatusAvatar
                  name={nominee.name}
                  imageUrl={nominee.avatarUrl}
                  status="nominee"
                  size="md"
                  className="mx-auto mb-2"
                />
                <span className="font-medium text-sm">{nominee.name}</span>
                <div className="mt-2 relative h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-bb-red to-red-600 transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {count} vote{count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Current Vote Display */}
        {currentVote && currentIndex < voteReveals.length && (
          <div className="text-center p-6 bg-muted/50 rounded-lg border animate-fade-in">
            {currentVote.revealed ? (
              <>
                <StatusAvatar
                  name={currentVote.voter.name}
                  imageUrl={currentVote.voter.avatarUrl}
                  size="lg"
                  className="mx-auto mb-3"
                />
                <p className="text-lg font-bold">{currentVote.voter.name}</p>
                <p className="text-muted-foreground">voted to evict</p>
                <p className="text-2xl font-bold text-bb-red mt-2">
                  {currentVote.voteFor === nominee1.id ? nominee1.name : nominee2.name}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3 animate-pulse">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-muted-foreground">Revealing vote...</p>
              </>
            )}
          </div>
        )}
        
        {/* Vote History */}
        <div className="grid grid-cols-6 gap-2">
          {voteReveals.map((reveal, index) => (
            <div
              key={reveal.voterId}
              className={cn(
                "p-2 rounded-lg border text-center transition-all",
                index < currentIndex && reveal.revealed 
                  ? "bg-card border-border" 
                  : index === currentIndex
                    ? "bg-primary/10 border-primary animate-pulse"
                    : "bg-muted/30 border-border opacity-50"
              )}
            >
              {index < currentIndex && reveal.revealed ? (
                <>
                  <StatusAvatar
                    name={reveal.voter.name}
                    size="sm"
                    className="mx-auto mb-1"
                  />
                  <span className="text-xs block truncate">{reveal.voter.name.split(' ')[0]}</span>
                  <span className={cn(
                    "text-xs font-medium",
                    reveal.voteFor === nominee1.id ? "text-bb-red" : "text-orange-500"
                  )}>
                    → {reveal.voteFor === nominee1.id ? nominee1.name.split(' ')[0] : nominee2.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <div className={cn(
                    "w-8 h-8 mx-auto rounded-full flex items-center justify-center",
                    index === currentIndex ? "bg-primary text-white" : "bg-muted"
                  )}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground block mt-1">
                    Vote {index + 1}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </GameCardContent>
    </GameCard>
  );
};

export default DramaticVoteReveal;
