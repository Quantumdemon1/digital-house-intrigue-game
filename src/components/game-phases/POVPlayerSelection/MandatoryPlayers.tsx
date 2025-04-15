
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck } from 'lucide-react';
import { usePlayerSelection } from './hooks/usePlayerSelection';

const MandatoryPlayers: React.FC = () => {
  const { gameState, getHouseguestById } = useGame();
  const { selectedPlayers } = usePlayerSelection();
  
  // Get HoH and nominees - they must participate
  const hohId = gameState.hohWinner;
  const nominees = gameState.nominees || [];
  
  return (
    <div className="bg-muted p-4 rounded-lg">
      <h4 className="font-medium mb-3 flex items-center">
        <UserCheck className="h-4 w-4 mr-1 text-blue-500" />
        Mandatory Players ({Math.min(3, hohId ? 1 : 0 + nominees.length)}/3)
      </h4>
      <div className="space-y-2">
        {/* HoH */}
        <div className="flex items-center space-x-2 bg-white/10 p-2 rounded">
          <Checkbox 
            id={`player-${hohId}`}
            checked={selectedPlayers.includes(hohId || '')}
            disabled
          />
          <label htmlFor={`player-${hohId}`} className="flex items-center">
            <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded mr-2">HoH</span>
            {getHouseguestById(hohId || '')?.name || 'Head of Household'}
          </label>
        </div>
        
        {/* Nominees */}
        {nominees.map(nomineeId => {
          const nominee = getHouseguestById(nomineeId);
          return (
            <div key={nomineeId} className="flex items-center space-x-2 bg-white/10 p-2 rounded">
              <Checkbox 
                id={`player-${nomineeId}`}
                checked={selectedPlayers.includes(nomineeId)}
                disabled
              />
              <label htmlFor={`player-${nomineeId}`} className="flex items-center">
                <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded mr-2">Nominee</span>
                {nominee?.name || 'Nominee'}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MandatoryPlayers;
