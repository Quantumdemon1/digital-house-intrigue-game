import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Crown, Target, Shield, Vote, Users, Trophy, Clock, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const GamePhaseHeader: React.FC = () => {
  const { gameState } = useGame();
  const { phase, week } = gameState;
  
  const hohWinner = gameState.hohWinner;
  const povWinner = gameState.povWinner;
  const nominees = gameState.nominees;
  const activeHouseguestCount = gameState.houseguests.filter(hg => hg.status === 'Active').length;
  
  // Helper functions
  const getPhaseIcon = () => {
    switch (phase) {
      case 'Setup': return <Users className="h-5 w-5 mr-2" />;
      case 'HoH': return <Crown className="h-5 w-5 mr-2 text-bb-gold" />;
      case 'Nomination': return <Target className="h-5 w-5 mr-2 text-bb-red" />;
      case 'PoV': return <Shield className="h-5 w-5 mr-2 text-bb-green" />;
      case 'PoVMeeting': return <Shield className="h-5 w-5 mr-2 text-bb-green" />;
      case 'Eviction': return <Vote className="h-5 w-5 mr-2 text-bb-red" />;
      case 'Finale': 
      case 'GameOver': return <Trophy className="h-5 w-5 mr-2 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 mr-2" />;
    }
  };
  
  const formatPhaseTitle = (phaseStr: string) => {
    // For HoH phase, return the full name
    if (phaseStr === 'HoH') {
      return 'Head of Household (HOH)';
    }
    
    // For other phases, convert camelCase to Title Case with spaces (keep existing behavior)
    return phaseStr
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 mb-6 border border-border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center">
          <span className="text-2xl font-bold themed-header text-bb-dark dark:text-white">
            Big Brother
          </span>
          <Badge variant="outline" className="ml-3 flex-shrink-0">
            Week {week}
          </Badge>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {activeHouseguestCount} houseguests
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {hohWinner && (
            <div className="flex items-center">
              <Badge className="bg-bb-gold text-bb-dark border-none font-medium flex items-center gap-1">
                <Crown className="h-3 w-3" />
                HoH: {gameState.houseguests.find(h => h.id === hohWinner.id)?.name}
              </Badge>
            </div>
          )}
          
          {povWinner && (
            <div className="flex items-center">
              <Badge variant="outline" className="bg-bb-green text-white border-none font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                PoV: {gameState.houseguests.find(h => h.id === povWinner.id)?.name}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center">
          {getPhaseIcon()}
          <h2 className="text-lg font-bold">{formatPhaseTitle(phase)}</h2>
        </div>
        
        {nominees.length > 0 && (
          <div className="flex items-center">
            <Badge variant="destructive" className="flex items-center gap-1 bg-bb-red">
              <Target className="h-3 w-3" />
              Nominees: 
              {nominees.map((nomineeId, idx) => {
                const nominee = gameState.houseguests.find(h => h.id === nomineeId.id);
                return (
                  <span key={nomineeId.id}>
                    {idx > 0 && ', '}
                    {nominee?.name}
                  </span>
                );
              })}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePhaseHeader;
