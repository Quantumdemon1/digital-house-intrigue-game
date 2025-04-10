
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { HouseguestStats } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';

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

  const getSliderColor = (value: number) => {
    if (value <= 3) return 'bg-red-500';
    if (value <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      {(Object.keys(stats) as Array<keyof HouseguestStats>).map(stat => (
        <div key={stat} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="capitalize">{stat}</span>
            <span className="font-medium">{stats[stat]}/10</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleDecreaseStat(stat)}
              disabled={stats[stat] <= 1}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getSliderColor(stats[stat])}`} 
                  style={{ width: `${stats[stat] * 10}%` }}
                />
              </div>
            </div>
            
            <Button 
              variant="ghost"
              size="icon"
              className="h-7 w-7"
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
