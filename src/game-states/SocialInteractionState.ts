
import { GameState, GamePhase } from '../models/game-state';
import { Houseguest } from '../models/houseguest';
import { BigBrotherGame } from '../models/game/BigBrotherGame';
import { GameStateBase, SocialActionChoice } from './GameStateBase';
import { IGameControllerFacade } from '../types/interfaces';
import { RelationshipSystem } from '../systems/relationship-system';

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
      parameters: { locationId: 'living-room' }
    });
    
    actions.push({
      actionId: 'move_location',
      text: 'Move to Kitchen',
      parameters: { locationId: 'kitchen' }
    });
    
    actions.push({
      actionId: 'move_location',
      text: 'Move to Bedroom',
      parameters: { locationId: 'bedroom' }
    });
    
    // Add talk actions for each present houseguest
    const activeGuests = this.game.getActiveHouseguests();
    const playerGuest = activeGuests.find(hg => hg.isPlayer);
    
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'talk_to',
          text: `Talk to ${houseguest.name}`,
          parameters: { targetId: houseguest.id }
        });
      }
    });
    
    // Add strategic discussion options
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'strategic_discussion',
          text: `Discuss strategy with ${houseguest.name}`,
          parameters: { targetId: houseguest.id, targetName: houseguest.name }
        });
      }
    });
    
    // Add relationship building options
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'relationship_building',
          text: `Build relationship with ${houseguest.name}`,
          parameters: { targetId: houseguest.id }
        });
      }
    });
    
    // Make promise options
    activeGuests.forEach(houseguest => {
      if (!houseguest.isPlayer) {
        actions.push({
          actionId: 'make_promise',
          text: `Make a promise to ${houseguest.name}`,
          parameters: { targetId: houseguest.id, targetName: houseguest.name }
        });
      }
    });
    
    // Add check relationships action
    actions.push({
      actionId: 'check_relationships',
      text: 'Check your relationships',
      parameters: { }
    });
    
    // Add check promises action
    actions.push({
      actionId: 'check_promises',
      text: 'Check active promises',
      parameters: { }
    });
    
    // Add advance phase action
    actions.push({
      actionId: 'advance_phase',
      text: 'End social phase',
      parameters: { }
    });
    
    return actions;
  }
  
  async handleAction(actionId: string, parameters: any): Promise<boolean> {
    switch (actionId) {
      case 'move_location':
        this.handleMoveLocation(parameters.locationId);
        break;
        
      case 'talk_to':
        this.handleTalkTo(parameters.targetId);
        break;
        
      case 'strategic_discussion':
        this.handleStrategicDiscussion(parameters);
        break;
        
      case 'relationship_building':
        this.handleRelationshipBuilding(parameters.targetId);
        break;
        
      case 'make_promise':
        this.handleMakePromise(parameters);
        break;
        
      case 'check_relationships':
        // Just view relationships, no state change
        break;
        
      case 'check_promises':
        // Just view promises, no state change
        break;
        
      case 'advance_phase':
        this.handleAdvancePhase();
        break;
        
      default:
        return false;
    }
    
    return true;
  }
  
  private handleMoveLocation(locationId: string): void {
    this.game.currentLocation = locationId;
    // No interaction cost for movement
  }
  
  private handleTalkTo(targetId: string): void {
    if (this.interactionsRemaining <= 0) return;
    
    const player = this.game.getActiveHouseguests().find(hg => hg.isPlayer);
    const target = this.game.getHouseguestById(targetId);
    
    if (player && target) {
      // Get current relationship or create if not exists
      let relationship = this.getOrCreateRelationship(player.id, target.id);
      
      // Base relationship improvement
      const improvement = Math.floor(Math.random() * 5) + 3; // 3-7 points
      
      // Update relationship
      this.controller.dispatch({
        type: 'UPDATE_RELATIONSHIPS',
        payload: {
          guestId1: player.id,
          guestId2: target.id,
          change: improvement,
          note: `${player.name} had a conversation with ${target.name}`
        }
      });
      
      // Log event
      this.controller.dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: this.game.week,
          phase: 'SocialInteraction',
          type: 'CONVERSATION',
          description: `${player.name} had a conversation with ${target.name}.`,
          involvedHouseguests: [player.id, target.id],
        }
      });
      
      this.interactionsRemaining--;
    }
  }
  
  private handleStrategicDiscussion(parameters: any): void {
    if (this.interactionsRemaining <= 0) return;
    
    const player = this.game.getActiveHouseguests().find(hg => hg.isPlayer);
    const target = this.game.getHouseguestById(parameters.targetId);
    
    if (player && target) {
      const discussionType = parameters.discussionType || 'general_strategy';
      let relationshipChange = 0;
      let eventType = 'STRATEGIC_DISCUSSION';
      let description = '';
      
      // Different outcomes based on discussion type
      switch (discussionType) {
        case 'suggest_target':
          relationshipChange = Math.floor(Math.random() * 8) - 2; // -2 to +5
          description = `${player.name} and ${target.name} discussed potential targets in the game.`;
          break;
          
        case 'general_strategy':
          relationshipChange = Math.floor(Math.random() * 7) + 1; // +1 to +7
          description = `${player.name} and ${target.name} had a general strategy talk.`;
          break;
          
        case 'vote_intentions':
          relationshipChange = Math.floor(Math.random() * 10) - 3; // -3 to +6
          description = `${player.name} asked ${target.name} about their voting intentions.`;
          break;
          
        case 'final_two_deal':
          relationshipChange = Math.floor(Math.random() * 15) - 5; // -5 to +9
          eventType = 'FINAL_TWO_DEAL';
          description = `${player.name} proposed a final 2 deal with ${target.name}.`;
          break;
          
        case 'spread_rumor':
          const rumorTarget = parameters.rumorTargetName || "another houseguest";
          relationshipChange = Math.floor(Math.random() * 12) - 8; // -8 to +3
          eventType = 'SPREAD_RUMOR';
          description = `${player.name} spread a rumor about ${rumorTarget} to ${target.name}.`;
          break;
      }
      
      // Update relationship
      this.controller.dispatch({
        type: 'UPDATE_RELATIONSHIPS',
        payload: {
          guestId1: player.id,
          guestId2: target.id,
          change: relationshipChange,
          note: description
        }
      });
      
      // Log event
      this.controller.dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: this.game.week,
          phase: 'SocialInteraction',
          type: eventType,
          description: description,
          involvedHouseguests: [player.id, target.id],
        }
      });
      
      this.interactionsRemaining--;
    }
  }
  
  private handleRelationshipBuilding(targetId: string): void {
    if (this.interactionsRemaining <= 0) return;
    
    const player = this.game.getActiveHouseguests().find(hg => hg.isPlayer);
    const target = this.game.getHouseguestById(targetId);
    
    if (player && target) {
      // Enhanced relationship improvement
      const improvement = Math.floor(Math.random() * 8) + 5; // 5-12 points
      
      // Update relationship
      this.controller.dispatch({
        type: 'UPDATE_RELATIONSHIPS',
        payload: {
          guestId1: player.id,
          guestId2: target.id,
          change: improvement,
          note: `${player.name} spent quality time with ${target.name}`
        }
      });
      
      // Log event
      this.controller.dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: this.game.week,
          phase: 'SocialInteraction',
          type: 'RELATIONSHIP_BUILDING',
          description: `${player.name} spent quality time with ${target.name}, building a stronger bond.`,
          involvedHouseguests: [player.id, target.id],
        }
      });
      
      this.interactionsRemaining--;
    }
  }
  
  private handleMakePromise(parameters: any): void {
    if (this.interactionsRemaining <= 0) return;
    
    const player = this.game.getActiveHouseguests().find(hg => hg.isPlayer);
    const target = this.game.getHouseguestById(parameters.targetId);
    
    if (player && target) {
      const promiseType = parameters.promiseType || 'safety';
      const promiseDescription = parameters.promiseDescription || 'a gameplay promise';
      
      // Making a promise has a positive effect on relationship
      const improvement = Math.floor(Math.random() * 6) + 7; // 7-12 points
      
      // Update relationship
      this.controller.dispatch({
        type: 'UPDATE_RELATIONSHIPS',
        payload: {
          guestId1: player.id,
          guestId2: target.id,
          change: improvement,
          note: `${player.name} promised ${target.name}: ${promiseDescription}`
        }
      });
      
      // Log the promise event
      this.controller.dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: this.game.week,
          phase: 'SocialInteraction',
          type: 'MAKE_PROMISE',
          description: `${player.name} made a promise to ${target.name}: ${promiseDescription}`,
          involvedHouseguests: [player.id, target.id],
          metadata: {
            promiseType,
            promiseDescription
          }
        }
      });
      
      this.interactionsRemaining--;
    }
  }
  
  private handleAdvancePhase(): void {
    // Advance to POV Competition
    this.controller.dispatch({
      type: 'SET_PHASE', 
      payload: 'POVCompetition'
    });
  }
  
  // Helper method to get or create a relationship between two houseguests
  private getOrCreateRelationship(
    guest1Id: string, 
    guest2Id: string
  ): { 
    score: number; 
    alliance: string | null; 
    notes: string[];
    events: any[];
    lastInteractionWeek: number;
  } {
    const relationshipSystem = this.controller.relationshipSystem;
    return relationshipSystem.getOrCreateRelationship(guest1Id, guest2Id);
  }
}
