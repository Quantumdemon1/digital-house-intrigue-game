
import { v4 as uuidv4 } from 'uuid';
import type { Houseguest } from '../models/houseguest';
import { Alliance, AllianceStatus, calculateAllianceStability, createAlliance } from '../models/alliance';
import type { RelationshipSystem } from './relationship-system';
import { config } from '../config';
import type { Logger } from '../utils/logger';

/**
 * System for managing alliances between houseguests
 */
export class AllianceSystem {
  private alliances: Alliance[] = [];
  private relationshipSystem: RelationshipSystem;
  private logger: Logger;
  private currentWeek: number = 1;
  
  constructor(relationshipSystem: RelationshipSystem, logger: Logger) {
    this.relationshipSystem = relationshipSystem;
    this.logger = logger;
  }
  
  /**
   * Set the current game week
   */
  setCurrentWeek(week: number): void {
    this.currentWeek = week;
    this.updateAllianceStability();
  }
  
  /**
   * Create a new alliance
   */
  createAlliance(
    name: string, 
    members: Houseguest[], 
    founder: Houseguest,
    isPublic: boolean = false
  ): Alliance {
    const id = uuidv4();
    
    const alliance = createAlliance(
      id, 
      name, 
      members, 
      founder,
      this.currentWeek,
      isPublic
    );
    
    this.alliances.push(alliance);
    
    // Update relationships for all members
    this.updateRelationshipsForNewAlliance(alliance);
    
    this.logger.info(`Alliance created: "${name}" (${members.map(m => m.name).join(', ')})`);
    
    return alliance;
  }
  
  /**
   * Update relationships when a new alliance is formed
   */
  private updateRelationshipsForNewAlliance(alliance: Alliance): void {
    for (const member1 of alliance.members) {
      for (const member2 of alliance.members) {
        if (member1.id !== member2.id) {
          // Boost relationship between alliance members
          this.relationshipSystem.addRelationshipEvent(
            member1.id,
            member2.id,
            'alliance_formed',
            `You formed an alliance "${alliance.name}" with ${member2.name}.`,
            15, // Significant boost
            false // Alliance formation is significant and remembered
          );
        }
      }
    }
  }
  
  /**
   * Add a member to an existing alliance
   */
  addMemberToAlliance(alliance: Alliance, newMember: Houseguest): boolean {
    // Check if member is already in the alliance
    if (alliance.members.some(m => m.id === newMember.id)) {
      return false;
    }
    
    // Add the new member
    alliance.members.push(newMember);
    
    // Update relationships with all members
    for (const member of alliance.members) {
      if (member.id !== newMember.id) {
        this.relationshipSystem.addRelationshipEvent(
          newMember.id,
          member.id,
          'alliance_formed',
          `You joined alliance "${alliance.name}" with ${member.name}.`,
          10,
          false
        );
        
        this.relationshipSystem.addRelationshipEvent(
          member.id,
          newMember.id,
          'alliance_formed',
          `${newMember.name} joined your alliance "${alliance.name}".`,
          5,
          false
        );
      }
    }
    
    // Recalculate stability
    this.updateAllianceStability(alliance);
    
    this.logger.info(`${newMember.name} added to alliance "${alliance.name}"`);
    return true;
  }
  
  /**
   * Remove a member from an alliance
   */
  removeMemberFromAlliance(alliance: Alliance, memberId: string, reason: string): boolean {
    const index = alliance.members.findIndex(m => m.id === memberId);
    if (index === -1) return false;
    
    const removedMember = alliance.members[index];
    alliance.members.splice(index, 1);
    
    // Update relationships negatively if the alliance is still active
    if (alliance.status === 'Active' && removedMember) {
      for (const member of alliance.members) {
        this.relationshipSystem.addRelationshipEvent(
          removedMember.id,
          member.id,
          'alliance_betrayed',
          `You were removed from alliance "${alliance.name}". Reason: ${reason}`,
          -20,
          false
        );
        
        this.relationshipSystem.addRelationshipEvent(
          member.id,
          removedMember.id,
          'alliance_betrayed',
          `${removedMember.name} was removed from your alliance "${alliance.name}". Reason: ${reason}`,
          -10,
          false
        );
      }
    }
    
    // Disband alliance if too few members
    if (alliance.members.length < 2) {
      alliance.status = 'Broken';
      this.logger.info(`Alliance "${alliance.name}" disbanded after ${removedMember?.name || 'member'} left.`);
    } else {
      this.updateAllianceStability(alliance);
      this.logger.info(`${removedMember?.name || 'Member'} removed from alliance "${alliance.name}"`);
    }
    
    return true;
  }
  
