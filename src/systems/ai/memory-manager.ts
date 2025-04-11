
/**
 * @file src/systems/ai/memory-manager.ts
 * @description Manages AI houseguest memories and persona information
 */

import type { Houseguest } from '@/models/houseguest';
import type { Logger } from '@/utils/logger';
import type { RelationshipEvent } from '@/models/relationship-event';
import type { RelationshipSystem } from '../relationship-system';
import { config } from '@/config';

export class AIMemoryManager {
  private logger: Logger;
  private memories: Map<string, string[]> = new Map(); // Store memories by houseguest ID
  private relationshipSystem: RelationshipSystem | null = null;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Set the relationship system reference
   */
  setRelationshipSystem(relationshipSystem: RelationshipSystem): void {
    this.relationshipSystem = relationshipSystem;
  }

  /**
   * Initializes memories for all AI houseguests
   */
  initializeMemories(houseguests: Houseguest[]): void {
    this.memories.clear();
    const aiHouseguests = houseguests.filter(h => !h.isPlayer);
    
    aiHouseguests.forEach(hg => {
      const baseMemory = [
        `You are ${hg.name}, a houseguest on Big Brother.`,
        `Your personality trait is ${hg.traits[0] || 'Balanced'}.`,
        `You are ${this.getPersonalityDescription(hg.traits[0] || 'Balanced')}.`,
        `Your current game status is active.`,
        `Your stats: Physical ${hg.stats.physical}/10, Mental ${hg.stats.mental}/10, Endurance ${hg.stats.endurance}/10, Social ${hg.stats.social}/10, Luck ${hg.stats.luck}/10.`
      ];
      this.memories.set(hg.id, baseMemory);
      this.logger.debug(`Initialized memories for ${hg.name}`);
    });
    
    this.logger.info(`AI system initialized memories for ${aiHouseguests.length} AI houseguests.`);
  }

  /**
   * Get the description for a personality trait
   */
  private getPersonalityDescription(trait: string): string {
    const descriptions: Record<string, string> = {
      'Strategic': 'very strategic and focused on gameplay',
      'Social': 'very social and outgoing',
      'Competitive': 'extremely competitive',
      'Loyal': 'loyal to your allies',
      'Sneaky': 'sneaky and deceptive',
      'Confrontational': 'confrontational and direct',
      'Emotional': 'emotional and reactive',
      'Paranoid': 'paranoid and suspicious',
      'Floater': 'a floater who avoids taking sides',
      'Analytical': 'analytical and calculating',
      'Balanced': 'balanced in your approach to the game'
    };
    
    return descriptions[trait] || 'a normal houseguest';
  }

  /**
   * Get the memories for a specific houseguest, including significant relationship events
   */
  getMemoriesForHouseguest(houseguestId: string): string[] {
    const baseMemories = [...(this.memories.get(houseguestId) || [])];
    
    // If we have a relationship system, add significant relationship memories
    if (this.relationshipSystem) {
      const significantEvents = this.getSignificantRelationshipEvents(houseguestId);
      baseMemories.push(...significantEvents);
    }
    
    return baseMemories;
  }

  /**
   * Get significant relationship events formatted as memories
   */
  private getSignificantRelationshipEvents(houseguestId: string): string[] {
    if (!this.relationshipSystem) return [];
    
    const significantMemories: string[] = [];
    const relationships = this.relationshipSystem.getAllRelationships();
    
    // Get this houseguest's relationships with others
    const hgRelationships = relationships.get(houseguestId);
    if (!hgRelationships) return [];
    
    // Format each relationship's significant events as memories
    hgRelationships.forEach((relationship, otherId) => {
      if (!relationship.events || relationship.events.length === 0) return;
      
      // Get the houseguest name (would need to be passed in or retrieved)
      const otherName = this.getHouseguestNameById(otherId) || "Another houseguest";
      
      // Only include significant events (betrayals, saves, etc.)
      const significantEvents = relationship.events.filter(event => 
        ['betrayal', 'saved', 'alliance_formed', 'alliance_betrayed'].includes(event.type) ||
        Math.abs(event.impactScore) >= 15
      );
      
      // Add each event as a memory
      significantEvents.forEach(event => {
        const eventMemory = this.formatEventAsMemory(event, otherName);
        if (eventMemory) {
          significantMemories.push(eventMemory);
        }
      });
      
      // Add overall relationship summary
      const relationshipLevel = this.relationshipSystem!.getRelationshipLevel(houseguestId, otherId);
      significantMemories.push(`You consider ${otherName} to be ${relationshipLevel.toLowerCase()} (${relationship.score.toFixed(0)}/100).`);
    });
    
    return significantMemories;
  }

  /**
   * Format a relationship event as a memory string
   */
  private formatEventAsMemory(event: RelationshipEvent, otherName: string): string | null {
    switch (event.type) {
      case 'betrayal':
        return `You remember that ${otherName} betrayed you: ${event.description}`;
      case 'saved':
        return `You're grateful that ${otherName} saved you: ${event.description}`;
      case 'nominated':
        return `${otherName} nominated you for eviction.`;
      case 'voted_against':
        return `${otherName} voted for you to be evicted.`;
      case 'voted_for':
        return `${otherName} voted to keep you in the house.`;
      case 'alliance_formed':
        return `You formed an alliance with ${otherName}.`;
      case 'alliance_betrayed':
        return `${otherName} betrayed your alliance: ${event.description}`;
      case 'lied':
        return `${otherName} lied to you: ${event.description}`;
      default:
        // For other events, only include if the impact is significant
        if (Math.abs(event.impactScore) >= 15) {
          return `${event.description} (Involving ${otherName})`;
        }
        return null;
    }
  }

  /**
   * Helper method to get houseguest name by ID
   * In a real implementation, this would use a proper lookup
   */
  private getHouseguestNameById(id: string): string | null {
    // This is a stub - in a real implementation, we would
    // have access to the full list of houseguests
    return id.split('-')[0] || null;
  }

  /**
   * Add a memory for a specific houseguest
   */
  addMemory(houseguestId: string, memoryText: string): void {
    if (!this.memories.has(houseguestId)) {
      this.memories.set(houseguestId, []);
    }
    
    const memories = this.memories.get(houseguestId)!;
    memories.push(memoryText);
    
    // Keep memory array at a reasonable size
    const maxMemories = 10;
    if (memories.length > maxMemories) {
      memories.shift(); // Remove oldest memory
    }
  }
}
