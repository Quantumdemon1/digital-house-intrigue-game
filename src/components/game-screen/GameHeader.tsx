
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Users, Calendar, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PromiseButton from './PromiseButton';

const GameHeader: React.FC = () => {
  const { gameState } = useGame();
  
  const activeHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active');
  
  return (
    <header className="bg-slate-800 text-white p-3 rounded-lg mb-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-amber-400" />
          <span>Week {gameState.week}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-blue-400" />
          <span>{activeHouseguests.length} Players</span>
        </div>
        {gameState.hohWinner && (
          <div className="hidden sm:flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>HoH: {gameState.hohWinner.name}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <PromiseButton />
        <Badge variant="outline" className="bg-slate-700">
          {gameState.phase}
        </Badge>
      </div>
    </header>
  );
};

export default GameHeader;
