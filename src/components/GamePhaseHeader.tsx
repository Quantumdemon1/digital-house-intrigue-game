
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Camera, Users, Calendar, ArrowRight, Key, Target, ShieldCheck, Vote, Trophy, Home } from 'lucide-react';
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

const phaseIcons: Record<GamePhase, React.ReactNode> = {
  'Setup': <Home className="w-5 h-5 mr-2" />,
  'HoH': <Key className="w-5 h-5 mr-2 text-bb-gold" />,
  'Nomination': <Target className="w-5 h-5 mr-2 text-bb-red" />,
  'PoV': <ShieldCheck className="w-5 h-5 mr-2 text-bb-green" />,
  'PoVMeeting': <ShieldCheck className="w-5 h-5 mr-2 text-bb-green opacity-70" />,
  'Eviction': <Vote className="w-5 h-5 mr-2 text-bb-red" />,
  'Finale': <Trophy className="w-5 h-5 mr-2 text-yellow-400" />,
  'GameOver': <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
};

const GamePhaseHeader: React.FC = () => {
  const { gameState, getActiveHouseguests } = useGame();
  const { week, phase } = gameState;
  const activeHouseguests = getActiveHouseguests();
  const hoh = gameState.hohWinner ? gameState.houseguests.find(h => h.id === gameState.hohWinner?.id) : null;
  
  return (
    <div className="bg-gradient-to-r from-bb-blue to-bb-dark border-b-2 border-bb-blue/30 text-white rounded-lg p-4 mb-6 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative">
            <Camera className="w-7 h-7 mr-2 text-white animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <h2 className="text-xl font-bold tracking-wider">
            Big Brother: The Digital House
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm bg-black/20 px-3 py-1 rounded-full">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Week {week}</span>
          </div>
          
          <div className="flex items-center text-sm bg-black/20 px-3 py-1 rounded-full">
            <Users className="w-4 h-4 mr-1" />
            <span>{activeHouseguests.length} Houseguests</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
        <div className="flex items-center">
          {phaseIcons[phase]}
          <h3 className="text-xl font-bold">{phaseLabels[phase]}</h3>
        </div>
        
        {hoh && phase !== 'Setup' && (
          <div className="text-sm flex items-center bg-bb-gold/90 text-bb-dark px-2 py-1 rounded">
            <Key size={14} className="mr-1" /> 
            <span>HoH: {hoh.name}</span>
          </div>
        )}
      </div>
      
      <div className="hidden md:flex items-center text-xs mt-3 pt-2 border-t border-white/10">
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
  );
};

export default GamePhaseHeader;
