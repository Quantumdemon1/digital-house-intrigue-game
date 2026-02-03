
import React, { useEffect, useState } from 'react';
import { CompetitionType } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { CompetitionVisual, CompetitionTypeBadge } from '@/components/ui/competition-visual';
import { Crown, Check, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompetitionInProgressProps {
  competitionType: CompetitionType | null;
  onSkip?: () => void;
}

const CompetitionInProgress: React.FC<CompetitionInProgressProps> = ({ competitionType, onSkip }) => {
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
  
  const handleSkip = () => {
    document.dispatchEvent(new Event('game:fastForward'));
    onSkip?.();
  };
  
  return (
    <GameCard variant="primary">
      <GameCardHeader variant="primary" icon={Crown}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Head of Household Competition</GameCardTitle>
            <GameCardDescription>
              {competitionType ? (
                <CompetitionTypeBadge type={competitionType} className="mt-1" />
              ) : (
                'Competition in Progress'
              )}
            </GameCardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>
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
        
        {/* Skip Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="gap-2"
          >
            <SkipForward className="h-4 w-4" />
            Skip to Results
          </Button>
        </div>
      </GameCardContent>
    </GameCard>
  );
};

export default CompetitionInProgress;