  /**
   * Break an alliance completely
   */
  breakAlliance(alliance: Alliance, reason: string): void {
    // Mark as broken
    alliance.status = 'Broken';
    
    // Update relationships for all former members
    for (let i = 0; i < alliance.members.length; i++) {
      for (let j = i + 1; j < alliance.members.length; j++) {
        const member1 = alliance.members[i];
        const member2 = alliance.members[j];
        
        this.relationshipSystem.addRelationshipEvent(
          member1.id,
          member2.id,
          'alliance_betrayed',
          `Your alliance "${alliance.name}" was broken. Reason: ${reason}`,
          -15,
          false
        );
        
        this.relationshipSystem.addRelationshipEvent(
          member2.id,
          member1.id,
          'alliance_betrayed',
          `Your alliance "${alliance.name}" was broken. Reason: ${reason}`,
          -15,
          false
        );
      }
    }
    
    this.logger.info(`Alliance "${alliance.name}" has been broken. Reason: ${reason}`);
  }
  
  /**
   * Expose a secret alliance
   */
  exposeAlliance(alliance: Alliance, exposerId: string | null): void {
    if (alliance.isPublic) return;
    
    alliance.isPublic = true;
    alliance.status = 'Exposed';
    
    // Relationship impacts depend on who exposed it
    if (exposerId) {
      const exposer = alliance.members.find(m => m.id === exposerId);
      
      if (exposer) {
        // If exposed by a member, it's a betrayal
        for (const member of alliance.members) {
          if (member.id !== exposerId) {
            this.relationshipSystem.addRelationshipEvent(
              member.id,
              exposerId,
              'alliance_betrayed',
              `${exposer.name} exposed your secret alliance "${alliance.name}"`,
              -25, // Major betrayal
              false
            );
          }
        }
        
        this.logger.info(`Alliance "${alliance.name}" was exposed by member ${exposer.name}`);
      }
    } else {
      // If exposed through other means, minor negative impact on stability
      alliance.stability -= 15;
      this.logger.info(`Secret alliance "${alliance.name}" was exposed!`);
    }
  }
  
  /**
   * Check for possible alliance exposure based on randomness or game events
   */
  checkForAllianceExposure(): void {
    const secretAlliances = this.alliances.filter(a => !a.isPublic && a.status === 'Active');
    
    for (const alliance of secretAlliances) {
      // Chance increases with alliance size
      const baseChance = 0.05; // 5% base chance per week
      const sizeModifier = (alliance.members.length - 2) * 0.03; // +3% per member above 2
      const stabilityModifier = (100 - alliance.stability) / 100; // Lower stability = higher chance
      
      const exposureChance = baseChance + sizeModifier + (baseChance * stabilityModifier);
      
      if (Math.random() < exposureChance) {
        this.exposeAlliance(alliance, null);
      }
    }
  }
  
  /**
   * Hold an alliance meeting, boosting relations and stability
   */
  holdAllianceMeeting(alliance: Alliance): void {
    if (alliance.status !== 'Active') return;
    
    // Update last meeting week
    alliance.lastMeetingWeek = this.currentWeek;
    
    // Boost relationships
    for (let i = 0; i < alliance.members.length; i++) {
      for (let j = i + 1; j < alliance.members.length; j++) {
        const member1 = alliance.members[i];
        const member2 = alliance.members[j];
        
        this.relationshipSystem.addRelationshipEvent(
          member1.id,
          member2.id,
          'alliance_meeting',
          `You met with your alliance "${alliance.name}"`,
          3, // Small boost
          true // These decay over time
        );
        
        this.relationshipSystem.addRelationshipEvent(
          member2.id,
          member1.id,
          'alliance_meeting',
          `You met with your alliance "${alliance.name}"`,
          3,
          true
        );
      }
    }
    
    // Boost stability
    alliance.stability = Math.min(100, alliance.stability + 5);
    
    this.logger.info(`Alliance "${alliance.name}" held a meeting. Stability now: ${alliance.stability.toFixed(1)}`);
  }
  
