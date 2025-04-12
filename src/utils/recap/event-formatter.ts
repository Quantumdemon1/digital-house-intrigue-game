
/**
 * @file src/utils/recap/event-formatter.ts
 * @description Formats and groups game events for recap generation
 */

import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { GameEvent } from '@/models/game-state';
import type { Logger } from '@/utils/logger';

export class EventFormatter {
  private game: BigBrotherGame | null = null;
  private logger: Logger | null = null;

  setGame(game: BigBrotherGame): void {
    this.game = game;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  groupEventsByWeek(): Record<string, GameEvent[]> {
    if (!this.game) return {};
    
    const eventsByWeek: Record<string, GameEvent[]> = {};
    
    for (const event of this.game.eventLog) {
      const weekStr = event.week.toString();
      if (!eventsByWeek[weekStr]) {
        eventsByWeek[weekStr] = [];
      }
      eventsByWeek[weekStr].push(event);
    }
    
    return eventsByWeek;
  }
  
  extractJuryVotes(events: GameEvent[]): Array<{juror: string, vote: string}> {
    return events
      .filter(e => e.type === 'JURY_VOTE')
      .map(e => ({
        juror: e.data?.jurorName || 'Unknown Juror',
        vote: e.data?.voteName || 'Unknown Vote'
      }));
  }
  
  /**
   * Find significant rivalries based on negative relationship events
   */
  findSignificantRivalries(): Array<{guest1: string, guest2: string, intensity: number, events: GameEvent[]}> {
    if (!this.game) return [];
    
    const rivalries: Record<string, {
      guest1: string, 
      guest2: string, 
      intensity: number, 
      events: GameEvent[]
    }> = {};
    
    // Look for betrayals, votes against, and other negative events
    this.game.eventLog.filter(e => 
      e.type.includes('BETRAYAL') || 
      (e.data?.relationships && e.data.relationships.some((r: any) => r.change < -20)) ||
      e.type === 'RELATIONSHIP_THRESHOLD' && e.data?.relationshipStatus === 'Enemies'
    ).forEach(event => {
      // Only consider events with exactly 2 houseguests involved
      if (event.involvedHouseguests.length !== 2) return;
      
      // Sort IDs to ensure consistent key regardless of order
      const [guest1, guest2] = event.involvedHouseguests.slice().sort();
      const key = `${guest1}-${guest2}`;
      
      if (!rivalries[key]) {
        rivalries[key] = {
          guest1, 
          guest2, 
          intensity: 0, 
          events: []
        };
      }
      
      // Calculate intensity based on event type
      let eventIntensity = 0;
      if (event.type.includes('BETRAYAL')) {
        eventIntensity = 30;
      } else if (event.type === 'RELATIONSHIP_THRESHOLD' && event.data?.relationshipStatus === 'Enemies') {
        eventIntensity = 25;
      } else if (event.data?.relationships) {
        const mostNegative = Math.min(...event.data.relationships.map((r: any) => r.change));
        eventIntensity = Math.abs(mostNegative);
      }
      
      rivalries[key].intensity += eventIntensity;
      rivalries[key].events.push(event);
    });
    
    return Object.values(rivalries)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3); // Return top 3 rivalries
  }
  
  /**
   * Find strong alliances based on alliance events and relationships
   */
  findStrongAlliances(): Array<{allianceId: string, name: string, members: string[], events: GameEvent[]}> {
    if (!this.game) return [];
    
    const allianceEvents = this.game.eventLog.filter(e => 
      e.type.includes('ALLIANCE_') && !e.type.includes('BROKEN') && !e.type.includes('BETRAYED')
    );
    
    const allianceMap: Record<string, {
      allianceId: string,
      name: string,
      members: string[],
      events: GameEvent[]
    }> = {};
    
    allianceEvents.forEach(event => {
      if (!event.data?.allianceId) return;
      
      const { allianceId } = event.data;
      
      if (!allianceMap[allianceId]) {
        // Get alliances from the game model
        const gameAlliances = this.game?.allianceSystem?.getAllAlliances() || [];
        const alliance = gameAlliances.find(a => a.id === allianceId);
        if (!alliance) return;
        
        allianceMap[allianceId] = {
          allianceId,
          name: alliance.name,
          members: alliance.members.map(m => m.id),
          events: []
        };
      }
      
      allianceMap[allianceId].events.push(event);
    });
    
    return Object.values(allianceMap).sort((a, b) => b.events.length - a.events.length);
  }
  
  /**
   * Find major blindsides (unexpected evictions)
   */
  findMajorBlindsides(): GameEvent[] {
    if (!this.game) return [];
    
    return this.game.eventLog.filter(e => 
      e.type === 'EVICTION' && e.data?.blindside === true
    );
  }
  
