
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Crown, Target, Shuffle, Dumbbell, Brain, Timer, Dice1, Users } from 'lucide-react';
import { Houseguest, CompetitionType } from '@/models/houseguest';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent, GameCardFooter } from '@/components/ui/game-card';
import { CompetitionVisual } from '@/components/ui/competition-visual';
import { StatusAvatar, AvatarStatus } from '@/components/ui/status-avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCompetitionStatLabel } from './utils';

interface InitialStageProps {
  povPlayers: Houseguest[];
  week: number;
  startCompetition: () => void;
  nominees: Houseguest[];
  hoh: Houseguest | null;
  competitionType?: CompetitionType | null;
}

// Get icon for competition type
const getCompetitionIcon = (type: CompetitionType) => {
  switch (type) {
    case 'physical': return Dumbbell;
    case 'mental': return Brain;
    case 'endurance': return Timer;
    case 'luck': return Dice1;
    case 'social': return Users;
  }
};

const InitialStage: React.FC<InitialStageProps> = ({ 
  povPlayers, 
  week, 
  startCompetition,
  nominees,
  hoh,
  competitionType
}) => {
  // Get player status for avatar
  const getPlayerStatus = (player: Houseguest): AvatarStatus => {
    if (player.id === hoh?.id) return 'hoh';
    if (nominees.some(n => n.id === player.id)) return 'nominee';
    return 'none';
  };

  // Get player role label
  const getPlayerRole = (player: Houseguest): { label: string; icon: React.ReactNode } => {
    if (player.id === hoh?.id) return { label: 'HoH', icon: <Crown className="w-3 h-3" /> };
    if (nominees.some(n => n.id === player.id)) return { label: 'Nominee', icon: <Target className="w-3 h-3" /> };
    return { label: 'Random', icon: <Shuffle className="w-3 h-3" /> };
  };

  const CompTypeIcon = competitionType ? getCompetitionIcon(competitionType) : Shield;

  return (
    <GameCard variant="primary">
      <GameCardHeader variant="primary" icon={Shield}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Power of Veto Competition</GameCardTitle>
            <GameCardDescription>Week {week}</GameCardDescription>
          </div>
          <div className="bb-badge primary bg-white/20 text-white">
            {povPlayers.length} Competitors
          </div>
        </div>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Competition Visual */}
        <CompetitionVisual type={null} status="idle" />
        
        {/* Competition Type Badge */}
        {competitionType && (
          <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <CompTypeIcon className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold capitalize">{competitionType} Competition</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {getCompetitionStatLabel(competitionType)} will be key to winning!
            </p>
          </div>
        )}
        
        {/* Description */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Power of Veto</h3>
          <p className="text-muted-foreground text-sm">
            Six houseguests will compete for the Power of Veto. The winner can save one nominee from eviction.
          </p>
        </div>
        
        {/* Competitors Grid */}
        <div className="bg-muted/50 p-4 rounded-xl">
          <h4 className="text-sm font-medium mb-4 text-center">Competition Lineup</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {povPlayers.map((player, index) => {
              const role = getPlayerRole(player);
              return (
                <div 
                  key={player.id} 
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg transition-all animate-fade-in",
                    player.isPlayer && "ring-2 ring-bb-green ring-offset-2",
                    "bg-card hover:bg-muted/80"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <StatusAvatar 
                    name={player.name}
                    imageUrl={player.avatarUrl}
                    status={getPlayerStatus(player)}
                    size="md"
                    isPlayer={player.isPlayer}
                  />
                  <span className="text-sm font-medium mt-2">{player.name}</span>
                  <div className={cn(
                    "flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded-full",
                    player.id === hoh?.id && "bg-bb-gold/15 text-bb-gold",
                    nominees.some(n => n.id === player.id) && "bg-bb-red/15 text-bb-red",
                    !nominees.some(n => n.id === player.id) && player.id !== hoh?.id && "bg-muted text-muted-foreground"
                  )}>
                    {role.icon}
                    <span>{role.label}</span>
                  </div>
                  {player.isPlayer && (
                    <span className="text-xs text-bb-green font-medium mt-1">(You)</span>
                  )}
                </div>
              );
            })}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - povPlayers.length) }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="flex flex-col items-center p-3 rounded-lg bg-muted/30 opacity-50"
              >
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl">
                  ?
                </div>
                <span className="text-sm text-muted-foreground mt-2">Not Selected</span>
              </div>
            ))}
          </div>
        </div>
      </GameCardContent>
      
      <GameCardFooter>
        <p className="text-xs text-muted-foreground flex-1">
          The PoV holder can save a nominee or keep nominations the same.
        </p>
        <Button 
          onClick={startCompetition} 
          disabled={povPlayers.length === 0}
          className="gap-2"
          size="lg"
        >
          Start Competition
          <ArrowRight className="w-4 h-4" />
        </Button>
      </GameCardFooter>
    </GameCard>
  );
};

export default InitialStage;
