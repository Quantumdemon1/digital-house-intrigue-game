
import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Users, ArrowRight, SkipForward } from 'lucide-react';
import { StatusAvatar } from '@/components/ui/status-avatar';
import FinalSpeeches from './FinalePhase/FinalSpeeches';
import JuryVoteReveal from './FinalePhase/JuryVoteReveal';
import JuryVoting from './FinalePhase/JuryVoting';
import { Houseguest } from '@/models/houseguest';

type FinaleStage = 'intro' | 'speeches' | 'voting' | 'reveal' | 'complete';

const FinalePhase: React.FC = () => {
  const { game, gameState, dispatch } = useGame();
  const [stage, setStage] = useState<FinaleStage>('intro');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [winner, setWinner] = useState<Houseguest | null>(null);
  const [runnerUp, setRunnerUp] = useState<Houseguest | null>(null);
  
  // Get the final houseguests
  const finalists = gameState.houseguests.filter(hg => hg.status === 'Active').slice(0, 2);
  const jurors = gameState.houseguests.filter(hg => hg.status === 'Jury');
  
  // Check if player is a juror (for spectator mode voting)
  const playerJuror = jurors.find(j => j.isPlayer);
  
  const getRelationship = (guest1Id: string, guest2Id: string): number => {
    return game?.relationshipSystem?.getRelationship(guest1Id, guest2Id) ?? 50;
  };
  
  const handleProceedToSpeeches = useCallback(() => {
    setStage('speeches');
  }, []);
  
  const handleSpeechesComplete = useCallback(() => {
    setStage('voting');
  }, []);
  
  const handleVotingComplete = useCallback((collectedVotes: Record<string, string>) => {
    setVotes(collectedVotes);
    setStage('reveal');
  }, []);
  
  const handleRevealComplete = useCallback((winnerHg: Houseguest, runnerUpHg: Houseguest) => {
    setWinner(winnerHg);
    setRunnerUp(runnerUpHg);
    setStage('complete');
  }, []);
  
  const handleSkipToVoting = useCallback(() => {
    setStage('voting');
  }, []);
  
  const handleContinueToGameOver = useCallback(() => {
    if (winner) {
      dispatch({
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'set_winner',
          params: { winnerId: winner.id }
        }
      });
    }
    dispatch({
      type: 'SET_PHASE',
      payload: 'GameOver'
    });
  }, [dispatch, winner]);
  
  // Spectator mode: auto-advance through stages (except voting if player is juror)
  useEffect(() => {
    if (!gameState.isSpectatorMode) return;
    
    if (stage === 'intro') {
      const timer = setTimeout(() => {
        handleProceedToSpeeches();
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    if (stage === 'speeches') {
      const timer = setTimeout(() => {
        handleSkipToVoting();
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    // Note: voting stage respects player's jury vote - handled in JuryVotingWrapper
    
    if (stage === 'complete' && winner) {
      const timer = setTimeout(() => {
        handleContinueToGameOver();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isSpectatorMode, stage, winner, handleProceedToSpeeches, handleSkipToVoting, handleContinueToGameOver]);
  
  // Intro Stage
  if (stage === 'intro') {
    return (
      <GameCard variant="gold" className="w-full max-w-4xl mx-auto animate-fade-in">
        <GameCardHeader variant="gold" icon={Trophy}>
          <div className="flex items-center justify-between w-full">
            <div>
              <GameCardTitle>Season Finale</GameCardTitle>
              <GameCardDescription>
                Week {gameState.week} - The Final Vote
              </GameCardDescription>
            </div>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              <Star className="h-3 w-3 mr-1" /> Grand Finale
            </Badge>
          </div>
        </GameCardHeader>
        
        <GameCardContent className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-bb-gold/30 to-amber-500/20">
              <Trophy className="h-12 w-12 text-bb-gold" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground">
              The Final 2
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              After weeks of competition, strategy, and social gameplay, these two houseguests 
              have made it to the end. The jury will now decide the winner!
            </p>
          </div>
          
          {/* Finalists */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
            {finalists.map((finalist, index) => (
              <React.Fragment key={finalist.id}>
                <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-b from-bb-gold/10 to-card border-2 border-bb-gold/30 shadow-game-lg w-full sm:w-auto max-w-[200px] sm:max-w-none">
                  <div className="relative">
                    <StatusAvatar
                      name={finalist.name}
                      imageUrl={finalist.imageUrl}
                      size="lg"
                      isPlayer={finalist.isPlayer}
                    />
                    <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 p-1.5 sm:p-2 rounded-full bg-bb-gold shadow-lg">
                      <Star className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold mt-3 sm:mt-4 text-foreground truncate max-w-full">{finalist.name}</h4>
                  <p className="text-sm text-muted-foreground truncate max-w-full">{finalist.occupation}</p>
                  {finalist.isPlayer && (
                    <Badge className="mt-2 bg-bb-blue text-white text-xs">You</Badge>
                  )}
                </div>
                {index === 0 && finalists.length > 1 && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground py-2 sm:py-0">
                    <span className="text-2xl sm:text-3xl font-display font-bold text-bb-gold">VS</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Jury */}
          {jurors.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold text-sm sm:text-base">The Jury ({jurors.length} members)</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                {jurors.map(juror => (
                  <div key={juror.id} className="flex flex-col items-center">
                    <StatusAvatar
                      name={juror.name}
                      imageUrl={juror.imageUrl}
                      size="sm"
                      showBadge={false}
                    />
                    <span className="text-xs sm:text-sm font-medium mt-1 text-foreground truncate max-w-[60px] sm:max-w-[80px]">{juror.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Continue Button */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg"
              onClick={handleProceedToSpeeches}
              className="bg-gradient-to-r from-bb-gold to-amber-500 hover:from-bb-gold/90 hover:to-amber-500/90 text-white font-semibold shadow-game-lg"
            >
              Proceed to Final Speeches
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Speeches Stage
  if (stage === 'speeches') {
    return (
      <GameCard variant="gold" className="w-full max-w-4xl mx-auto animate-fade-in">
        <GameCardHeader variant="gold" icon={Trophy}>
          <div className="flex items-center justify-between w-full">
            <div>
              <GameCardTitle>Final Speeches</GameCardTitle>
              <GameCardDescription>
                Each finalist addresses the jury
              </GameCardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSkipToVoting}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>
        </GameCardHeader>
        
        <GameCardContent>
          <FinalSpeeches
            finalists={finalists}
            jury={jurors}
            onComplete={handleSpeechesComplete}
          />
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Voting Stage - Collect votes
  if (stage === 'voting') {
    return (
      <GameCard variant="gold" className="w-full max-w-4xl mx-auto animate-fade-in">
        <GameCardHeader variant="gold" icon={Trophy}>
          <GameCardTitle>Jury Voting</GameCardTitle>
          <GameCardDescription>
            The jury casts their votes
          </GameCardDescription>
        </GameCardHeader>
        
        <GameCardContent>
          <JuryVotingWrapper
            finalist1={finalists[0]}
            finalist2={finalists[1]}
            jury={jurors}
            getRelationship={getRelationship}
            onVotingComplete={handleVotingComplete}
          />
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Reveal Stage
  if (stage === 'reveal' && finalists.length >= 2) {
    return (
      <GameCard variant="gold" className="w-full max-w-4xl mx-auto animate-fade-in">
        <GameCardHeader variant="gold" icon={Trophy}>
          <GameCardTitle>The Final Vote</GameCardTitle>
          <GameCardDescription>
            And the winner is...
          </GameCardDescription>
        </GameCardHeader>
        
        <GameCardContent>
          <JuryVoteReveal
            votes={votes}
            jurors={jurors}
            finalists={[finalists[0], finalists[1]]}
            onComplete={handleRevealComplete}
          />
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Complete Stage
  if (stage === 'complete' && winner) {
    return (
      <GameCard variant="gold" className="w-full max-w-4xl mx-auto animate-fade-in">
        <GameCardHeader variant="gold" icon={Trophy}>
          <GameCardTitle>Congratulations!</GameCardTitle>
          <GameCardDescription>
            We have a winner!
          </GameCardDescription>
        </GameCardHeader>
        
        <GameCardContent className="space-y-8">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <StatusAvatar
                name={winner.name}
                imageUrl={winner.imageUrl}
                size="xl"
                isPlayer={winner.isPlayer}
              />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Trophy className="h-10 w-10 text-bb-gold animate-bounce" />
              </div>
            </div>
            <h3 className="text-3xl font-display font-bold text-bb-gold">
              {winner.name}
            </h3>
            <p className="text-lg text-muted-foreground">
              Winner of Big Brother!
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleContinueToGameOver}
              className="bg-gradient-to-r from-bb-gold to-amber-500 hover:from-bb-gold/90 hover:to-amber-500/90 text-white"
            >
              Continue to Finale
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </GameCardContent>
      </GameCard>
    );
  }
  
  return null;
};

// Wrapper component to collect votes and pass to reveal
interface JuryVotingWrapperProps {
  finalist1: Houseguest;
  finalist2: Houseguest;
  jury: Houseguest[];
  getRelationship: (id1: string, id2: string) => number;
  onVotingComplete: (votes: Record<string, string>) => void;
}

const JuryVotingWrapper: React.FC<JuryVotingWrapperProps> = ({
  finalist1,
  finalist2,
  jury,
  getRelationship,
  onVotingComplete
}) => {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [currentJurorIndex, setCurrentJurorIndex] = useState(0);
  const [votingComplete, setVotingComplete] = useState(false);
  
  const currentJuror = jury[currentJurorIndex];
  
  // AI voting logic
  React.useEffect(() => {
    if (!currentJuror || votingComplete) return;
    
    if (!currentJuror.isPlayer) {
      const timer = setTimeout(() => {
        const rel1 = getRelationship(currentJuror.id, finalist1.id);
        const rel2 = getRelationship(currentJuror.id, finalist2.id);
        const adjustedRel1 = rel1 + (Math.random() * 20 - 10);
        const adjustedRel2 = rel2 + (Math.random() * 20 - 10);
        const voteForId = adjustedRel1 > adjustedRel2 ? finalist1.id : finalist2.id;
        
        handleVote(voteForId);
      }, 2000 + Math.random() * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentJurorIndex, votingComplete]);
  
  const handleVote = (finalistId: string) => {
    if (!currentJuror) return;
    
    const newVotes = { ...votes, [currentJuror.id]: finalistId };
    setVotes(newVotes);
    
    setTimeout(() => {
      if (currentJurorIndex < jury.length - 1) {
        setCurrentJurorIndex(prev => prev + 1);
      } else {
        setVotingComplete(true);
        setTimeout(() => onVotingComplete(newVotes), 1000);
      }
    }, 1500);
  };
  
  if (votingComplete) {
    return (
      <div className="text-center space-y-4 py-8">
        <Trophy className="mx-auto h-12 w-12 text-bb-gold animate-pulse" />
        <h3 className="text-xl font-bold text-foreground">All Votes Cast</h3>
        <p className="text-muted-foreground">Preparing the final reveal...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
        <StatusAvatar
          name={currentJuror?.name || ''}
          imageUrl={currentJuror?.imageUrl}
          size="lg"
        />
        <h4 className="font-semibold text-lg text-foreground">
          {currentJuror?.name} is voting
          {currentJuror?.isPlayer && " (You)"}
        </h4>
        <p className="text-muted-foreground">Who deserves to win?</p>
      </div>
      
      {currentJuror?.isPlayer && (
        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
          {[finalist1, finalist2].map(finalist => (
            <button
              key={finalist.id}
              onClick={() => handleVote(finalist.id)}
              className="flex flex-col items-center p-6 rounded-xl border-2 border-border hover:border-bb-gold hover:bg-bb-gold/5 transition-all"
            >
              <StatusAvatar
                name={finalist.name}
                imageUrl={finalist.imageUrl}
                size="lg"
              />
              <span className="font-semibold mt-3 text-foreground">{finalist.name}</span>
              <span className="text-xs text-bb-gold mt-2">Vote to Win</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Progress */}
      <div className="flex justify-center gap-2 mt-6">
        {jury.map((juror, index) => (
          <div 
            key={juror.id}
            className={`w-2 h-2 rounded-full transition-all ${
              index < currentJurorIndex 
                ? 'bg-bb-green' 
                : index === currentJurorIndex 
                  ? 'bg-bb-gold animate-pulse' 
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FinalePhase;
