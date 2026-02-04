
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Users, Clock } from 'lucide-react';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent } from '@/components/ui/game-card';
import { Badge } from '@/components/ui/badge';
import LocationDisplay from './LocationDisplay';
import InteractionsCounter from './InteractionsCounter';
import ActionSections from './ActionSections';
import StrategicDiscussionDialog from '../social/StrategicDiscussionDialog';
import MakePromiseDialog from '../social/MakePromiseDialog';
import { ProposeDealDialog, NPCProposalDialog } from '@/components/deals';
import NPCActivityFeed from './NPCActivityFeed';
import { EnhancedGameLogger } from '@/utils/game-log';
import { executeAllNPCActions, type NPCActivityItem } from '@/systems/ai/npc-social-behavior';
import { InteractionTracker } from '@/systems/ai/interaction-tracker';
import { generateNPCProposalsForPlayer } from '@/systems/ai/npc-deal-proposals';
import { NPCProposal } from '@/models/deal';
import { config } from '@/config';

const SocialInteractionPhase: React.FC = () => {
  const { game, logger, dispatch } = useGame();
  const [enhancedLogger, setEnhancedLogger] = useState<EnhancedGameLogger | null>(null);
  const [npcActivities, setNpcActivities] = useState<NPCActivityItem[]>([]);
  const [isNPCPhaseActive, setIsNPCPhaseActive] = useState(false);
  const interactionTrackerRef = useRef<InteractionTracker | null>(null);
  const hasRunNPCActions = useRef(false);
  const hasGeneratedProposals = useRef(false);
  
  // NPC Proposals state
  const [currentProposal, setCurrentProposal] = useState<NPCProposal | null>(null);
  const [proposalQueue, setProposalQueue] = useState<NPCProposal[]>([]);
  
  const [dialogAction, setDialogAction] = useState<{
    type: string;
    params?: any;
    isOpen: boolean;
  }>({
    type: '',
    isOpen: false
  });

  // Initialize interaction tracker
  useEffect(() => {
    if (!interactionTrackerRef.current && logger) {
      interactionTrackerRef.current = new InteractionTracker(logger);
    }
    if (game && interactionTrackerRef.current) {
      interactionTrackerRef.current.setCurrentWeek(game.week);
    }
  }, [game, logger]);

  useEffect(() => {
    if (game) {
      setEnhancedLogger(new EnhancedGameLogger(game, logger));
    }
  }, [game, logger]);

  // Generate NPC proposals for player at start of social phase
  useEffect(() => {
    if (!game || hasGeneratedProposals.current) return;
    if (game?.currentState?.constructor.name !== 'SocialInteractionState') return;
    
    hasGeneratedProposals.current = true;
    
    // Generate proposals after a short delay
    const timer = setTimeout(() => {
      const proposals = generateNPCProposalsForPlayer(game);
      if (proposals.length > 0) {
        setProposalQueue(proposals);
        // Show first proposal after NPC actions
        setTimeout(() => {
          setCurrentProposal(proposals[0]);
        }, 3000);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [game?.currentState]);

  // Run NPC autonomous actions when social phase starts
  const runNPCActions = useCallback(async () => {
    if (!game || !config.NPC_AUTONOMOUS_ACTIONS_ENABLED || hasRunNPCActions.current) return;
    
    hasRunNPCActions.current = true;
    setIsNPCPhaseActive(true);
    
    try {
      await executeAllNPCActions(
        game,
        logger,
        interactionTrackerRef.current || undefined,
        (item) => {
          setNpcActivities(prev => [...prev, item]);
        }
      );
    } catch (error) {
      logger.error('Error running NPC actions', error);
    } finally {
      setIsNPCPhaseActive(false);
    }
  }, [game, logger]);

  // Trigger NPC actions when phase starts
  useEffect(() => {
    if (game?.currentState?.constructor.name === 'SocialInteractionState') {
      // Small delay before running NPC actions
      const timer = setTimeout(() => {
        runNPCActions();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [game?.currentState, runNPCActions]);

  // Handle NPC proposal response
  const handleProposalResponse = useCallback((proposalId: string, response: 'accepted' | 'declined') => {
    if (!game?.dealSystem) return;
    
    game.dealSystem.respondToProposal(proposalId, response);
    
    // Move to next proposal
    const nextQueue = proposalQueue.filter(p => p.id !== proposalId);
    setProposalQueue(nextQueue);
    setCurrentProposal(null);
    
    // Show next proposal if available
    if (nextQueue.length > 0) {
      setTimeout(() => {
        setCurrentProposal(nextQueue[0]);
      }, 1500);
    }
  }, [game?.dealSystem, proposalQueue]);

  const handleCloseProposal = useCallback(() => {
    setCurrentProposal(null);
    // Show next proposal if available
    const nextQueue = proposalQueue.slice(1);
    setProposalQueue(nextQueue);
    if (nextQueue.length > 0) {
      setTimeout(() => {
        setCurrentProposal(nextQueue[0]);
      }, 1500);
    }
  }, [proposalQueue]);

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
    
    if (actionId === 'propose_deal') {
      setDialogAction({
        type: 'propose_deal',
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

        {/* NPC Activity Feed */}
        <NPCActivityFeed 
          activities={npcActivities} 
          maxItems={15}
        />

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
      
      {dialogAction.type === 'propose_deal' && (
        <ProposeDealDialog
          open={dialogAction.isOpen}
          onOpenChange={handleCloseDialog}
          params={dialogAction.params}
        />
      )}
      
      {/* NPC Proposal Dialog */}
      <NPCProposalDialog
        proposal={currentProposal}
        onRespond={handleProposalResponse}
        onClose={handleCloseProposal}
      />
    </GameCard>
  );
};

export default SocialInteractionPhase;