  /**
   * Find competition streaks
   */
  findCompetitionStreaks(): Array<{houseguestId: string, type: string, count: number}> {
    if (!this.game) return [];
    
    const compWins = this.game.eventLog.filter(e => 
      e.type === 'COMP_WIN' || e.type.includes('_WIN')
    );
    
    // Group by houseguest and competition type
    const winsByHouseguest: Record<string, Record<string, number>> = {};
    
    compWins.forEach(win => {
      const winnerId = win.data?.winnerId || win.involvedHouseguests[0];
      if (!winnerId) return;
      
      const compType = win.type.replace('_WIN', '');
      
      if (!winsByHouseguest[winnerId]) {
        winsByHouseguest[winnerId] = {};
      }
      
      if (!winsByHouseguest[winnerId][compType]) {
        winsByHouseguest[winnerId][compType] = 0;
      }
      
      winsByHouseguest[winnerId][compType] += 1;
    });
    
    // Find streaks (3+ wins of the same type)
    const streaks: Array<{houseguestId: string, type: string, count: number}> = [];
    
    Object.entries(winsByHouseguest).forEach(([houseguestId, wins]) => {
      Object.entries(wins).forEach(([type, count]) => {
        if (count >= 3) {
          streaks.push({ houseguestId, type, count });
        }
      });
    });
    
    return streaks.sort((a, b) => b.count - a.count);
  }
  
  /**
   * Construct player story arc from events involving the player
   */
  constructPlayerStoryArc(): Array<{week: number, events: GameEvent[], narrative: string}> {
    if (!this.game) return [];
    
    // Find player houseguest
    const player = this.game.houseguests.find(h => h.isPlayer);
    if (!player) return [];
    
    const playerEvents = this.game.eventLog.filter(e => 
      e.involvedHouseguests.includes(player.id)
    );
    
    // Group by week
    const eventsByWeek = playerEvents.reduce((acc, event) => {
      if (!acc[event.week]) {
        acc[event.week] = [];
      }
      acc[event.week].push(event);
      return acc;
    }, {} as Record<number, GameEvent[]>);
    
    // Generate narrative for each week
    const storyArc = Object.entries(eventsByWeek).map(([weekStr, events]) => {
      const week = parseInt(weekStr);
      const narrative = this.generateWeekNarrative(week, events, player.id);
      
      return { 
        week, 
        events,
        narrative
      };
    });
    
    return storyArc.sort((a, b) => a.week - b.week);
  }
  
  /**
   * Generate a narrative summary for a player's week
   */
  private generateWeekNarrative(week: number, events: GameEvent[], playerId: string): string {
    if (!this.game) return '';
    
    const player = this.game.getHouseguestById(playerId);
    if (!player) return '';
    
    const isHoH = events.some(e => e.type === 'HOH_WIN' && e.involvedHouseguests[0] === playerId);
    const isPov = events.some(e => e.type === 'POV_WIN' && e.involvedHouseguests[0] === playerId);
    const wasNominated = events.some(e => e.type === 'NOMINATION' && e.involvedHouseguests.includes(playerId));
    const savedWithPov = events.some(e => e.type === 'VETO_USED' && e.data?.savedId === playerId);
    
    // Count positive and negative relationship events
    const relationshipEvents = events.filter(e => 
      e.type === 'RELATIONSHIP_THRESHOLD' || 
      (e.data?.relationships && e.data.relationships.some((r: any) => r.from === playerId || r.to === playerId))
    );
    
    const positiveRelationships = relationshipEvents.filter(e => {
      if (e.type === 'RELATIONSHIP_THRESHOLD') {
        return e.data?.relationshipStatus === 'Allies' || e.data?.relationshipStatus === 'Friends';
      } else if (e.data?.relationships) {
        return e.data.relationships.some((r: any) => 
          (r.from === playerId || r.to === playerId) && r.change > 0
        );
      }
      return false;
    }).length;
    
    const negativeRelationships = relationshipEvents.filter(e => {
      if (e.type === 'RELATIONSHIP_THRESHOLD') {
        return e.data?.relationshipStatus === 'Enemies';
      } else if (e.data?.relationships) {
        return e.data.relationships.some((r: any) => 
          (r.from === playerId || r.to === playerId) && r.change < 0
        );
      }
      return false;
    }).length;
    
    // Generate narrative
    let narrative = '';
    
    if (isHoH) {
      narrative += `${player.name} won HoH this week, giving them power in the game. `;
    }
    
    if (wasNominated) {
      narrative += `${player.name} found themselves on the block this week. `;
      
      if (savedWithPov) {
        narrative += `However, they were saved by the Power of Veto! `;
      }
    }
    
    if (isPov) {
      narrative += `${player.name} won the Power of Veto competition. `;
    }
    
    if (positiveRelationships > negativeRelationships) {
      narrative += `${player.name} strengthened several relationships in the house. `;
    } else if (negativeRelationships > positiveRelationships) {
      narrative += `${player.name} had some conflicts with other houseguests. `;
    } else if (positiveRelationships > 0 || negativeRelationships > 0) {
      narrative += `${player.name} had mixed social interactions this week. `;
    }
    
    // Add alliance information
    const allianceEvents = events.filter(e => e.type.includes('ALLIANCE_'));
    if (allianceEvents.length > 0) {
      narrative += `${player.name} was involved in alliance activities. `;
    }
    
    return narrative.trim();
  }
}
