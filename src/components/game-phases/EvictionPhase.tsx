
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { UserX, Clock, Target, Gavel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { StatusAvatar } from '@/components/ui/status-avatar';
import EvictionInteractionStage from './EvictionPhase/EvictionInteractionStage';
import EvictionVoting from './EvictionPhase/EvictionVoting';
import EvictionResults from './EvictionPhase/EvictionResults';
import { useEvictionPhase } from './EvictionPhase/useEvictionPhase';

const EvictionPhase: React.FC = () => {
  const { gameState } = useGame();

  const {
    stage,
    votes,
    timeRemaining,
    nominees,
    nonNominees,
    hoh,
    playerIsNominee,
    isFinal3,
    handleProceedToVoting,
    handleVoteSubmit,
    handleEvictionComplete,
    VOTING_TIME_LIMIT
  } = useEvictionPhase();

  // Render different content based on the current stage
  const renderStageContent = () => {
    // Special case for Final 3
    if (isFinal3) {
      return (
        <div className="text-center space-y-6 py-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-bb-red/20 to-bb-gold/20 mb-2">
            <Gavel className="h-8 w-8 text-bb-gold" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground">Final 3 Decision</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            At the final 3, the Head of Household solely decides who to evict and who to take to the finale.
          </p>
          
          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto mt-8">
            {nominees.map(nominee => (
              <div 
                key={nominee.id} 
                className="group flex flex-col items-center p-6 rounded-xl bg-gradient-to-b from-card to-muted/30 border border-border hover:border-bb-red/50 transition-all duration-300"
              >
                <StatusAvatar
                  name={nominee.name}
                  imageUrl={nominee.imageUrl}
                  status="nominee"
                  size="lg"
                  className="mb-4 group-hover:scale-105 transition-transform"
                />
                <p className="font-semibold text-lg text-foreground">{nominee.name}</p>
                <p className="text-sm text-muted-foreground mb-4">{nominee.occupation}</p>
                <Button
                  variant="destructive"
                  className="mt-2 w-full bg-bb-red hover:bg-bb-red/90"
                  onClick={() => handleEvictionComplete(nominee)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Evict
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground mt-6 italic">
            The evicted houseguest will become the final member of the jury.
          </p>
        </div>
      );
    }

    // Regular eviction process
    switch (stage) {
      case 'interaction':
        return (
          <EvictionInteractionStage 
            nominees={nominees} 
            nonNominees={nonNominees} 
            playerIsNominee={playerIsNominee} 
            onInteractionStageComplete={handleProceedToVoting} 
          />
        );
      case 'voting':
        return (
          <EvictionVoting 
            nominees={nominees} 
            voters={nonNominees} 
            hoh={hoh} 
            votes={votes} 
            onVoteSubmit={handleVoteSubmit} 
            timeRemaining={timeRemaining} 
            totalTime={VOTING_TIME_LIMIT} 
          />
        );
      case 'results':
        return (
          <EvictionResults 
            nominees={nominees} 
            votes={votes} 
            onComplete={handleEvictionComplete} 
          />
        );
      default:
        return (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Preparing eviction ceremony...</div>
          </div>
        );
    }
  };

  return (
    <GameCard variant="danger" className="w-full max-w-4xl mx-auto animate-fade-in">
      <GameCardHeader variant="danger" icon={UserX}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>
              {isFinal3 ? "Final 3 Decision" : "Eviction Ceremony"}
            </GameCardTitle>
            <GameCardDescription>
              Week {gameState.week}
            </GameCardDescription>
          </div>
          <Badge variant="outline" className="bg-bb-red/10 text-white border-white/30">
            <Clock className="h-3 w-3 mr-1" /> Live Vote
          </Badge>
        </div>
      </GameCardHeader>
      
      <GameCardContent>
        {/* Nominees Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-bb-red/10 via-bb-red/5 to-bb-red/10 border border-bb-red/20 p-6 mb-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,65,54,0.1),transparent_70%)]" />
          
          <div className="relative flex flex-col items-center space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {isFinal3 ? "Final 3 Houseguests" : "Current Nominees"}
            </p>
            
            <div className="flex items-center justify-center gap-6">
              {nominees.map((nominee, index) => (
                <React.Fragment key={nominee.id}>
                  <div className="flex flex-col items-center">
                    <StatusAvatar
                      name={nominee.name}
                      imageUrl={nominee.imageUrl}
                      status="nominee"
                      size="md"
                      className="mb-2"
                    />
                    <span className="font-semibold text-foreground">{nominee.name}</span>
                  </div>
                  {index === 0 && nominees.length > 1 && (
                    <div className="flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-bb-red/20 flex items-center justify-center">
                        <Target className="h-5 w-5 text-bb-red animate-pulse" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        
        <Separator className="my-4 bg-border/50" />
        
        {/* Dynamic content based on stage */}
        {renderStageContent()}
      </GameCardContent>
    </GameCard>
  );
};

export default EvictionPhase;
