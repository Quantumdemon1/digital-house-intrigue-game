
import React, { useState, useEffect } from 'react';
import { Gavel, AlertTriangle, ArrowRight } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface HohTiebreakerProps {
  hoh: Houseguest;
  nominees: Houseguest[];
  onVote: (hohId: string, nomineeId: string) => void;
  onContinue?: () => void;
  hasVoted?: boolean;
}

const HohTiebreaker: React.FC<HohTiebreakerProps> = ({ hoh, nominees, onVote, onContinue, hasVoted = false }) => {
  const { logger } = useGame();
  const [aiDecision, setAiDecision] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playerVoted, setPlayerVoted] = useState(false);

  // For AI HoH, simulate decision making
  useEffect(() => {
    if (!hoh.isPlayer) {
      setIsProcessing(true);
      
      // Simulate AI thinking time
      const thinkingTimer = setTimeout(() => {
        // AI chooses based on relationships (simplified - chooses randomly for now)
        const chosenNominee = nominees[Math.floor(Math.random() * nominees.length)];
        setAiDecision(chosenNominee.id);
        
        logger.info(`HoH Tiebreaker: ${hoh.name} breaks the tie by voting to evict ${chosenNominee.name}`);
        
        // Submit vote after reveal delay
        setTimeout(() => {
          onVote(hoh.id, chosenNominee.id);
        }, 2000);
      }, 2500);
      
      return () => clearTimeout(thinkingTimer);
    }
  }, [hoh, nominees, onVote, logger]);

  // Handle the player's tiebreaker vote with clear logging
  const handleTiebreakerVote = (nomineeId: string) => {
    logger.info(`HoH Tiebreaker: ${hoh.name} casting tiebreaker vote`);
    setPlayerVoted(true);
    onVote(hoh.id, nomineeId);
  };
  
  // Track which nominee the player voted for
  const [playerVotedNomineeId, setPlayerVotedNomineeId] = useState<string | null>(null);
  
  const handlePlayerVote = (nomineeId: string) => {
    setPlayerVotedNomineeId(nomineeId);
    handleTiebreakerVote(nomineeId);
  };

  // Handle fast-forward for AI decision
  useEffect(() => {
    const handleFastForward = () => {
      if (!hoh.isPlayer && !aiDecision) {
        const chosenNominee = nominees[Math.floor(Math.random() * nominees.length)];
        onVote(hoh.id, chosenNominee.id);
      }
    };
    
    document.addEventListener('game:fastForward', handleFastForward);
    return () => document.removeEventListener('game:fastForward', handleFastForward);
  }, [hoh, nominees, onVote, aiDecision]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dramatic Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 mb-2 animate-pulse">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>
        
        <h3 className="text-2xl font-display font-bold text-foreground">
          We Have a Tie!
        </h3>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          The votes are deadlocked. As Head of Household, <span className="font-semibold text-bb-gold">{hoh.name}</span> must cast the deciding vote.
        </p>
      </div>
      
      {/* HoH Decision Area */}
      <div className="max-w-2xl mx-auto bg-gradient-to-b from-amber-500/5 to-card border border-amber-500/30 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <StatusAvatar
            name={hoh.name}
            imageUrl={hoh.imageUrl}
            status="hoh"
            size="lg"
          />
          <div>
            <p className="font-semibold text-lg text-foreground">{hoh.name}</p>
            <div className="flex items-center gap-1 text-sm text-bb-gold">
              <Gavel className="h-4 w-4" />
              <span>Head of Household</span>
            </div>
          </div>
        </div>
        
        {hoh.isPlayer ? (
          <div className="space-y-4">
            {!playerVoted ? (
              <>
                <p className="text-center text-muted-foreground">
                  You must break the tie. Who do you vote to evict?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {nominees.map(nominee => (
                    <Button
                      key={nominee.id}
                      variant="outline"
                      size="lg"
                      className="flex flex-col items-center h-auto py-6 hover:bg-bb-red/10 hover:border-bb-red transition-all group"
                      onClick={() => handlePlayerVote(nominee.id)}
                    >
                      <StatusAvatar
                        name={nominee.name}
                        imageUrl={nominee.imageUrl}
                        status="nominee"
                        size="md"
                        className="mb-2 group-hover:scale-105 transition-transform"
                      />
                      <span className="font-semibold">{nominee.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">Vote to Evict</span>
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="animate-fade-in space-y-4">
                <p className="text-xl text-bb-red font-display font-bold text-center">
                  "I vote to evict {nominees.find(n => n.id === playerVotedNomineeId)?.name}."
                </p>
                {onContinue && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={onContinue} size="lg" className="gap-2">
                      Continue to Results <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            {isProcessing && !aiDecision && (
              <div className="animate-pulse">
                <p className="text-muted-foreground italic">
                  {hoh.name} is making their decision...
                </p>
              </div>
            )}
            
            {aiDecision && (
              <div className="animate-fade-in space-y-3">
                <p className="text-lg font-semibold text-foreground">
                  "{hoh.name}" stands and approaches the nominees...
                </p>
                <p className="text-xl text-bb-red font-display font-bold">
                  "I vote to evict {nominees.find(n => n.id === aiDecision)?.name}."
                </p>
                
                {onContinue && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={onContinue} size="lg" className="gap-2">
                      Continue to Results <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HohTiebreaker;
