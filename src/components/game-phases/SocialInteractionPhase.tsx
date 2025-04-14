import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, MessageSquare, Handshake, BarChart, ArrowRight, Target, VenetianMask, Award, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/contexts/GameContext';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import StrategicDiscussionDialog from './social/StrategicDiscussionDialog';
import MakePromiseDialog from './social/MakePromiseDialog';
import { PromiseDialog } from '@/components/promise';

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
  const currentLocation = game.currentLocation;
  const activeGuests = game.getActiveHouseguests();
  
  const availableActions = currentState.getAvailableActions();

  const presentGuests = useMemo(() => activeGuests.filter(hg => {
    return Math.random() > 0.3; // ~70% chance present
  }), [activeGuests]);

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
    
    if (actionId === 'check_promises') {
      setDialogAction({
        type: 'check_promises',
        params,
        isOpen: true
      });
      return;
    }
    
    logger.info(`Player triggering social action: ${actionId}`);
    dispatch({ 
      type: 'PLAYER_ACTION', 
      payload: { actionId, params } 
    });
  };

  const groupedActions = useMemo(() => {
    const groups: {[key: string]: SocialActionChoice[]} = {
      movement: [],
      conversations: [],
      strategic: [],
      relationship: [],
      information: [],
      alliance: [],
      status: [],
      advance: []
    };
    
    availableActions.forEach(action => {
      if (action.actionId === 'move_location') {
        groups.movement.push(action);
      } else if (action.actionId === 'talk_to') {
        groups.conversations.push(action);
      } else if (['strategic_discussion', 'eavesdrop'].includes(action.actionId)) {
        groups.strategic.push(action);
      } else if (['relationship_building', 'make_promise'].includes(action.actionId)) {
        groups.relationship.push(action);
      } else if (['share_info'].includes(action.actionId)) {
        groups.information.push(action);
      } else if (['propose_alliance', 'call_alliance_meeting', 'check_alliances'].includes(action.actionId)) {
        groups.alliance.push(action);
      } else if (['check_relationships', 'check_promises'].includes(action.actionId)) {
        groups.status.push(action);
      } else if (action.actionId === 'advance_phase') {
        groups.advance.push(action);
      }
    });
    
    return groups;
  }, [availableActions]);

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

        <div className="text-center font-medium text-blue-700 dark:text-blue-300">
          Interactions Available: {currentState.interactionsRemaining}
        </div>

        <div className="space-y-5">
          {groupedActions.movement.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                <MapPin size={14} className="mr-1" /> MOVE TO LOCATION
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {groupedActions.movement.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto text-left"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    <MapPin size={14} className="mr-1 flex-shrink-0"/>
                    <span className="flex-1 truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {groupedActions.conversations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                <MessageSquare size={14} className="mr-1" /> TALK TO HOUSEGUESTS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {groupedActions.conversations.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto text-left"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    <MessageSquare size={14} className="mr-1 flex-shrink-0"/>
                    <span className="flex-1 truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {groupedActions.strategic.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                <Target size={14} className="mr-1" /> STRATEGIC ACTIONS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {groupedActions.strategic.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto text-left"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    {action.actionId === 'strategic_discussion' && <Target size={14} className="mr-1 flex-shrink-0"/>}
                    {action.actionId === 'eavesdrop' && <VenetianMask size={14} className="mr-1 flex-shrink-0"/>}
                    <span className="flex-1 truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {groupedActions.relationship.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                <Award size={14} className="mr-1" /> RELATIONSHIP BUILDING
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {groupedActions.relationship.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto text-left"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    <Award size={14} className="mr-1 flex-shrink-0"/>
                    <span className="flex-1 truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {groupedActions.information.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                <MessageSquare size={14} className="mr-1" /> INFORMATION SHARING
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {groupedActions.information.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start h-auto text-left",
                      action.parameters?.type === 'deceptive' && "text-orange-600 hover:text-orange-700"
                    )}
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    <MessageSquare size={14} className="mr-1 flex-shrink-0"/>
                    <span className="flex-1 truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {groupedActions.alliance.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                <Handshake size={14} className="mr-1" /> ALLIANCE MANAGEMENT
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {groupedActions.alliance.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto text-left"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    <Handshake size={14} className="mr-1 flex-shrink-0"/>
                    <span className="flex-1 truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {groupedActions.status.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                <ClipboardCheck size={14} className="mr-1" /> STATUS CHECKS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {groupedActions.status.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto text-left"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    {action.actionId === 'check_relationships' && <BarChart size={14} className="mr-1 flex-shrink-0"/>}
                    {action.actionId === 'check_promises' && <ClipboardCheck size={14} className="mr-1 flex-shrink-0"/>}
                    <span className="flex-1 truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {groupedActions.advance.length > 0 && (
            <div className="pt-3">
              <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleActionClick('advance_phase')}
              >
                <ArrowRight size={16} className="mr-2"/>
                {groupedActions.advance[0].text}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
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
      
      {dialogAction.type === 'check_promises' && (
        <PromiseDialog
          open={dialogAction.isOpen}
          onOpenChange={handleCloseDialog}
        />
      )}
    </Card>
  );
};

export default SocialInteractionPhase;
