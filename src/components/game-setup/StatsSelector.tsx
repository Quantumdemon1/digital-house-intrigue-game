
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { HouseguestStats } from '@/models/houseguest';

interface StatsSelectorProps {
  stats: HouseguestStats;
  onStatsChange: (stat: keyof HouseguestStats, value: number) => void;
}

const StatsSelector: React.FC<StatsSelectorProps> = ({ stats, onStatsChange }) => {
  return (
    <div className="space-y-4">
      <Label>Your Stats</Label>
      
      {(Object.keys(stats) as Array<keyof HouseguestStats>).map(stat => (
        <div key={stat} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="capitalize">{stat}</span>
            <span className="font-medium">{stats[stat]}/10</span>
          </div>
          <Slider 
            min={1} 
            max={10} 
            step={1} 
            value={[stats[stat]]} 
            onValueChange={values => {
              onStatsChange(stat, values[0]);
            }} 
          />
        </div>
      ))}
    </div>
  );
};

export default StatsSelector;
