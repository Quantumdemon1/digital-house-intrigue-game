
import React from 'react';
import { Label } from '@/components/ui/label';
import { HouseguestStats } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';
import CustomProgress from '../game-phases/NominationPhase/CustomProgress';

interface StatsSelectorProps {
  stats: HouseguestStats;
  onStatsChange: (stat: keyof HouseguestStats, value: number) => void;
  remainingPoints: number;
}

const StatsSelector: React.FC<StatsSelectorProps> = ({
  stats,
  onStatsChange,
  remainingPoints
}) => {
  const handleIncreaseStat = (stat: keyof HouseguestStats) => {
    if (stat === 'nominations') return; // Skip nominations stat
    
    // Only work with number stats
    if (typeof stats[stat] === 'number') {
      if ((stats[stat] as number) < 10 && remainingPoints > 0) {
        onStatsChange(stat, (stats[stat] as number) + 1);
      }
    }
  };
  
  const handleDecreaseStat = (stat: keyof HouseguestStats) => {
    if (stat === 'nominations') return; // Skip nominations stat
    
    // Only work with number stats
    if (typeof stats[stat] === 'number') {
      if ((stats[stat] as number) > 1) {
        onStatsChange(stat, (stats[stat] as number) - 1);
      }
    }
  };
  
  const getProgressColor = (value: number) => {
    if (value <= 3) return 'bg-red-500';
    if (value <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="space-y-4">
      {Object.keys(stats).filter(key => key !== 'nominations').map(stat => {
        const statKey = stat as keyof HouseguestStats;
        const statValue = stats[statKey] as number;
        
        return (
          <div key={stat} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-md flex items-center">{stat}</span>
              <span className="font-medium">{statValue}/10</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDecreaseStat(statKey)} 
                disabled={statValue <= 1} 
                className="h-7 w-7 shrink-0 text-red-400"
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <CustomProgress value={statValue * 10} indicatorClassName={getProgressColor(statValue)} />
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleIncreaseStat(statKey)} 
                disabled={statValue >= 10 || remainingPoints <= 0} 
                className="h-7 w-7 shrink-0 text-emerald-600"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsSelector;
