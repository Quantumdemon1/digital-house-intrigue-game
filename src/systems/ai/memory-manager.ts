/**
 * @file src/systems/ai/memory-manager.ts
 * @description Manages AI houseguest memories and persona information
 */

import type { Houseguest } from '@/models/houseguest';
import type { Logger } from '@/utils/logger';

export class AIMemoryManager {
  private logger: Logger;
  private memories: Map<string, string[]> = new Map(); // Store memories by houseguest ID
  
  constructor(logger: Logger) {
    this.logger = logger;
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
   * Get the memories for a specific houseguest
   */
  getMemoriesForHouseguest(houseguestId: string): string[] {
    return this.memories.get(houseguestId) || [];
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
