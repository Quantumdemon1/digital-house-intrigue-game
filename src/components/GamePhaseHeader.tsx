
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Camera, Users, Calendar, ArrowRight } from 'lucide-react';
import { GamePhase } from '@/models/game-state';

const phaseLabels: Record<GamePhase, string> = {
  'Setup': 'Game Setup',
  'HoH': 'Head of Household Competition',
  'Nomination': 'Nomination Ceremony',
  'PoV': 'Power of Veto Competition',
  'PoVMeeting': 'Veto Meeting',
  'Eviction': 'Eviction Night',
  'Finale': 'Season Finale',
  'GameOver': 'Game Over'
};

const GamePhaseHeader: React.FC = () => {
  const { gameState, getActiveHouseguests } = useGame();
  const { week, phase } = gameState;
  const activeHouseguests = getActiveHouseguests();
  
  return (
    <div className="bg-bb-blue text-white rounded-lg p-4 mb-6 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Camera className="w-6 h-6 mr-2" />
          <h2 className="text-lg font-bold">
            Big Brother: The Digital House
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Week {week}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1" />
            <span>{activeHouseguests.length} Houseguests</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/20 flex items-center">
        <div className="flex-1">
          <h3 className="text-xl font-bold">{phaseLabels[phase]}</h3>
        </div>
        
        <div className="hidden md:flex items-center text-xs">
          <div className={`px-2 py-1 rounded ${phase === 'HoH' ? 'bg-white text-bb-blue' : 'bg-white/20'}`}>
            HoH Comp
          </div>
          <ArrowRight className="w-3 h-3 mx-1" />
          <div className={`px-2 py-1 rounded ${phase === 'Nomination' ? 'bg-white text-bb-blue' : 'bg-white/20'}`}>
            Nominations
          </div>
          <ArrowRight className="w-3 h-3 mx-1" />
          <div className={`px-2 py-1 rounded ${phase === 'PoV' ? 'bg-white text-bb-blue' : 'bg-white/20'}`}>
            Veto Comp
          </div>
          <ArrowRight className="w-3 h-3 mx-1" />
          <div className={`px-2 py-1 rounded ${phase === 'PoVMeeting' ? 'bg-white text-bb-blue' : 'bg-white/20'}`}>
            Veto Meeting
          </div>
          <ArrowRight className="w-3 h-3 mx-1" />
          <div className={`px-2 py-1 rounded ${phase === 'Eviction' ? 'bg-white text-bb-blue' : 'bg-white/20'}`}>
            Eviction
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePhaseHeader;
