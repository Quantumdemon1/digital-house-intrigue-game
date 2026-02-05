
import React from 'react';
import { Shield, Trophy, Loader2, ArrowRight } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { CompetitionVisual } from '@/components/ui/competition-visual';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface CompetitionResultsProps {
  winner: Houseguest;
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({ winner }) => {
  return (
    <GameCard variant="gold">
      <GameCardHeader variant="gold" icon={Shield}>
        <GameCardTitle>Power of Veto Results</GameCardTitle>
        <GameCardDescription>Competition Complete</GameCardDescription>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Competition Visual */}
        <CompetitionVisual 
          type={null} 
          status="complete"
          winner={winner.name}
        />
        
        {/* Winner Section - properly positioned below */}
        <div className="flex flex-col items-center pt-4 space-y-4">
          <StatusAvatar 
            name={winner.name}
            avatarUrl={winner.avatarUrl}
            status="pov"
            size="xl"
            isPlayer={winner.isPlayer}
            className="animate-celebrate-winner"
          />
          
          <div className="text-center space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              New Power of Veto Holder
            </h3>
            <p className="text-3xl font-bold font-display text-bb-gold">
              {winner.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {winner.isPlayer 
                ? "You won the Power of Veto!" 
                : `${winner.name} has won the Power of Veto!`}
            </p>
          </div>
        </div>
        
        {/* Transition indicator */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <span className="text-sm">Continuing to PoV Meeting</span>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </GameCardContent>
    </GameCard>
  );
};

export default CompetitionResults;
