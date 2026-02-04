
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { UserX, Clock, Target, Gavel, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { StatusAvatar } from '@/components/ui/status-avatar';
import EvictionInteractionStage from './EvictionPhase/EvictionInteractionStage';
import NomineeSpeeches from './EvictionPhase/NomineeSpeeches';
import EvictionVoting from './EvictionPhase/EvictionVoting';
import EvictionResults from './EvictionPhase/EvictionResults';
import HohTiebreaker from './EvictionPhase/HohTiebreaker';
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
    isFinal4,
    soleVoter,
    tiebreakerVote,
    handleProceedToVoting,
    handleSpeechesComplete,
    handleVoteSubmit,
    handleTiebreakerVote,
    handleEvictionComplete,
    progressToResults,
    VOTING_TIME_LIMIT
  } = useEvictionPhase();

  // Render different content based on the current stage
  const renderStageContent = () => {
    // Special case for Final 3 (after Final HoH - HoH evicts one of two)
    if (isFinal3) {
      return (
        <div className="text-center space-y-4 sm:space-y-6 py-2 sm:py-4">
          <div className="inline-flex items-center justify-center p-2 sm:p-3 rounded-full bg-gradient-to-br from-bb-red/20 to-bb-gold/20 mb-2">
            <Gavel className="h-6 w-6 sm:h-8 sm:w-8 text-bb-gold" />
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground">Final 3 Decision</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-2">
            At the final 3, the Head of Household solely decides who to evict and who to take to the finale.
          </p>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-lg mx-auto mt-4 sm:mt-8">
            {nominees.map(nominee => (
              <div 
                key={nominee.id} 
                className="group flex flex-col items-center p-4 sm:p-6 rounded-xl bg-gradient-to-b from-card to-muted/30 border border-border hover:border-bb-red/50 transition-all duration-300"
              >
                <StatusAvatar
                  name={nominee.name}
                  imageUrl={nominee.imageUrl}
                  status="nominee"
                  size="md"
                  className="mb-3 sm:mb-4 group-hover:scale-105 transition-transform"
                />
                <p className="font-semibold text-base sm:text-lg text-foreground truncate max-w-full">{nominee.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 truncate max-w-full">{nominee.occupation}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-1 sm:mt-2 w-full bg-bb-red hover:bg-bb-red/90"
                  onClick={() => handleEvictionComplete(nominee)}
                >
                  <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Evict
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 italic px-2">
            The evicted houseguest will become the final member of the jury.
          </p>
        </div>
      );
    }

    // Regular eviction process with BB USA format stages
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
      case 'speeches':
        return (
          <NomineeSpeeches
            nominees={nominees}
            onComplete={handleSpeechesComplete}
          />
        );
      case 'voting':
        return (
          <>
            {/* Final 4 sole voter banner */}
            {isFinal4 && soleVoter && (
              <div className="mb-4 p-4 bg-gradient-to-r from-bb-gold/20 to-amber-500/10 rounded-lg border border-bb-gold/30 text-center">
                <Badge variant="outline" className="bg-bb-gold/10 text-bb-gold border-bb-gold/30 mb-2">
                  <Crown className="h-3 w-3 mr-1" /> Final 4 - Sole Vote to Evict
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {soleVoter.name} is the only houseguest who can vote. Their decision will determine who goes home.
                </p>
              </div>
            )}
            <EvictionVoting 
              nominees={nominees} 
              voters={nonNominees} 
              hoh={hoh} 
              votes={votes} 
              onVoteSubmit={handleVoteSubmit} 
              timeRemaining={timeRemaining} 
              totalTime={VOTING_TIME_LIMIT}
              isFinal4={isFinal4}
              soleVoter={soleVoter}
            />
          </>
        );
      case 'tiebreaker':
        return hoh ? (
          <HohTiebreaker
            hoh={hoh}
            nominees={nominees}
            onVote={handleTiebreakerVote}
            onContinue={progressToResults}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Processing tiebreaker...</p>
          </div>
        );
      case 'results':
        return (
          <EvictionResults 
            nominees={nominees} 
            votes={votes} 
            tiebreakerVote={tiebreakerVote}
            hohId={hoh?.id}
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

  // Get stage label for header
  const getStageLabel = () => {
    switch (stage) {
      case 'interaction': return 'Campaign Period';
      case 'speeches': return 'Final Pleas';
      case 'voting': return 'Live Vote';
      case 'tiebreaker': return 'Tiebreaker';
      case 'results': return 'Results';
      default: return 'Live Vote';
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
            <Clock className="h-3 w-3 mr-1" /> {getStageLabel()}
          </Badge>
        </div>
      </GameCardHeader>
      
      <GameCardContent>
        {/* Nominees Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-bb-red/10 via-bb-red/5 to-bb-red/10 border border-bb-red/20 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,65,54,0.1),transparent_70%)]" />
          
          <div className="relative flex flex-col items-center space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {isFinal3 ? "Final 3 Houseguests" : "Current Nominees"}
            </p>
            
            <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6">
              {nominees.map((nominee, index) => (
                <React.Fragment key={nominee.id}>
                  <div className="flex flex-col items-center">
                    <StatusAvatar
                      name={nominee.name}
                      imageUrl={nominee.imageUrl}
                      status="nominee"
                      size="sm"
                      className="mb-1 sm:mb-2"
                    />
                    <span className="font-semibold text-sm sm:text-base text-foreground truncate max-w-[100px] sm:max-w-none">{nominee.name}</span>
                  </div>
                  {index === 0 && nominees.length > 1 && (
                    <div className="flex items-center justify-center">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-bb-red/20 flex items-center justify-center">
                        <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-bb-red animate-pulse" />
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
