
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Users, MessageCircle, Clock } from 'lucide-react';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { Badge } from '@/components/ui/badge';
import LocationDisplay from './LocationDisplay';
import InteractionsCounter from './InteractionsCounter';
import ActionSections from './ActionSections';
import StrategicDiscussionDialog from '../social/StrategicDiscussionDialog';
import MakePromiseDialog from '../social/MakePromiseDialog';
import { EnhancedGameLogger } from '@/utils/game-log';

const SocialInteractionPhase: React.FC = () => {
  const { game, logger, dispatch } = useGame();
  const [enhancedLogger, setEnhancedLogger] = useState<EnhancedGameLogger | null>(null);
  const [dialogAction, setDialogAction] = useState<{
    type: string;
    params?: any;
    isOpen: boolean;
  }>({
    type: '',
    isOpen: false
  });

  useEffect(() => {
    if (game) {
      setEnhancedLogger(new EnhancedGameLogger(game, logger));
    }
  }, [game, logger]);

  if (!game || !game.currentState || !(game.currentState.constructor.name === 'SocialInteractionState')) {
    return (
      <GameCard className="animate-pulse">
        <GameCardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading Social Phase...
          </div>
        </GameCardContent>
      </GameCard>
    );
  }

  const currentState = game.currentState;
  const availableActions = currentState.getAvailableActions();

  const handleActionClick = (actionId: string, params?: any) => {
    if (actionId === 'strategic_discussion') {
      setDialogAction({
        type: 'strategic_discussion',
        params,
        isOpen: true
      });
      return;
    }
    
    if (actionId === 'make_promise') {
      setDialogAction({
        type: 'make_promise',
        params,
        isOpen: true
      });
      return;
    }
    
    if (enhancedLogger) {
      const playerHG = game.getHouseguestById(game.houseguests.find(h => h.isPlayer)?.id || '');
      enhancedLogger.logEvent({
        type: 'SOCIAL_ACTION',
        description: `Player initiated ${actionId.replace(/_/g, ' ')}`,
        involvedHouseguests: params?.targetId ? [(playerHG?.id || ''), params.targetId] : [(playerHG?.id || '')],
        data: { actionId, params }
      });
    }
    
    logger.info(`Player triggering social action: ${actionId}`);
    dispatch({ 
      type: 'PLAYER_ACTION', 
      payload: { actionId, params } 
    });
  };

  const handleCloseDialog = () => {
    setDialogAction(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <GameCard variant="primary" className="w-full max-w-4xl mx-auto animate-fade-in">
      <GameCardHeader variant="primary" icon={Users}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Social Phase</GameCardTitle>
            <GameCardDescription>
              Week {game.week} - Interact with other houseguests
            </GameCardDescription>
          </div>
          <Badge variant="outline" className="bg-white/10 text-white border-white/30">
            <Clock className="h-3 w-3 mr-1" />
            {currentState.interactionsRemaining} Actions
          </Badge>
        </div>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Location Display */}
        <LocationDisplay 
          currentLocation={game.currentLocation}
          activeGuests={game.getActiveHouseguests()}
        />

        {/* Interactions Counter */}
        <InteractionsCounter interactionsRemaining={currentState.interactionsRemaining} />

        {/* Action Sections */}
        <ActionSections 
          availableActions={availableActions}
          onActionClick={handleActionClick}
        />
      </GameCardContent>
      
      {/* Dialogs */}
      {dialogAction.type === 'strategic_discussion' && (
        <StrategicDiscussionDialog 
          open={dialogAction.isOpen}
          onOpenChange={handleCloseDialog}
          params={dialogAction.params}
        />
      )}
      
      {dialogAction.type === 'make_promise' && (
        <MakePromiseDialog
          open={dialogAction.isOpen}
          onOpenChange={handleCloseDialog}
          params={dialogAction.params}
        />
      )}
    </GameCard>
  );
};

export default SocialInteractionPhase;
