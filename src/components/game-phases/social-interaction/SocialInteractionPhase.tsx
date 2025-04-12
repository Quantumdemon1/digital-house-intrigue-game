
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import LocationDisplay from './LocationDisplay';
import InteractionsCounter from './InteractionsCounter';
import ActionSections from './ActionSections';
import StrategicDiscussionDialog from '../social/StrategicDiscussionDialog';
import MakePromiseDialog from '../social/MakePromiseDialog';

const SocialInteractionPhase: React.FC = () => {
  const { game, logger, dispatch } = useGame();
  const [dialogAction, setDialogAction] = useState<{
    type: string;
    params?: any;
    isOpen: boolean;
  }>({
    type: '',
    isOpen: false
  });

  if (!game || !game.currentState || !(game.currentState.constructor.name === 'SocialInteractionState')) {
    return <Card><CardContent className="pt-6">Loading Social Phase...</CardContent></Card>;
  }

  const currentState = game.currentState;
  
  // Get available actions from the state
  const availableActions = currentState.getAvailableActions();

  const handleActionClick = (actionId: string, params?: any) => {
    // Special handling for certain actions that need dialogs
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
    
    // Standard action dispatch
    logger.info(`Player triggering social action: ${actionId}`);
    dispatch({ 
      type: 'PLAYER_ACTION', 
      payload: { actionId, params } 
    });
  };

  // Handle dialog closures
  const handleCloseDialog = () => {
    setDialogAction(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <Card className="shadow-lg border-blue-300 dark:border-blue-700">
      <CardHeader className="bg-blue-100 dark:bg-blue-900/30">
        <CardTitle className="flex items-center">
          <Users className="mr-2 text-blue-600" /> Social Phase
        </CardTitle>
        <CardDescription>
          Week {game.week} - Interact with other houseguests.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Location and Present Guests */}
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
      </CardContent>
      
      {/* Dialog components */}
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
    </Card>
  );
};

export default SocialInteractionPhase;
