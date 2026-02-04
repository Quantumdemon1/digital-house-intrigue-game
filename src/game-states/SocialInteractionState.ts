
import { GamePhase } from '../models/game-state';
import { Houseguest } from '../models/houseguest';
import { GameStateBase, SocialActionChoice } from './GameStateBase';
import { IGameControllerFacade } from '../types/interfaces';

// Import action handlers
import {
  handleMoveLocation,
  handleTalkTo,
  handleStrategicDiscussion,
  handleRelationshipBuilding,
  handleMakePromise,
  handleAdvancePhase
} from './social/handlers';

export class SocialInteractionState extends GameStateBase {
  interactionsRemaining: number = 3;
  
  constructor(controller: IGameControllerFacade) {
    super(controller);
    this.initializeState();
  }
  
  private initializeState(): void {
    // Initialize social interaction state
    this.interactionsRemaining = 3;
  }
  
  getAvailableActions(): SocialActionChoice[] {
    const actions: SocialActionChoice[] = [];
    
    // Add location movement actions
    actions.push({
      actionId: 'move_location',
      text: 'Move to Living Room',
      parameters: { locationId: 'living-room' },
      category: 'movement'
    });
    
    actions.push({
      actionId: 'move_location',
      text: 'Move to Kitchen',
      parameters: { locationId: 'kitchen' },
      category: 'movement'
    });
    
    actions.push({
      actionId: 'move_location',
      text: 'Move to Bedroom',
      parameters: { locationId: 'bedroom' },
      category: 'movement'
    });
    
    // Add talk actions for each present houseguest
    const activeGuests = this.game.getActiveHouseguests();
    const playerGuest = activeGuests.find(hg => hg.isPlayer);
    
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'talk_to',
          text: `Talk to ${houseguest.name}`,
          parameters: { targetId: houseguest.id },
          category: 'conversation'
        });
      }
    });
    
    // Add strategic discussion options
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'strategic_discussion',
          text: `Discuss strategy with ${houseguest.name}`,
          parameters: { targetId: houseguest.id, targetName: houseguest.name },
          category: 'strategic'
        });
      }
    });
    
    // Add relationship building options
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'relationship_building',
          text: `Build relationship with ${houseguest.name}`,
          parameters: { targetId: houseguest.id },
          category: 'relationship'
        });
      }
    });
    
    // Propose deal options (replaces make_promise)
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'propose_deal',
          text: `Propose a deal to ${houseguest.name}`,
          parameters: { targetId: houseguest.id, targetName: houseguest.name },
          category: 'deal'
        });
      }
    });
    
    // Legacy: Make promise options (keeping for backward compatibility)
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'make_promise',
          text: `Make a promise to ${houseguest.name}`,
          parameters: { targetId: houseguest.id, targetName: houseguest.name },
          category: 'promise'
        });
      }
    });
    
    // Add check relationships action
    actions.push({
      actionId: 'check_relationships',
      text: 'Check your relationships',
      parameters: { },
      category: 'status'
    });
    
    // Add check promises action
    actions.push({
      actionId: 'check_promises',
      text: 'Check active promises',
      parameters: { },
      category: 'status'
    });
    
    // Add advance phase action
    actions.push({
      actionId: 'advance_phase',
      text: 'End social phase',
      parameters: { },
      category: 'phase'
    });
    
    return actions;
  }
  
  async handleAction(actionId: string, parameters: any): Promise<boolean> {
    // Decrement interactions for actions that consume them
    const consumesInteraction = ['talk_to', 'strategic_discussion', 'relationship_building', 'make_promise', 'propose_deal'].includes(actionId);
    
    if (consumesInteraction && this.interactionsRemaining <= 0) return false;
    
    switch (actionId) {
      case 'move_location':
        handleMoveLocation({ controller: this.controller, locationId: parameters.locationId });
        break;
        
      case 'talk_to':
        handleTalkTo({ controller: this.controller, targetId: parameters.targetId });
        if (consumesInteraction) this.interactionsRemaining--;
        break;
        
      case 'strategic_discussion':
        handleStrategicDiscussion({ 
          controller: this.controller, 
          targetId: parameters.targetId,
          targetName: parameters.targetName,
          discussionType: parameters.discussionType,
          rumorTargetName: parameters.rumorTargetName
        });
        if (consumesInteraction) this.interactionsRemaining--;
        break;
        
      case 'relationship_building':
        handleRelationshipBuilding({ controller: this.controller, targetId: parameters.targetId });
        if (consumesInteraction) this.interactionsRemaining--;
        break;
        
      case 'make_promise':
        handleMakePromise({ 
          controller: this.controller, 
          targetId: parameters.targetId,
          promiseType: parameters.promiseType,
          promiseDescription: parameters.promiseDescription 
        });
        if (consumesInteraction) this.interactionsRemaining--;
        break;
        
      case 'propose_deal':
        // Handle deal proposal (UI handles the actual creation)
        if (consumesInteraction) this.interactionsRemaining--;
        break;
        
      case 'check_relationships':
      case 'check_promises':
        // Just view relationships or promises, no state change
        break;
        
      case 'advance_phase':
        handleAdvancePhase({ controller: this.controller });
        break;
        
      default:
        return false;
    }
    
    return true;
  }
}
