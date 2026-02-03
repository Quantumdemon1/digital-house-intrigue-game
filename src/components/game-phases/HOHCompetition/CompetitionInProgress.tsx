
import React, { useEffect, useState } from 'react';
import { CompetitionType } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { CompetitionVisual, CompetitionTypeBadge } from '@/components/ui/competition-visual';
import { Crown, Check } from 'lucide-react';

interface CompetitionInProgressProps {
  competitionType: CompetitionType | null;
}

const CompetitionInProgress: React.FC<CompetitionInProgressProps> = ({ competitionType }) => {
  const { logger } = useGame();
  
  useEffect(() => {
    logger?.info(`CompetitionInProgress rendered with type: ${competitionType}`);
    return () => {
      logger?.info('CompetitionInProgress component unmounting');
    };
  }, [competitionType, logger]);
  
  // Competition phases
  const phases = ['Starting', 'Round 1', 'Round 2', 'Final Round', 'Determining Winner'];
  const [phaseIndex, setPhaseIndex] = useState(0);
  
  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhaseIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % phases.length;
        logger?.info(`Competition phase changed to: ${phases[nextIndex]}`);
        return nextIndex;
      });
    }, 1500);
    
    return () => clearInterval(phaseInterval);
  }, [logger, phases]);
  
  return (
    <GameCard variant="primary">
      <GameCardHeader variant="primary" icon={Crown}>
        <GameCardTitle>Head of Household Competition</GameCardTitle>
        <GameCardDescription>
          {competitionType ? (
            <CompetitionTypeBadge type={competitionType} className="mt-1" />
          ) : (
            'Competition in Progress'
          )}
        </GameCardDescription>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Competition Visual */}
        <CompetitionVisual 
          type={competitionType} 
          status="running" 
        />
        
        {/* Phase Indicator */}
        <div className="bg-muted/50 p-4 rounded-xl">
          <div className="text-center mb-4">
            <span className="text-sm text-muted-foreground">Current Phase</span>
            <h3 className="text-lg font-bold mt-1">{phases[phaseIndex]}</h3>
          </div>
          
          {/* Phase Progress Dots */}
          <div className="flex justify-center items-center gap-3">
            {phases.map((phase, i) => (
              <div key={phase} className="flex items-center gap-3">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-300
                    ${i < phaseIndex 
                      ? 'bg-bb-green text-white' 
                      : i === phaseIndex 
                        ? 'bg-primary text-white animate-pulse-glow' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {i < phaseIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < phases.length - 1 && (
                  <div 
                    className={`w-6 h-0.5 transition-colors duration-300 ${
                      i < phaseIndex ? 'bg-bb-green' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Status Message */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Houseguests are competing for Head of Household
          </p>
          <p className="text-xs text-muted-foreground mt-2 italic animate-pulse">
            Results coming soon...
          </p>
        </div>
      </GameCardContent>
    </GameCard>
  );
};

export default CompetitionInProgress;
