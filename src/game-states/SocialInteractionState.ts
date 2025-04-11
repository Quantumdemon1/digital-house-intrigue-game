
import { GameStateBase, SocialActionChoice, NominationState } from '../game-states';
import type { IGameControllerFacade } from '../types/interfaces';
import { Houseguest } from '../models/houseguest';

// Define possible locations
export const LOCATIONS = ['living-room', 'kitchen', 'bedroom', 'backyard', 'hoh-room', 'diary-room'];

export class SocialInteractionState extends GameStateBase {
  private interactionsRemaining: number = 3; // Allow 3 interactions per state entry
  private targetPhase: typeof GameStateBase; // Which state to go to next

  constructor(controller: IGameControllerFacade, targetPhase: typeof GameStateBase = NominationState) {
    super(controller);
    this.targetPhase = targetPhase; // The state to transition to when done
  }

  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'SocialInteraction';
    this.interactionsRemaining = 3; // Reset interactions on entry
    this.getLogger().info(`Entering social phase. Target: ${this.targetPhase.name}. Interactions left: ${this.interactionsRemaining}`);
    
    // Notify the player
    this.getLogger().info(`You are in the ${this.game.currentLocation.replace('-', ' ')}.`);
    
    // Trigger UI to show choices
    this.controller.promptNextAction();
  }

  getAvailableActions(): SocialActionChoice[] {
    const actions: SocialActionChoice[] = [];
    const currentLocation = this.game.currentLocation;
    const activeGuests = this.game.getActiveHouseguests();
    
    // 1. Move Actions
    LOCATIONS.forEach(loc => {
      if (loc !== currentLocation) {
        actions.push({
          text: `Go to ${loc.replace('-', ' ')}`,
          actionId: 'move_location',
          parameters: { locationId: loc }
        });
      }
    });

    // Determine who is 'present'
    const presentGuests = activeGuests.filter(hg => {
      // Simple random presence for now
      return Math.random() > 0.3; // ~70% chance present
    });

    // 2. Talk Actions
    if (presentGuests.length > 0) {
      presentGuests.forEach(guest => {
        actions.push({
          text: `Talk to ${guest.name}`,
          actionId: 'talk_to',
          parameters: { targetId: guest.id, targetName: guest.name },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
      });
    } else {
      actions.push({ 
        text: "Nobody else here right now...", 
        actionId: 'look_around', 
        disabled: true 
      });
    }

    // 3. Check Relationships
    actions.push({ 
      text: "Check Relationships", 
      actionId: 'check_relationships' 
    });
    
    // 4. Propose Alliance (basic version for now)
    if (presentGuests.length > 0) {
      actions.push({
        text: "Propose Alliance",
        actionId: 'propose_alliance',
        disabled: this.interactionsRemaining <= 0,
        disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
      });
    }

    // 5. Advance Phase Action
    actions.push({
      text: `Proceed to ${this.targetPhase.name.replace('State', '')}`,
      actionId: 'advance_phase'
    });

    return actions;
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    this.getLogger().debug(`Social Interaction Action: ${actionId}`, params);
    
    // Decrement interactions for most actions except checking status or advancing
    if (!['check_relationships', 'advance_phase', 'move_location'].includes(actionId) && this.interactionsRemaining > 0) {
      this.interactionsRemaining--;
      this.getLogger().info(`Interactions remaining: ${this.interactionsRemaining}`);
    }

    switch (actionId) {
      case 'move_location':
        const newLocation = params?.locationId;
        if (LOCATIONS.includes(newLocation)) {
          this.game.currentLocation = newLocation;
          this.getLogger().info(`You moved to the ${newLocation.replace('-', ' ')}.`);
        } else {
          this.getLogger().warn("Invalid move location:", newLocation);
        }
        break;

      case 'talk_to':
        const targetId = params?.targetId;
        const targetName = params?.targetName;
        if (targetId && targetName) {
          this.getLogger().info(`You approach ${targetName} to talk...`);
          // Simple placeholder for now
          // In a complete implementation, this would trigger AI conversation
          
          // Simulate a response for now
          setTimeout(() => {
            this.getLogger().info(`${targetName} says: "Hey there! What's up?"`);
            
            // Update relationship slightly
            const playerGuest = this.game.houseguests[0]; // Assuming player is first houseguest
            this.controller.relationshipSystem.updateRelationship(playerGuest.id, targetId, 2);
            
            this.getLogger().info(`Your relationship with ${targetName} has improved slightly.`);
          }, 500);
        }
        break;
        
      case 'propose_alliance':
        // Basic implementation for now
        this.getLogger().info("You suggest forming an alliance...");
        
        // Simulate responses
        const activeGuests = this.game.getActiveHouseguests();
        const otherGuests = activeGuests.filter(g => g.id !== this.game.houseguests[0].id);
        const randomGuest = otherGuests[Math.floor(Math.random() * otherGuests.length)];
        
        if (randomGuest) {
          setTimeout(() => {
            // 70% chance of acceptance
            const accepted = Math.random() > 0.3;
            if (accepted) {
              this.getLogger().info(`${randomGuest.name} whispers: "I'm in. Let's work together."`);
              // Create alliance (in a full implementation)
              this.getLogger().info(`You've formed an alliance with ${randomGuest.name}!`);
            } else {
              this.getLogger().info(`${randomGuest.name} says: "I need to think about it..."`);
            }
          }, 1000);
        }
        break;

      case 'check_relationships':
        // Simple logging of relationships
        this.getLogger().info("--- Your Relationships ---");
        const playerGuest = this.game.houseguests[0]; // Assuming player is first houseguest
        this.game.houseguests.forEach(guest => {
          if (guest.id !== playerGuest.id) {
            const score = this.controller.relationshipSystem.getRelationship(playerGuest.id, guest.id);
            const description = this.describeRelationship(score);
            this.getLogger().info(`${guest.name}: ${description} (${score})`);
          }
        });
        break;

      case 'advance_phase':
        this.getLogger().info(`Advancing phase from Social Interaction to ${this.targetPhase.name}`);
        await this.transitionTo(this.targetPhase);
        return true; // Transition initiated

      default:
        this.getLogger().warn(`Unhandled social action: ${actionId}`);
        return false;
    }

    // After handling an action, re-prompt the player with updated choices
    this.controller.promptNextAction();
    return true; // Action was handled
  }

  // Helper to describe relationship scores in words
  private describeRelationship(score: number): string {
    if (score >= 80) return "Best Friends";
    if (score >= 60) return "Close Allies";
    if (score >= 40) return "Friends";
    if (score >= 20) return "Friendly";
    if (score >= 0) return "Neutral";
    if (score >= -20) return "Wary";
    if (score >= -40) return "Distrustful";
    if (score >= -60) return "Enemies";
    return "Bitter Rivals";
  }

  async exit(): Promise<void> {
    await super.exit();
    // Cleanup if needed
  }
}
