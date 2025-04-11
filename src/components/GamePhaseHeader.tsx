
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Target } from 'lucide-react';
import type { Houseguest } from '@/models/houseguest';
import type { GamePhase } from '@/models/game-state';

interface GamePhaseHeaderProps {
  week: number;
  phase: GamePhase;
  hoh: Houseguest | null;
  pov: Houseguest | null;
  nominees: Houseguest[];
}

const GamePhaseHeader: React.FC<GamePhaseHeaderProps> = ({ 
  week, 
  phase, 
  hoh, 
  pov, 
  nominees 
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-2 mb-4 gap-2">
      <div className="flex flex-col items-center md:items-start">
        <div className="text-2xl font-bold">Week {week}</div>
        <div className="text-sm text-muted-foreground">{phase} Phase</div>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">
        {hoh && (
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-full px-3 py-1">
            <Crown size={16} className="text-amber-500" />
            <span className="text-sm font-medium">HoH: {hoh.name}</span>
          </div>
        )}
        
        {pov && (
          <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 rounded-full px-3 py-1">
            <Shield size={16} className="text-emerald-500" />
            <span className="text-sm font-medium">PoV: {pov.name}</span>
          </div>
        )}
        
        {nominees.length > 0 && (
          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 rounded-full px-3 py-1">
            <Target size={16} className="text-rose-500" />
            <span className="text-sm font-medium">
              Nominees: {nominees.map(n => n.name).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePhaseHeader;