  /**
   * Check if a houseguest is in the same alliance as another houseguest
   */
  areInSameAlliance(houseguest1Id: string, houseguest2Id: string): boolean {
    return this.alliances.some(alliance => 
      alliance.status === 'Active' && 
      alliance.members.some(m => m.id === houseguest1Id) && 
      alliance.members.some(m => m.id === houseguest2Id)
    );
  }
  
  /**
   * Get all alliances that a houseguest is a member of
   */
  getAlliancesForHouseguest(houseguestId: string): Alliance[] {
    return this.alliances.filter(alliance => 
      alliance.status === 'Active' && 
      alliance.members.some(m => m.id === houseguestId)
    );
  }
  
  /**
   * Get all active alliances
   */
  getAllActiveAlliances(): Alliance[] {
    return this.alliances.filter(alliance => alliance.status === 'Active');
  }
  
  /**
   * Get all alliances (active, broken, exposed)
   */
  getAllAlliances(): Alliance[] {
    return [...this.alliances];
  }
  
  /**
   * Update the stability of an alliance based on member relationships
   */
  updateAllianceStability(alliance?: Alliance): void {
    const alliancesToUpdate = alliance ? [alliance] : this.getAllActiveAlliances();
    
    for (const ally of alliancesToUpdate) {
      // Decay stability if no recent meetings
      if (ally.lastMeetingWeek !== undefined && this.currentWeek - ally.lastMeetingWeek > 1) {
        const weeksSinceLastMeeting = this.currentWeek - ally.lastMeetingWeek;
        ally.stability -= Math.min(10, weeksSinceLastMeeting * 2); // 2 points per week, max 10
      }
      
      // Recalculate based on relationships
      const newStability = calculateAllianceStability(
        ally,
        (id1, id2) => this.relationshipSystem.getEffectiveRelationship(id1, id2)
      );
      
      // Blend old stability (70%) with new calculation (30%) for smoother changes
      ally.stability = Math.max(0, Math.min(100, ally.stability * 0.7 + newStability * 0.3));
      
      // Check if alliance should break due to low stability
      if (ally.stability < 15 && ally.status === 'Active') {
        this.breakAlliance(ally, "Alliance stability became too low due to poor relationships");
      }
    }
  }
  
  /**
   * Handle when a houseguest is evicted
   */
  handleHouseguestEvicted(evictedId: string): void {
    // Remove evicted player from all alliances
    for (const alliance of this.getAllActiveAlliances()) {
      const isMember = alliance.members.some(m => m.id === evictedId);
      
      if (isMember) {
        this.removeMemberFromAlliance(alliance, evictedId, "Evicted from the house");
      }
    }
  }
  
  /**
   * Get all members of a houseguest's alliances except the houseguest
   * (useful for finding all allies)
   */
  getAllAlliesForHouseguest(houseguestId: string): string[] {
    const alliances = this.getAlliancesForHouseguest(houseguestId);
    if (alliances.length === 0) return [];
    
    const alliesSet = new Set<string>();
    
    for (const alliance of alliances) {
      alliance.members.forEach(member => {
        if (member.id !== houseguestId) {
          alliesSet.add(member.id);
        }
      });
    }
    
    return Array.from(alliesSet);
  }
  
  /**
   * Serialize alliances for game save
   */
  serialize(): any[] {
    return this.alliances.map(alliance => ({
      ...alliance,
      // Convert houseguests to IDs for serialization
      members: alliance.members.map(m => m.id),
      founder: alliance.founder.id
    }));
  }
  
  /**
   * Deserialize alliances from game save
   */
  deserialize(data: any[], getHouseguestById: (id: string) => Houseguest | undefined): void {
    if (!Array.isArray(data)) return;
    
    this.alliances = data.map(allyData => {
      // Reconstruct member objects from IDs
      const memberObjects = (allyData.members || [])
        .map((id: string) => getHouseguestById(id))
        .filter(Boolean) as Houseguest[];
        
      // Reconstruct founder object from ID
      const founderObject = getHouseguestById(allyData.founder);
      
      if (!founderObject || memberObjects.length === 0) {
        // Skip invalid alliances
        return null;
      }
      
      return {
        id: allyData.id,
        name: allyData.name,
        members: memberObjects,
        founder: founderObject,
        createdOnWeek: allyData.createdOnWeek,
        status: allyData.status || 'Active',
        stability: allyData.stability || 80,
        isPublic: allyData.isPublic || false,
        lastMeetingWeek: allyData.lastMeetingWeek
      } as Alliance;
    }).filter(Boolean) as Alliance[];
  }
}
