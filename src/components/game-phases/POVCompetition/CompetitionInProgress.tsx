
import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { CompetitionVisual } from '@/components/ui/competition-visual';
import { CompetitionType } from '@/models/houseguest';
import { getCompetitionStatLabel } from './utils';
import { Badge } from '@/components/ui/badge';

interface CompetitionInProgressProps {
  competitionType?: CompetitionType | null;
}

const CompetitionInProgress: React.FC<CompetitionInProgressProps> = ({ competitionType }) => {
  return (
    <GameCard variant="primary">
      <GameCardHeader variant="primary" icon={Shield}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Power of Veto Competition</GameCardTitle>
            <GameCardDescription>Competition in Progress</GameCardDescription>
          </div>
          {competitionType && (
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 capitalize">
              {competitionType}
            </Badge>
          )}
        </div>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        <CompetitionVisual type={null} status="running" />
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Determining winner...</span>
          </div>
          {competitionType && (
            <p className="text-sm font-medium text-foreground">
              {getCompetitionStatLabel(competitionType)} matters most!
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Selected houseguests are competing for the Power of Veto
          </p>
        </div>
      </GameCardContent>
    </GameCard>
  );
};

export default CompetitionInProgress;
