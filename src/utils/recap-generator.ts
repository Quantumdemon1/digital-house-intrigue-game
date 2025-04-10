
/**
 * @file src/utils/recap-generator.ts
 * @description Generates narrative recaps of the game's events
 */

import { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame, GameEvent } from '@/models/BigBrotherGame';
import type { Logger } from '@/utils/logger';

export class GameRecapGenerator {
  private game: BigBrotherGame | null = null;
  private logger: Logger | null = null;

  constructor() {
    // Logger and game will be set later via setters
  }

  setGame(game: BigBrotherGame): void {
    this.game = game;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  async generateRecap(): Promise<string> {
    if (!this.game) {
      if (this.logger) this.logger.error("Cannot generate recap: Game not set");
      return "Game recap unavailable.";
    }
    
    let markdown = "# Big Brother: Season Recap\n\n";
    
    // Add winner information if available
    if (this.game.winner) {
      const winnerHG = this.game.getHouseguestById(this.game.winner);
      if (winnerHG) {
        markdown += `## Winner: ${winnerHG.name}\n\n`;
        
        // If we have finalists
        if (this.game.finalTwo && this.game.finalTwo.length >= 2) {
          const runnerId = this.game.finalTwo.find(id => id !== this.game.winner);
          if (runnerId) {
            const runnerHG = this.game.getHouseguestById(runnerId);
            if (runnerHG) {
              markdown += `**Runner-up**: ${runnerHG.name}\n\n`;
            }
          }
        }
      }
    }
    
    // Generate weekly summaries
    markdown += "## Weekly Overview\n\n";
    
    const eventsByWeek = this.groupEventsByWeek();
    
    for (const [week, events] of Object.entries(eventsByWeek)) {
      const weekNum = parseInt(week);
      if (isNaN(weekNum)) continue;
      
      markdown += `### Week ${weekNum}\n\n`;
      
      // Find key events
      const hohWin = this.findHoHWinner(events);
      const nominees = this.findNominees(events);
      const vetoWin = this.findVetoWinner(events);
      const vetoUsed = this.findIfVetoUsed(events);
      const replacementNom = this.findReplacementNominee(events);
      const evicted = this.findEvicted(events);
      
      // Build week narrative
      if (hohWin) {
        markdown += `- **HoH**: ${hohWin}\n`;
      }
      
      if (nominees && nominees.length > 0) {
        markdown += `- **Nominees**: ${nominees.join(" and ")}\n`;
      }
      
      if (vetoWin) {
        markdown += `- **PoV**: ${vetoWin}\n`;
      }
      
      if (vetoUsed !== null) {
        if (vetoUsed) {
          markdown += `- **Veto**: Used`;
          if (replacementNom) {
            markdown += `, ${replacementNom} nominated as replacement\n`;
          } else {
            markdown += "\n";
          }
        } else {
          markdown += `- **Veto**: Not used\n`;
        }
      }
      
      if (evicted) {
        markdown += `- **Evicted**: ${evicted}\n`;
      }
      
      markdown += "\n";
    }
    
    // Add any special events or jury votes if available
    const finalEvents = eventsByWeek[this.game.currentWeek.toString()] || [];
    const finalVotes = this.extractJuryVotes(finalEvents);
    if (finalVotes.length > 0) {
      markdown += "## Jury Votes\n\n";
      finalVotes.forEach(vote => {
        markdown += `- ${vote.juror} voted for ${vote.vote}\n`;
      });
      markdown += "\n";
    }
    
    return markdown;
  }

  private groupEventsByWeek(): Record<string, GameEvent[]> {
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
      if (event.data?.nomineeId) {
        const nominee = this.game?.getHouseguestById(event.data.nomineeId);
        if (nominee) nominees.push(nominee.name);
      }
    });
    
    return [...new Set(nominees)]; // Remove duplicates
  }
  
  private findVetoWinner(events: GameEvent[]): string | null {
    const vetoEvent = events.find(e => 
      e.type === 'COMP_WIN' && 
      e.description.toLowerCase().includes('veto') || e.description.toLowerCase().includes('pov')
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
    
    if (replacementEvent?.data?.nomineeId) {
      const nominee = this.game?.getHouseguestById(replacementEvent.data.nomineeId);
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
  
  private extractJuryVotes(events: GameEvent[]): Array<{juror: string, vote: string}> {
    return events
      .filter(e => e.type === 'JURY_VOTE')
      .map(e => ({
        juror: e.data?.jurorName || 'Unknown Juror',
        vote: e.data?.voteName || 'Unknown Vote'
      }));
  }
}
