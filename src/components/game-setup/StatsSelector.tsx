
import React from 'react';
import { Label } from '@/components/ui/label';
import { HouseguestStats } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { Info } from 'lucide-react';
import CustomProgress from '../game-phases/NominationPhase/CustomProgress';

interface StatsSelectorProps {
  stats: HouseguestStats;
  onStatsChange: (stat: keyof HouseguestStats, value: number) => void;
  remainingPoints: number;
}

const StatsSelector: React.FC<StatsSelectorProps> = ({ stats, onStatsChange, remainingPoints }) => {
  const handleIncreaseStat = (stat: keyof HouseguestStats) => {
    if (stats[stat] < 10 && remainingPoints > 0) {
      onStatsChange(stat, stats[stat] + 1);
    }
  };

  const handleDecreaseStat = (stat: keyof HouseguestStats) => {
    if (stats[stat] > 1) {
      onStatsChange(stat, stats[stat] - 1);
    }
  };

  return (
    <div className="space-y-5">
      {/* Points remaining indicator */}
      <div className="flex justify-end mb-2">
        <div className="bg-blue-100 text-blue-800 rounded-md px-3 py-1 text-sm flex items-center">
          <Info className="h-4 w-4 mr-2" />
          <span>Points remaining: {remainingPoints}</span>
        </div>
      </div>
      
      {(Object.keys(stats) as Array<keyof HouseguestStats>).map(stat => (
        <div key={stat} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium capitalize">{stat}</span>
            <span className="font-medium">{stats[stat]}/10</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => handleDecreaseStat(stat)}
              disabled={stats[stat] <= 1}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <CustomProgress 
                value={stats[stat] * 10} 
                indicatorClassName="bg-bb-gold"
              />
            </div>
            
            <Button 
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => handleIncreaseStat(stat)}
              disabled={stats[stat] >= 10 || remainingPoints <= 0}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSelector;
