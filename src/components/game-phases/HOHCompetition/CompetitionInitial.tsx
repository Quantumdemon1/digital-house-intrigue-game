
import React, { useState, useEffect } from 'react';
import { Crown, Users } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent, GameCardFooter } from '@/components/ui/game-card';
import { CompetitionVisual, CompetitionTypeBadge } from '@/components/ui/competition-visual';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { CompetitionType } from '@/models/houseguest/types';

interface CompetitionInitialProps {
  gameWeek: number;
  activeHouseguests: Houseguest[];
}

const CompetitionInitial: React.FC<CompetitionInitialProps> = ({ gameWeek, activeHouseguests }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const competitionTypes: CompetitionType[] = ['physical', 'mental', 'endurance', 'social', 'luck'];
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
  
  useEffect(() => {
    const typeInterval = setInterval(() => {
      setCurrentTypeIndex(prev => (prev + 1) % competitionTypes.length);
    }, 200);
    
    const timer = setTimeout(() => {
      setShowPlaceholder(false);
    }, 2000);
    
    return () => {
      clearInterval(typeInterval);
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <GameCard variant="primary">
      <GameCardHeader variant="primary" icon={Crown}>
        <GameCardTitle>Head of Household Competition</GameCardTitle>
        <GameCardDescription>Week {gameWeek}</GameCardDescription>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Competition Visual */}
        <CompetitionVisual 
          type={showPlaceholder ? null : competitionTypes[currentTypeIndex]} 
          status="idle" 
        />
        
        {/* Description */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Competition Starting</h3>
          <p className="text-muted-foreground text-sm">
            The Head of Household competition is about to begin. The winner will be safe for the week
            and will nominate two houseguests for eviction.
          </p>
        </div>
        
        {/* Competition Type Selector Animation */}
        {!showPlaceholder && (
          <div className="flex justify-center animate-fade-in">
            <CompetitionTypeBadge type={competitionTypes[currentTypeIndex]} />
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
