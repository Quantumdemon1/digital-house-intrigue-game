
/**
 * @file src/utils/recap/weekly-recap-builder.ts
 * @description Builds recaps for individual game weeks
 */

import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { GameEvent } from '@/models/game-state';
import type { Logger } from '@/utils/logger';

export class WeeklyRecapBuilder {
  private game: BigBrotherGame | null = null;
  private logger: Logger | null = null;

  setGame(game: BigBrotherGame): void {
    this.game = game;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  buildWeekRecap(weekNum: number, events: GameEvent[]): string {
    let recap = '';
    
    // Find key events
    const hohWin = this.findHoHWinner(events);
    const nominees = this.findNominees(events);
    const vetoWin = this.findVetoWinner(events);
    const vetoUsed = this.findIfVetoUsed(events);
    const replacementNom = this.findReplacementNominee(events);
    const evicted = this.findEvicted(events);
    
    // Build week narrative
    if (hohWin) {
      recap += `- **HoH**: ${hohWin}\n`;
    }
    
    if (nominees && nominees.length > 0) {
      recap += `- **Nominees**: ${nominees.join(" and ")}\n`;
    }
    
    if (vetoWin) {
      recap += `- **PoV**: ${vetoWin}\n`;
    }
    
    if (vetoUsed !== null) {
      if (vetoUsed) {
        recap += `- **Veto**: Used`;
        if (replacementNom) {
          recap += `, ${replacementNom} nominated as replacement\n`;
        } else {
          recap += "\n";
        }
      } else {
        recap += `- **Veto**: Not used\n`;
      }
    }
    
    if (evicted) {
      recap += `- **Evicted**: ${evicted}\n`;
    }
    
    // Add relationship changes
    const relationshipChanges = this.findSignificantRelationshipChanges(events);
    if (relationshipChanges.length > 0) {
      recap += "\n**Relationship Changes:**\n";
      relationshipChanges.forEach(change => {
        recap += `- ${change}\n`;
      });
    }
    
    // Add alliance activities
    const allianceEvents = this.findAllianceEvents(events);
    if (allianceEvents.length > 0) {
      recap += "\n**Alliance Activities:**\n";
      allianceEvents.forEach(event => {
        recap += `- ${event}\n`;
      });
    }
    
    // Add major game moments
    const keyMoments = this.findKeyMoments(events);
    if (keyMoments.length > 0) {
      recap += "\n**Key Moments:**\n";
      keyMoments.forEach(moment => {
        recap += `- ${moment}\n`;
      });
    }
    
    recap += "\n";
    return recap;
  }
  
  private findHoHWinner(events: GameEvent[]): string | null {
    const hohEvent = events.find(e => 
      e.type === 'COMP_WIN' && 
      e.description.toLowerCase().includes('hoh')
    );
    
    if (hohEvent?.data?.winnerName) {
      return hohEvent.data.winnerName;
    }
    return null;
  }
  
  private findNominees(events: GameEvent[]): string[] {
    const nominees: string[] = [];
    
    events.filter(e => e.type === 'NOMINATION').forEach(event => {
      if (event.data?.nomineeId && this.game) {
        const nominee = this.game.getHouseguestById(event.data.nomineeId);
        if (nominee) nominees.push(nominee.name);
      }
    });
    
    return [...new Set(nominees)]; // Remove duplicates
  }
  
  private findVetoWinner(events: GameEvent[]): string | null {
    const vetoEvent = events.find(e => 
      e.type === 'COMP_WIN' && 
      (e.description.toLowerCase().includes('veto') || e.description.toLowerCase().includes('pov'))
    );
    
    if (vetoEvent?.data?.winnerName) {
      return vetoEvent.data.winnerName;
    }
    return null;
  }
  
  private findIfVetoUsed(events: GameEvent[]): boolean | null {
    const vetoEvent = events.find(e => e.type === 'VETO_USED');
    if (vetoEvent) return true;
    
    const vetoNotUsedEvent = events.find(e => e.type === 'VETO_NOT_USED');
    if (vetoNotUsedEvent) return false;
    
    return null;
  }
  
  private findReplacementNominee(events: GameEvent[]): string | null {
    const replacementEvent = events.find(e => e.type === 'REPLACEMENT_NOM');
    
    if (replacementEvent?.data?.nomineeId && this.game) {
      const nominee = this.game.getHouseguestById(replacementEvent.data.nomineeId);
      return nominee?.name || null;
    }
    return null;
  }
  
  private findEvicted(events: GameEvent[]): string | null {
    const evictionEvent = events.find(e => e.type === 'EVICTION');
    
    if (evictionEvent?.data?.evicted) {
      return evictionEvent.data.evicted;
    }
    return null;
  }
  
  private findSignificantRelationshipChanges(events: GameEvent[]): string[] {
    if (!this.game) return [];
    
    const changes: string[] = [];
    
    // Look for status changes
    events.filter(e => e.type === 'RELATIONSHIP_THRESHOLD').forEach(event => {
      if (event.involvedHouseguests.length !== 2) return;
      
      const guest1 = this.game?.getHouseguestById(event.involvedHouseguests[0]);
      const guest2 = this.game?.getHouseguestById(event.involvedHouseguests[1]);
      
      if (guest1 && guest2 && event.data?.relationshipStatus) {
        changes.push(`${guest1.name} and ${guest2.name} became ${event.data.relationshipStatus}`);
      }
    });
    
    // Look for major relationship changes
    events.filter(e => e.data?.relationships).forEach(event => {
      if (!event.data?.relationships) return;
      
      event.data.relationships.forEach((rel: any) => {
        if (Math.abs(rel.change) >= 20) { // Only include significant changes
          const guest1 = this.game?.getHouseguestById(rel.from);
          const guest2 = this.game?.getHouseguestById(rel.to);
          
          if (guest1 && guest2) {
            const direction = rel.change > 0 ? 'improved' : 'worsened';
            changes.push(`${guest1.name}'s relationship with ${guest2.name} ${direction} significantly`);
          }
        }
      });
    });
    
    return changes;
  }
  
  private findAllianceEvents(events: GameEvent[]): string[] {
    if (!this.game) return [];
    
    const allianceEvents: string[] = [];
    
    events.filter(e => e.type.includes('ALLIANCE_')).forEach(event => {
      // Get alliances from the game model
      const gameAlliances = this.game?.allianceSystem?.getAllAlliances() || [];
      const alliance = gameAlliances.find(a => a.id === event.data?.allianceId);
      
      if (alliance) {
        switch (event.type) {
          case 'ALLIANCE_FORMED':
            allianceEvents.push(`The "${alliance.name}" alliance was formed`);
            break;
          case 'ALLIANCE_BROKEN':
            allianceEvents.push(`The "${alliance.name}" alliance was broken`);
            break;
          case 'ALLIANCE_BETRAYED':
            if (event.data?.betrayerId && event.data?.betrayedId) {
              const betrayer = this.game.getHouseguestById(event.data.betrayerId);
              const betrayed = this.game.getHouseguestById(event.data.betrayedId);
              if (betrayer && betrayed) {
                allianceEvents.push(`${betrayer.name} betrayed ${betrayed.name} in the "${alliance.name}" alliance`);
              }
            } else {
              allianceEvents.push(`Betrayal occurred in the "${alliance.name}" alliance`);
            }
            break;
          case 'ALLIANCE_EXPOSED':
            allianceEvents.push(`The "${alliance.name}" alliance was exposed to the house`);
            break;
        }
      }
    });
    
    return allianceEvents;
  }
  
  private findKeyMoments(events: GameEvent[]): string[] {
    const keyMoments: string[] = [];
    
    // Look for blindsides and major game events
    events.filter(e => 
      (e.type === 'EVICTION' && e.data?.blindside) || 
      e.type.includes('GAME_MOMENT_') ||
      e.data?.significance === 'major'
    ).forEach(event => {
      keyMoments.push(event.description);
    });
    
    // Add AI decisions with reasoning that affected the game
    events.filter(e => e.type === 'AI_DECISION' && e.data?.reasoning).forEach(event => {
      const hg = this.game?.getHouseguestById(event.data.decisionMaker);
      if (hg) {
        keyMoments.push(`${hg.name}'s decision: ${event.description} (${event.data.reasoning})`);
      }
    });
    
    return keyMoments;
  }
}
