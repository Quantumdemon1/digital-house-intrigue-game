import React from 'react';
import { HouseguestStats } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle, Dumbbell, Brain, Flame, Heart, Handshake, Target, Dice1, Swords, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatsSelectorProps {
  stats: HouseguestStats;
  onStatsChange: (stat: keyof HouseguestStats, value: number) => void;
  remainingPoints: number;
}

type StatInfo = {
  key: keyof HouseguestStats;
  label: string;
  icon: React.ElementType;
  description: string;
  category: 'competition' | 'social' | 'strategic';
};

const statConfig: StatInfo[] = [
  { key: 'physical', label: 'Physical', icon: Dumbbell, description: 'Boosts Physical competition performance. High Physical (6+) enhances intimidation tactics.', category: 'competition' },
  { key: 'mental', label: 'Mental', icon: Brain, description: 'Boosts Mental competition performance and Final HoH Part 2.', category: 'competition' },
  { key: 'endurance', label: 'Endurance', icon: Flame, description: 'Boosts Endurance competition performance and Final HoH Part 1.', category: 'competition' },
  { key: 'social', label: 'Social', icon: Heart, description: 'Affects interaction success rates. Higher Social = better persuasion outcomes during eviction campaigning.', category: 'social' },
  { key: 'loyalty', label: 'Loyalty', icon: Handshake, description: 'Amplifies promise impact. High Loyalty = trusted ally with stronger promises; low = flexible player with less betrayal damage.', category: 'social' },
  { key: 'strategic', label: 'Strategic', icon: Target, description: 'Reveals hidden intel: relationships (3+), targets (5+), votes (7+), alliances (9+).', category: 'strategic' },
  { key: 'luck', label: 'Luck', icon: Dice1, description: 'Boosts Crapshoot (random) competitions and may influence tiebreakers.', category: 'strategic' },
  { key: 'competition', label: 'Competition', icon: Swords, description: 'Provides a clutch bonus (+0.5 per point) when competing while on the block. Comeback potential!', category: 'competition' },
];

const categoryLabels = {
  competition: { label: 'Competition Stats', color: 'text-bb-blue' },
  social: { label: 'Social Stats', color: 'text-bb-green' },
  strategic: { label: 'Strategic Stats', color: 'text-bb-gold' }
};

const StatsSelector: React.FC<StatsSelectorProps> = ({
  stats,
  onStatsChange,
  remainingPoints
}) => {
  const handleIncreaseStat = (stat: keyof HouseguestStats) => {
    if (stat === 'nominations') return;
    const currentValue = stats[stat] as number;
    if (typeof currentValue === 'number') {
      if (currentValue < 10 && remainingPoints > 0) {
        onStatsChange(stat, currentValue + 1);
      }
    }
  };
  
  const handleDecreaseStat = (stat: keyof HouseguestStats) => {
    if (stat === 'nominations') return;
    const currentValue = stats[stat] as number;
    if (typeof currentValue === 'number') {
      if (currentValue > 1) {
        onStatsChange(stat, currentValue - 1);
      }
    }
  };
  
  const getProgressGradient = (value: number) => {
    if (value <= 3) return 'from-red-500 to-red-600';
    if (value <= 6) return 'from-amber-400 to-amber-500';
    return 'from-emerald-400 to-emerald-500';
  };

  const getCategoryStats = (category: 'competition' | 'social' | 'strategic') => {
    return statConfig.filter(s => s.category === category);
  };

  const renderStatRow = (statInfo: StatInfo) => {
    const statValue = stats[statInfo.key] as number;
    const Icon = statInfo.icon;
    
    return (
      <div key={statInfo.key} className="group relative bg-card/50 rounded-lg p-3 border border-border/50 hover:border-border transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              statInfo.category === 'competition' && "bg-bb-blue/10 text-bb-blue",
              statInfo.category === 'social' && "bg-bb-green/10 text-bb-green",
              statInfo.category === 'strategic' && "bg-bb-gold/10 text-bb-gold"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <span className="font-medium text-sm">{statInfo.label}</span>
                    <HelpCircle className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">{statInfo.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className={cn(
            "font-bold text-lg tabular-nums transition-transform",
            "stat-value"
          )}>
            {statValue}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDecreaseStat(statInfo.key)} 
            disabled={statValue <= 1} 
            className="h-7 w-7 shrink-0 text-bb-red hover:text-bb-red hover:bg-bb-red/10 disabled:opacity-30"
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-300 bg-gradient-to-r",
                getProgressGradient(statValue)
              )}
              style={{ width: `${statValue * 10}%` }}
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleIncreaseStat(statInfo.key)} 
            disabled={statValue >= 10 || remainingPoints <= 0} 
            className="h-7 w-7 shrink-0 text-bb-green hover:text-bb-green hover:bg-bb-green/10 disabled:opacity-30"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Remaining Points Display */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-bb-blue/10 to-bb-blue/5 rounded-lg border border-bb-blue/20">
        <span className="text-sm font-medium">Remaining Points</span>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "w-2 h-5 rounded-sm transition-all duration-200",
                  i < remainingPoints 
                    ? "bg-bb-blue shadow-sm" 
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <span className="font-bold text-lg text-bb-blue tabular-nums w-6 text-center">
            {remainingPoints}
          </span>
        </div>
      </div>

      {/* Stats by Category */}
      {(['competition', 'social', 'strategic'] as const).map(category => (
        <div key={category} className="space-y-2">
          <h4 className={cn("text-xs font-semibold uppercase tracking-wider", categoryLabels[category].color)}>
            {categoryLabels[category].label}
          </h4>
          <div className="space-y-2">
            {getCategoryStats(category).map(renderStatRow)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSelector;
