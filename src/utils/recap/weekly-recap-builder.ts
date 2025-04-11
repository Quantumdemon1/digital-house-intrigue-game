
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
}
