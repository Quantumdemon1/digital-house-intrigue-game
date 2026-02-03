
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, Check, ArrowRight, Users, Target } from 'lucide-react';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent, GameCardFooter } from '@/components/ui/game-card';
import { CompetitionVisual, CompetitionTypeBadge } from '@/components/ui/competition-visual';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { cn } from '@/lib/utils';
import { useGame } from '@/contexts/GameContext';

interface CompetitionResult {
  id: string;
  name: string;
  position: number;
}

interface CompetitionResultsProps {
  competitionType: CompetitionType | null;
  winner: Houseguest;
  results: CompetitionResult[];
  onContinue: () => void;
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({
  competitionType,
  winner,
  results,
  onContinue
}) => {
  const { dispatch } = useGame();
  
  const handleSocialFirst = () => {
    dispatch({
      type: 'SET_PHASE',
      payload: 'SocialInteraction'
    });
  };
  
  return (
    <GameCard variant="gold">
      <GameCardHeader variant="gold" icon={Trophy}>
        <GameCardTitle>Head of Household Results</GameCardTitle>
        <GameCardDescription>
          {competitionType && <CompetitionTypeBadge type={competitionType} className="mt-1" />}
        </GameCardDescription>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Winner Celebration */}
        <div className="relative">
          <CompetitionVisual 
            type={competitionType} 
            status="complete"
            winner={winner.name}
          />
          
          {/* Winner Avatar Overlay */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <div className="relative">
              <StatusAvatar 
                name={winner.name}
                status="hoh"
                size="xl"
                isPlayer={winner.isPlayer}
                className="animate-celebrate-winner"
              />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Crown className="w-8 h-8 text-bb-gold animate-bounce-subtle" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Winner Name */}
        <div className="text-center pt-8 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            New Head of Household
          </h3>
          <p className="text-3xl font-bold font-display text-bb-gold">
            {winner.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {winner.isPlayer 
              ? "Congratulations! You are the new Head of Household!" 
              : `${winner.name} has won the competition!`}
          </p>
        </div>
        
        {/* Competition Results */}
        <div className="bg-muted/50 p-4 rounded-xl">
          <h4 className="font-medium mb-4 text-center text-sm">Competition Standings</h4>
          <div className="space-y-2">
            {results.sort((a, b) => a.position - b.position).slice(0, 5).map((result, index) => (
              <div 
                key={result.id}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg transition-all animate-fade-in",
                  index === 0 
                    ? 'bg-bb-gold/10 border border-bb-gold/30' 
                    : 'bg-background hover:bg-muted/50'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 
                      ? 'bg-bb-gold text-white' 
                      : index === 1
                        ? 'bg-gray-400 text-white'
                        : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-muted text-muted-foreground'
                  )}>
                    {result.position}
                  </div>
                  <span className={cn(
                    "font-medium",
                    index === 0 && "text-bb-gold"
                  )}>
                    {result.name}
                  </span>
                </div>
                {index === 0 && (
                  <Check className="w-5 h-5 text-bb-green" />
                )}
              </div>
            ))}
            {results.length > 5 && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                +{results.length - 5} more competitors
              </p>
            )}
          </div>
        </div>
      </GameCardContent>
      
      <GameCardFooter>
        {/* Navigation Options */}
        <div className="w-full space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Choose your next action:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              variant="outline"
              onClick={handleSocialFirst}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Talk to Houseguests First
            </Button>
            <Button 
              onClick={onContinue}
              className="bg-primary hover:bg-primary/90 text-white gap-2"
              size="lg"
            >
              <Target className="w-4 h-4" />
              Continue to Nominations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GameCardFooter>
    </GameCard>
  );
};

export default CompetitionResults;
