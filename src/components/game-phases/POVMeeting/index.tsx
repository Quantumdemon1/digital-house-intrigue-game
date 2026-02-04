
import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { Badge } from '@/components/ui/badge';
import POVMeetingContent from './POVMeetingContent';

const POVMeeting: React.FC = () => {
  const { gameState, dispatch } = useGame();
  
  // Redirect to final stages if not enough houseguests
  useEffect(() => {
    const activeCount = gameState.houseguests.filter(h => h.status === 'Active').length;
    
    // Only redirect when exactly 3 houseguests remain
    // Note: 4 houseguests (Final 4) should run a normal PoV Meeting week
    if (activeCount === 3 && !gameState.isFinalStage) {
      dispatch({ type: 'SET_PHASE', payload: 'FinalHoH' });
    }
  }, [gameState.houseguests, gameState.isFinalStage, dispatch]);
  
  return (
    <GameCard variant="success" className="w-full max-w-4xl mx-auto animate-fade-in">
      <GameCardHeader variant="success" icon={Shield}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Power of Veto Meeting</GameCardTitle>
            <GameCardDescription>
              Week {gameState.week}
            </GameCardDescription>
          </div>
          <Badge variant="outline" className="bg-white/10 text-white border-white/30">
            <Shield className="h-3 w-3 mr-1" /> Veto Ceremony
          </Badge>
        </div>
      </GameCardHeader>
      <GameCardContent>
        <POVMeetingContent />
      </GameCardContent>
    </GameCard>
  );
};

export default POVMeeting;
