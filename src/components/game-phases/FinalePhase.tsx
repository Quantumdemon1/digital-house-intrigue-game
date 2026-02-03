
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Users, ArrowRight } from 'lucide-react';
import { StatusAvatar } from '@/components/ui/status-avatar';

const FinalePhase: React.FC = () => {
  const { game, gameState, dispatch } = useGame();
  
  // Get the final houseguests
  const finalists = gameState.houseguests.filter(hg => hg.status === 'Active');
  const jurors = gameState.houseguests.filter(hg => hg.status === 'Jury');
  
  const handleContinue = () => {
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'continue_to_jury_vote',
        params: {}
      }
    });
  };
  
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {finalists.slice(0, 2).map((finalist, index) => (
            <React.Fragment key={finalist.id}>
              <div className="flex flex-col items-center p-8 rounded-2xl bg-gradient-to-b from-bb-gold/10 to-card border-2 border-bb-gold/30 shadow-game-lg">
                <div className="relative">
                  <StatusAvatar
                    name={finalist.name}
                    imageUrl={finalist.imageUrl}
                    size="xl"
                    isPlayer={finalist.isPlayer}
                  />
                  <div className="absolute -top-3 -right-3 p-2 rounded-full bg-bb-gold shadow-lg">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mt-4 text-foreground">{finalist.name}</h4>
                <p className="text-muted-foreground">{finalist.occupation}</p>
                {finalist.isPlayer && (
                  <Badge className="mt-2 bg-bb-blue text-white">You</Badge>
                )}
              </div>
              {index === 0 && finalists.length > 1 && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <span className="text-3xl font-display font-bold text-bb-gold">VS</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Jury */}
        {jurors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="font-semibold">The Jury ({jurors.length} members)</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {jurors.map(juror => (
                <div key={juror.id} className="flex flex-col items-center">
                  <StatusAvatar
                    name={juror.name}
                    imageUrl={juror.imageUrl}
                    size="md"
                    showBadge={false}
                  />
                  <span className="text-sm font-medium mt-1 text-foreground">{juror.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button 
            size="lg"
            onClick={handleContinue}
            className="bg-gradient-to-r from-bb-gold to-amber-500 hover:from-bb-gold/90 hover:to-amber-500/90 text-white font-semibold shadow-game-lg"
          >
            Proceed to Jury Voting
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </GameCardContent>
    </GameCard>
  );
};

export default FinalePhase;
