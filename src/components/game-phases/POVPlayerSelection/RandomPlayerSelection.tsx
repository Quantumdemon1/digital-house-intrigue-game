
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shuffle } from 'lucide-react';
import { usePlayerSelection } from './hooks/usePlayerSelection';

const RandomPlayerSelection: React.FC = () => {
  const { gameState, getHouseguestById } = useGame();
  const { 
    selectedPlayers,
    handlePlayerToggle,
    autoSelectRandom,
    isMandatoryPlayer
  } = usePlayerSelection();
  
  // Get HoH and nominees - they must participate
  const hohId = gameState.hohWinner;
  const nominees = gameState.nominees || [];
  
  // Get all active houseguests
  const activeHouseguests = gameState.houseguests.filter(hg => hg.status === 'Active');
  
  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium flex items-center">
          <Shuffle className="h-4 w-4 mr-1 text-purple-500" />
          Random Draw ({selectedPlayers.length - (hohId ? 1 : 0) - nominees.length}/{6 - (hohId ? 1 : 0) - nominees.length})
        </h4>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={autoSelectRandom}
          className="text-xs"
        >
          <Shuffle className="h-3 w-3 mr-1" /> Random
        </Button>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {activeHouseguests.map(hg => {
          // Skip mandatory players
          if (isMandatoryPlayer(hg.id)) return null;
          
          return (
            <div key={hg.id} className="flex items-center space-x-2 bg-white/5 p-2 rounded">
              <Checkbox 
                id={`player-${hg.id}`}
                checked={selectedPlayers.includes(hg.id)}
                onCheckedChange={(checked) => 
                  handlePlayerToggle(hg.id, checked as boolean)
                }
                disabled={!selectedPlayers.includes(hg.id) && selectedPlayers.length >= 6}
              />
              <label htmlFor={`player-${hg.id}`} className="text-sm">
                {hg.name}
                {hg.isPlayer && <span className="text-green-400 text-xs ml-1">(You)</span>}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RandomPlayerSelection;
