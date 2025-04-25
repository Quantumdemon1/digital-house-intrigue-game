
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown, Users, AlertTriangle, Trophy } from 'lucide-react';
import { GamePhase } from '@/models/game-state';

const GameStatusIndicator: React.FC = () => {
  const { gameState, getActiveHouseguests } = useGame();
  const activeHouseguests = getActiveHouseguests();

  // Helper to get phase icon
  const getPhaseIcon = (phase: GamePhase) => {
    switch (phase) {
      case 'HoH':
        return <Crown className="h-4 w-4 mr-1" />;
      case 'Nomination':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'PoV':
        return <Trophy className="h-4 w-4 mr-1" />;
      case 'Eviction':
        return <Users className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  // Helper to get color based on phase
  const getPhaseColor = (phase: GamePhase) => {
    switch (phase) {
      case 'HoH':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Nomination':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PoV':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Eviction':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Finale':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get HoH name safely
  const getHoHName = () => {
    if (!gameState.hohWinner) return 'None';
    
    // Find the houseguest by ID in the active houseguests array
    const hohHouseguest = activeHouseguests.find(h => h.id === gameState.hohWinner);
    return hohHouseguest?.name || 'Unknown';
  };

  return (
    <div className="flex items-center justify-between w-full bg-background rounded-md p-2 border">
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Week {gameState.week}
        </Badge>
        
        <Badge 
          variant="outline" 
          className={`flex items-center ${getPhaseColor(gameState.phase)}`}
        >
          {getPhaseIcon(gameState.phase)}
          {gameState.phase}
        </Badge>
      </div>
      
      <div className="flex items-center">
        <Badge variant="outline" className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {activeHouseguests.length} Houseguests
        </Badge>
        
        {gameState.hohWinner && (
          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200 flex items-center">
            <Crown className="h-3 w-3 mr-1" />
            HoH: {getHoHName()}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default GameStatusIndicator;
