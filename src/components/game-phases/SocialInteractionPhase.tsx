
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, MessageSquare, Handshake, BarChart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/contexts/GameContext';
import { SocialInteractionState, SocialActionChoice } from '@/game-states';

const SocialInteractionPhase: React.FC = () => {
  const { game, logger, dispatch } = useGame();

  if (!game || !game.currentState || !(game.currentState instanceof SocialInteractionState)) {
    return <Card><CardContent className="pt-6">Loading Social Phase...</CardContent></Card>;
  }

  const currentState = game.currentState as SocialInteractionState;
  const currentLocation = game.currentLocation;
  const activeGuests = game.getActiveHouseguests();
  
  // Get available actions from the state
  const availableActions = currentState.getAvailableActions();

  // Determine who is 'present'
  const presentGuests = useMemo(() => activeGuests.filter(hg => {
    // Simple random presence for now - in a full implementation, this would be deterministic
    return Math.random() > 0.3; // ~70% chance present
  }), [activeGuests]);

  const handleActionClick = (actionId: string, params?: any) => {
    logger.info(`Player triggering social action: ${actionId}`);
    dispatch({ 
      type: 'PLAYER_ACTION', 
      payload: { actionId, params } 
    });
  };

  return (
    <Card className="shadow-lg border-blue-300 dark:border-blue-700">
      <CardHeader className="bg-blue-100 dark:bg-blue-900/30">
        <CardTitle className="flex items-center">
          <Users className="mr-2 text-blue-600" /> Social Phase
        </CardTitle>
        <CardDescription>
          Week {game.currentWeek} - Interact with other houseguests.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Location and Present Guests */}
        <div className="mb-4 p-3 bg-card border rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold flex items-center gap-1">
              <MapPin size={16} /> Current Location:
            </h4>
            <span className="font-mono text-sm">
              {currentLocation.replace('-', ' ')}
            </span>
          </div>
          
          <h5 className="text-xs uppercase text-muted-foreground font-semibold mb-1">Present:</h5>
          {presentGuests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {presentGuests.map(guest => (
                <Badge key={guest.id} variant="secondary">{guest.name}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">You are alone here.</p>
          )}
        </div>

        {/* Interactions Counter - would be implemented in full version */}
        <div className="text-center font-medium text-blue-700 dark:text-blue-300">
          Interactions Available
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableActions.map((action: SocialActionChoice) => (
            <Button
              key={action.actionId + JSON.stringify(action.parameters)}
              variant={action.actionId === 'advance_phase' ? 'default' : 'outline'}
              className={cn(
                "justify-start h-auto py-2 px-3 text-left", 
                action.actionId === 'advance_phase' && "bg-blue-600 hover:bg-blue-700 text-white md:col-span-2"
              )}
              disabled={action.disabled}
              title={action.disabledReason}
              onClick={() => handleActionClick(action.actionId, action.parameters)}
            >
              {/* Add Icons based on actionId */}
              {action.actionId === 'move_location' && <MapPin size={16} className="mr-2 flex-shrink-0"/>}
              {action.actionId === 'talk_to' && <MessageSquare size={16} className="mr-2 flex-shrink-0"/>}
              {action.actionId === 'propose_alliance' && <Handshake size={16} className="mr-2 flex-shrink-0"/>}
              {action.actionId === 'check_relationships' && <BarChart size={16} className="mr-2 flex-shrink-0"/>}
              {action.actionId === 'advance_phase' && <ArrowRight size={16} className="mr-2 flex-shrink-0"/>}
              <span className="flex-1 truncate">{action.text}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialInteractionPhase;
