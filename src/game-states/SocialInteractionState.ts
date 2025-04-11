/**
 * @file SocialInteractionState.ts
 * @description Social interaction state
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';
import { NominationState } from './NominationState';
import type { IGameControllerFacade } from '../types/interfaces';
import { Houseguest } from '../models/houseguest';
import { RelationshipEventType } from '../models/relationship-event';
import { GamePhase } from '../models/game-state';

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
    const player = this.game.houseguests.find(h => h.isPlayer);
    
    if (!player) return [];
    
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
    
    // 4. Alliance Management Actions
    actions.push({
      text: "Propose Alliance",
      actionId: 'propose_alliance',
      disabled: this.interactionsRemaining <= 0,
      disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
    });

    // Check for existing alliances
    if (this.controller.allianceSystem) {
      const playerAlliances = this.controller.allianceSystem.getAlliancesForHouseguest(player.id);
      
      // Add action to check alliances
      actions.push({ 
        text: "Check My Alliances", 
        actionId: 'check_alliances' 
      });
      
      // If player has alliances, add alliance meeting action
      if (playerAlliances.length > 0) {
        playerAlliances.forEach(alliance => {
          actions.push({
            text: `Call ${alliance.name} Meeting`,
            actionId: 'call_alliance_meeting',
            parameters: { allianceId: alliance.id },
            disabled: this.interactionsRemaining <= 0,
            disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
          });
        });
      }
    }
    
    // 5. Share Information Actions
    if (presentGuests.length > 0) {
      actions.push({
        text: "Share Game Information",
        actionId: 'share_info',
        parameters: { type: 'honest' },
        disabled: this.interactionsRemaining <= 0,
        disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
      });
      
      actions.push({
        text: "Spread Misinformation",
        actionId: 'share_info',
        parameters: { type: 'deceptive' },
        disabled: this.interactionsRemaining <= 0,
        disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
      });
    }

    // 6. Advance Phase Action
    actions.push({
      text: `Proceed to ${this.targetPhase.name.replace('State', '')}`,
      actionId: 'advance_phase'
    });

    return actions;
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    this.getLogger().debug(`Social Interaction Action: ${actionId}`, params);
    
    // Decrement interactions for most actions except checking status or advancing
    if (!['check_relationships', 'check_alliances', 'advance_phase', 'move_location'].includes(actionId) && this.interactionsRemaining > 0) {
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
          
          // Get the player houseguest
          const player = this.game.houseguests.find(h => h.isPlayer);
          if (!player) break;
          
          // Get the target AI houseguest
          const targetGuest = this.game.getHouseguestById(targetId);
          if (!targetGuest) break;
          
          // Create a dialogue context that will be displayed to the player
          const dialogueContext = {
            speakerId: player.id,
            speakerName: player.name,
            message: "Hey, I wanted to talk to you for a bit.",  // Initial greeting
            situation: `You approached ${targetName} for a conversation.`,
            phase: this.game.phase as GamePhase,
            week: this.game.week
          };
          
          // Generate AI response using the enhanced dialogue system
          setTimeout(async () => {
            try {
              if (this.controller.aiSystem) {
                // Use the improved AI dialogue system
                const response = await this.controller.aiSystem.generateDialogueResponse(
                  targetId,
                  dialogueContext,
                  this.game
                );
                
                // Display the response to the player
                this.getLogger().info(`${targetName} says: "${response.response}"`);
                
                // Apply relationship changes based on the tone and thoughts
                this.applyDialogueRelationshipEffects(player.id, targetId, response);
                
                // Optionally show dialogue options for the player to respond
                this.showDialogueOptions(player.id, targetId, response);
              } else {
                // Fallback if AI system not available
                const responses = [
                  "Hey there! What's up?",
                  "Good to see you!",
                  "How's your game going?",
                  "Want to talk strategy?"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.getLogger().info(`${targetName} says: "${randomResponse}"`);
                
                // Apply basic relationship change
                this.controller.relationshipSystem.updateRelationship(
                  player.id,
                  targetId,
                  2,
                  `You had a conversation with ${targetName}.`
                );
              }
            } catch (error) {
              this.getLogger().error(`Error generating dialogue: ${error}`);
              this.getLogger().info(`${targetName} says: "Sorry, I need to go do something real quick."`);
            }
          }, 500);
        }
        break;
        
      case 'share_info':
        const infoType = params?.type;
        const presentGuests = this.game.getActiveHouseguests().filter(hg => !hg.isPlayer);
        const randomTarget = presentGuests[Math.floor(Math.random() * presentGuests.length)];
        const infoPlayerGuest = this.game.houseguests.find(h => h.isPlayer);
        
        if (!infoPlayerGuest || !randomTarget) break;
        
        if (infoType === 'honest') {
          // Sharing honest information builds trust
          this.getLogger().info(`You share honest game information with ${randomTarget.name}.`);
          
          setTimeout(() => {
            this.getLogger().info(`${randomTarget.name} appreciates your honesty!`);
            
            // Record as significant event - builds trust
            this.controller.relationshipSystem.addRelationshipEvent(
              infoPlayerGuest.id,
              randomTarget.id,
              'shared_info',
              `You shared valuable game information with ${randomTarget.name}.`,
              5,
              false // Trust building is remembered
            );
            
            // Reciprocal effect - they trust you more
            this.controller.relationshipSystem.addRelationshipEvent(
              randomTarget.id,
              infoPlayerGuest.id,
              'shared_info',
              `${infoPlayerGuest.name} shared valuable game information with you.`,
              7,
              false // Trust building is remembered
            );
          }, 500);
        } else if (infoType === 'deceptive') {
          // Lying can damage relationships if caught
          this.getLogger().info(`You spread misinformation to ${randomTarget.name}.`);
          
          // 40% chance of getting caught
          const caughtLying = Math.random() < 0.4;
          
          setTimeout(() => {
            if (caughtLying) {
              this.getLogger().info(`${randomTarget.name} caught you in a lie!`);
              
              // Record as significant betrayal event
              this.controller.relationshipSystem.recordBetrayal(
                infoPlayerGuest.id,
                randomTarget.id,
                `${infoPlayerGuest.name} lied to you about game information.`
              );
              
              // Other houseguests may hear about this
              const witnesses = this.game.getActiveHouseguests()
                .filter(hg => !hg.isPlayer && hg.id !== randomTarget.id)
                .slice(0, 2); // Up to 2 other houseguests find out
                
              witnesses.forEach(witness => {
                this.controller.relationshipSystem.updateRelationship(
                  witness.id,
                  infoPlayerGuest.id,
                  -5,
                  `${witness.name} heard that you lied to ${randomTarget.name}.`
                );
              });
            } else {
              this.getLogger().info(`${randomTarget.name} believes your misinformation!`);
              
              // Short-term boost but potential for future damage
              this.controller.relationshipSystem.updateRelationship(
                randomTarget.id,
                infoPlayerGuest.id,
                3,
                `${randomTarget.name} trusts your information.`
              );
            }
          }, 500);
        }
        break;
        
      case 'propose_alliance':
        // Open alliance proposal UI through controller
        this.controller.openAllianceProposalUI();
        break;

      case 'check_alliances':
        // Get player alliances
        if (!this.controller.allianceSystem) {
          this.getLogger().info("Alliance system not available.");
          break;
        }
        
        const player = this.game.houseguests.find(h => h.isPlayer);
        if (!player) break;
        
        const alliances = this.controller.allianceSystem.getAlliancesForHouseguest(player.id);
        
        if (alliances.length === 0) {
          this.getLogger().info("You are not currently in any alliances.");
        } else {
          this.getLogger().info("--- Your Alliances ---");
          
          alliances.forEach(alliance => {
            const memberNames = alliance.members.map(m => m.name).join(", ");
            const stability = alliance.stability.toFixed(0);
            const secrecy = alliance.isPublic ? "Public" : "Secret";
            const status = `${alliance.status} (${stability}% stable)`;
            
            this.getLogger().info(`${alliance.name}: ${memberNames}`);
            this.getLogger().info(`  Status: ${status} | ${secrecy}`);
            this.getLogger().info(`  Founded: Week ${alliance.createdOnWeek}`);
            
            // Check for at-risk alliances
            if (alliance.stability < 40) {
              this.getLogger().info(`  Warning: This alliance seems unstable!`);
            }
          });
        }
        
        break;
      
      case 'call_alliance_meeting':
        if (!this.controller.allianceSystem) {
          this.getLogger().info("Alliance system not available.");
          break;
        }
        
        const allianceId = params?.allianceId;
        if (!allianceId) break;
        
        const allAlliances = this.controller.allianceSystem.getAllAlliances();
        const alliance = allAlliances.find(a => a.id === allianceId);
        
        if (!alliance) {
          this.getLogger().warn("Alliance not found");
          break;
        }
        
        // Hold the meeting
        this.controller.allianceSystem.holdAllianceMeeting(alliance);
        
        // Get present alliance members (who are in the same location)
        const presentMembers = alliance.members.filter(m => !m.isPlayer);
        
        // Start alliance meeting dialogue
        this.getLogger().info(`You call a meeting with your ${alliance.name} alliance.`);
        
        setTimeout(() => {
          // Show which members are present
          const memberList = presentMembers.map(m => m.name).join(", ");
          this.getLogger().info(`Present for the meeting: ${memberList}`);
          
          // Discuss alliance strategy
          this.handleAllianceMeetingDiscussion(alliance, presentMembers);
        }, 800);
        
        break;
        
      case 'check_relationships':
        // Expanded relationship checking that includes significant events
        this.getLogger().info("--- Your Relationships ---");
        const checkPlayerGuest = this.game.houseguests.find(h => h.isPlayer);
        
        if (!checkPlayerGuest) break;

        // Check if alliance system is available
        const allianceSystem = this.controller.allianceSystem;
        const playerAllies = allianceSystem ? 
          allianceSystem.getAllAlliesForHouseguest(checkPlayerGuest.id) : [];
        
        this.game.houseguests.forEach(guest => {
          if (guest.id !== checkPlayerGuest.id && guest.status !== 'Evicted') {
            const baseScore = this.controller.relationshipSystem.getRelationship(checkPlayerGuest.id, guest.id);
            const effectiveScore = this.controller.relationshipSystem.getEffectiveRelationship(checkPlayerGuest.id, guest.id);
            const description = this.describeRelationship(effectiveScore);
            
            // Check alliance status
            const isAlly = playerAllies.includes(guest.id);
            const allyStatus = isAlly ? " (ALLY)" : "";
            
            this.getLogger().info(`${guest.name}${allyStatus}: ${description} (${effectiveScore.toFixed(1)})`);
            
            // Get significant events
            if (this.controller.relationshipSystem.getRelationshipEvents) {
              const events = this.controller.relationshipSystem.getRelationshipEvents(checkPlayerGuest.id, guest.id)
                .filter(e => ['betrayal', 'saved', 'alliance_formed', 'alliance_betrayed'].includes(e.type) ||
                      Math.abs(e.impactScore) >= 15);
                      
              // Display significant events
              if (events.length > 0) {
                this.getLogger().info(`  Significant events with ${guest.name}:`);
                events.forEach(event => {
                  this.getLogger().info(`  - ${event.description}`);
                });
              }
              
              // Show reciprocity factor
              const reciprocity = this.controller.relationshipSystem.calculateReciprocityModifier(guest.id, checkPlayerGuest.id);
              if (Math.abs(reciprocity) > 0.1) {
                const reciprocityDesc = reciprocity > 0 
                  ? `${guest.name} likes you more than you like them.`
                  : `You like ${guest.name} more than they like you.`;
                this.getLogger().info(`  * ${reciprocityDesc}`);
              }
            }
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
  
  /**
   * Handle alliance meeting discussion
   */
  private handleAllianceMeetingDiscussion(
    alliance: any, 
    presentMembers: Houseguest[]
  ): void {
    if (presentMembers.length === 0) {
      this.getLogger().info("None of your alliance members are available right now.");
      return;
    }
    
    // Get targets that are not in the alliance
    const nonMembers = this.game.getActiveHouseguests().filter(
      hg => !alliance.members.some((m: any) => m.id === hg.id)
    );
    
    if (nonMembers.length === 0) {
      this.getLogger().info("Your alliance includes everyone still in the house!");
      return;
    }

    // Choose a random alliance member to lead discussion
    const leadMember = presentMembers[Math.floor(Math.random() * presentMembers.length)];
    
    // Identify potential targets based on relationship scores
    const potentialTargets = nonMembers.sort((a, b) => {
      // Average relationship between alliance members and this person
      let aScore = 0;
      let bScore = 0;
      
      alliance.members.forEach((member: Houseguest) => {
        if (!member.isPlayer) {
          aScore += this.controller.relationshipSystem.getEffectiveRelationship(member.id, a.id);
          bScore += this.controller.relationshipSystem.getEffectiveRelationship(member.id, b.id);
        }
      });
      
      return aScore - bScore; // Sort from lowest (biggest threat) to highest
    });
    
    // Target the lowest-scored person (usually most threatening to alliance)
    const primaryTarget = potentialTargets[0];
    const secondaryTarget = potentialTargets[1] || potentialTargets[0];
    
    // Lead member suggests targets
    setTimeout(() => {
      this.getLogger().info(`${leadMember.name}: "I think we should target ${primaryTarget.name} next. They're a threat to our alliance."`);
      
      // Record strategy discussion
      alliance.members.forEach((member: Houseguest) => {
        if (!member.isPlayer) {
          this.controller.relationshipSystem.addRelationshipEvent(
            member.id,
            primaryTarget.id,
            'alliance_target_discussion' as RelationshipEventType,
            `Your alliance discussed targeting ${primaryTarget.name}`,
            -5,
            true
          );
        }
      });
      
      // Second member agrees and suggests backup
      if (presentMembers.length > 1) {
        const secondMember = presentMembers.find(m => m.id !== leadMember.id) || presentMembers[0];
        
        setTimeout(() => {
          this.getLogger().info(`${secondMember.name}: "Agreed. And if that doesn't work, we should look at ${secondaryTarget.name} as a backup."`);
          
          // Coordinate voting strategy
          setTimeout(() => {
            this.getLogger().info(`Your alliance agrees to coordinate votes against ${primaryTarget.name} if they end up nominated.`);
            
            // Record vote coordination
            alliance.members.forEach((member: Houseguest) => {
              if (!member.isPlayer) {
                this.controller.relationshipSystem.addRelationshipEvent(
                  member.id,
                  member.id,
                  'alliance_vote_coordination' as RelationshipEventType,
                  `Your alliance agreed to vote together`,
                  3,
                  true
                );
              }
            });
          }, 500);
        }, 700);
      }
    }, 800);
  }
  
  /**
   * Apply relationship effects based on AI dialogue response
   */
  private applyDialogueRelationshipEffects(
    playerId: string,
    aiId: string,
    response: { response: string; tone: string; thoughts: string; }
  ): void {
    const { tone, thoughts } = response;
    
    // Base relationship change based on tone
    let baseChange = 0;
    let eventType: RelationshipEventType = 'general_interaction';
    let note = "";
    
    // Determine relationship change based on tone
    switch (tone) {
      case 'friendly':
        baseChange = 4;
        note = `${this.game.getHouseguestById(aiId)?.name} was friendly during your conversation.`;
        break;
      case 'strategic':
        baseChange = 3;
        note = `${this.game.getHouseguestById(aiId)?.name} discussed strategy with you.`;
        eventType = 'strategy_discussion' as RelationshipEventType;
        break;
      case 'cautious':
        baseChange = 1;
        note = `${this.game.getHouseguestById(aiId)?.name} was cautious during your conversation.`;
        break;
      case 'deceptive':
        // Deception isn't immediately apparent, might have a negative effect later
        baseChange = 2; // Seems positive initially
        note = `${this.game.getHouseguestById(aiId)?.name} seemed agreeable, but was being deceptive.`;
        eventType = 'deception' as RelationshipEventType;
        break;
      case 'aggressive':
        baseChange = -3;
        note = `${this.game.getHouseguestById(aiId)?.name} was aggressive toward you.`;
        eventType = 'confrontation' as RelationshipEventType;
        break;
      case 'dismissive':
        baseChange = -2;
        note = `${this.game.getHouseguestById(aiId)?.name} dismissed your conversation.`;
        break;
      default: // neutral
        baseChange = 1;
        note = `You had a conversation with ${this.game.getHouseguestById(aiId)?.name}.`;
        break;
    }
    
    // Check internal thoughts for alignment or misalignment with spoken words
    const positiveThoughtIndicators = ['like', 'trust', 'friend', 'ally', 'appreciate', 'helpful'];
    const negativeThoughtIndicators = ['annoyed', 'angry', 'upset', 'suspicious', 'don\'t trust', 'irritating'];
    
    const hasPositiveThoughts = positiveThoughtIndicators.some(indicator => 
      thoughts.toLowerCase().includes(indicator.toLowerCase())
    );
    
    const hasNegativeThoughts = negativeThoughtIndicators.some(indicator => 
      thoughts.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Modify relationship change based on thoughts
    let thoughtModifier = 0;
    
    if ((tone === 'friendly' || tone === 'strategic') && hasPositiveThoughts) {
      // Genuine positive interaction
      thoughtModifier = 2;
      eventType = 'positive_connection' as RelationshipEventType;
    } else if ((tone === 'friendly' || tone === 'strategic') && hasNegativeThoughts) {
      // Superficially nice but actually negative - this is deception
      thoughtModifier = -1;
      eventType = 'deception' as RelationshipEventType;
      note += " (Their internal thoughts don't match their friendly words)";
    } else if ((tone === 'aggressive' || tone === 'dismissive') && hasNegativeThoughts) {
      // Genuine negativity
      thoughtModifier = -1;
      eventType = 'negative_interaction' as RelationshipEventType;
    }
    
    // Calculate final relationship change
    const finalChange = baseChange + thoughtModifier;
    
    // Apply the relationship change with the event type
    this.controller.relationshipSystem.addRelationshipEvent(
      playerId,
      aiId,
      eventType,
      note,
      finalChange,
      true // Decayable over time
    );
    
    // Apply reciprocal effect from AI to player (may be different)
    const reciprocalChange = finalChange * (0.8 + Math.random() * 0.4); // 80-120%
    
    // Add relationship event in the other direction
    this.controller.relationshipSystem.addRelationshipEvent(
      aiId,
      playerId,
      eventType,
      `You had a conversation with ${this.game.getHouseguestById(playerId)?.name}.`,
      reciprocalChange,
      true
    );
    
    this.getLogger().info(`Relationship with ${this.game.getHouseguestById(aiId)?.name} changed by ${finalChange.toFixed(1)} (${eventType})`);
  }
  
  /**
   * Show dialogue options for the player to respond to the AI
   */
  private showDialogueOptions(
    playerId: string,
    aiId: string,
    aiResponse: { response: string; tone: string; thoughts: string; }
  ): void {
    // TODO: For a future enhancement, implement a full dialogue system with player response options
    // For now, just print a message that the conversation concluded
    const aiName = this.game.getHouseguestById(aiId)?.name;
    setTimeout(() => {
      this.getLogger().info(`Your conversation with ${aiName} comes to a natural conclusion.`);
    }, 2000);
  }

  async exit(): Promise<void> {
    await super.exit();
    // Cleanup if needed
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
}
