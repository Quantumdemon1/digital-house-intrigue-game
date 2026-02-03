
import React, { useState, useEffect } from 'react';
import { Crown, Users, SkipForward, Play } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent, GameCardFooter } from '@/components/ui/game-card';
import { CompetitionVisual, CompetitionTypeBadge } from '@/components/ui/competition-visual';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Button } from '@/components/ui/button';
import { CompetitionType } from '@/models/houseguest/types';

interface CompetitionInitialProps {
  gameWeek: number;
  activeHouseguests: Houseguest[];
  onStartCompetition?: (type: CompetitionType) => void;
  onSkip?: () => void;
}

const CompetitionInitial: React.FC<CompetitionInitialProps> = ({ 
  gameWeek, 
  activeHouseguests,
  onStartCompetition,
  onSkip
}) => {
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const competitionTypes: CompetitionType[] = ['physical', 'mental', 'endurance', 'social', 'luck'];
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
  const [selectedType, setSelectedType] = useState<CompetitionType | null>(null);
  
  useEffect(() => {
    if (selectedType) return; // Stop cycling once selected
    
    const typeInterval = setInterval(() => {
      setCurrentTypeIndex(prev => (prev + 1) % competitionTypes.length);
    }, 200);
    
    const timer = setTimeout(() => {
      setShowPlaceholder(false);
      // Auto-select after animation
      setTimeout(() => {
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        setSelectedType(randomType);
      }, 1500);
    }, 2000);
    
    return () => {
      clearInterval(typeInterval);
      clearTimeout(timer);
    };
  }, [selectedType]);
  
  const handleStartCompetition = () => {
    const type = selectedType || competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
    onStartCompetition?.(type);
  };
  
  const handleSkip = () => {
    // Dispatch fast forward event
    document.dispatchEvent(new Event('game:fastForward'));
    onSkip?.();
  };
  
  return (
    <GameCard variant="primary">
      <GameCardHeader variant="primary" icon={Crown}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Head of Household Competition</GameCardTitle>
            <GameCardDescription>Week {gameWeek}</GameCardDescription>
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
          type={selectedType || (showPlaceholder ? null : competitionTypes[currentTypeIndex])} 
          status="idle" 
        />
        
        {/* Description */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">
            {selectedType ? 'Competition Ready' : 'Selecting Competition Type...'}
          </h3>
          <p className="text-muted-foreground text-sm">
            The Head of Household competition is about to begin. The winner will be safe for the week
            and will nominate two houseguests for eviction.
          </p>
        </div>
        
        {/* Competition Type Display */}
        {(selectedType || !showPlaceholder) && (
          <div className="flex justify-center animate-fade-in">
            <CompetitionTypeBadge type={selectedType || competitionTypes[currentTypeIndex]} />
          </div>
        )}
        
        {/* Competitors */}
        <div className="bg-muted/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Competitors ({activeHouseguests.length})</span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {activeHouseguests.map((houseguest, index) => (
              <div 
                key={houseguest.id} 
                className="flex flex-col items-center text-center animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <StatusAvatar 
                  name={houseguest.name}
                  size="sm"
                  isPlayer={houseguest.isPlayer}
                  showBadge={false}
                />
                <span className="text-xs mt-1.5 truncate w-full">
                  {houseguest.name.split(' ')[0]}
                </span>
                {houseguest.isPlayer && (
                  <span className="text-[10px] text-bb-green font-medium">(You)</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Start Button */}
        {selectedType && (
          <Button
            onClick={handleStartCompetition}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary/80 animate-fade-in"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Competition
          </Button>
        )}
      </GameCardContent>
      
      <GameCardFooter className="bg-primary/5">
        <p className="text-sm text-muted-foreground">
          The winner becomes the new HoH and will nominate two houseguests for eviction.
        </p>
      </GameCardFooter>
    </GameCard>
  );
};

export default CompetitionInitial;
