
import { BigBrotherGame, GameEvent } from '../models/BigBrotherGame';
import { Houseguest } from '../models/houseguest';

export class GameRecapGenerator {
  private game: BigBrotherGame | null = null;
  private logger: any = console;

  setGame(game: BigBrotherGame): void {
    this.game = game;
  }

  setLogger(logger: any): void {
    this.logger = logger;
  }

  generateRecap(): string {
    if (!this.game) {
      this.logger.error('No game set for recap generation');
      return 'No game data available for recap.';
    }

    try {
      let recap = `# Big Brother Season Recap\n\n`;
      
      // Winner information
      if (this.game.winner) {
        recap += `## Winner: ${this.game.winner}\n\n`;
        const winnerObj = this.game.getHouseguestById(this.game.winner);
        if (winnerObj) {
          recap += `${winnerObj.name} has won Big Brother!\n\n`;
        }
      }
      
      // Runner-up information
      if (this.game.finalTwo && this.game.finalTwo.length > 1) {
        const runnerUpId = this.game.finalTwo.find(id => id !== this.game.winner) || null;
        if (runnerUpId) {
          const runnerUp = this.game.getHouseguestById(runnerUpId);
          if (runnerUp) {
            recap += `## Runner-up: ${runnerUp.name}\n\n`;
          }
        }
      }
      
      // Week-by-week breakdown
      recap += `## Week-by-Week Breakdown\n\n`;
      
      // Group events by week
      const eventsByWeek: Record<number, GameEvent[]> = {};
      this.game.eventLog.forEach(event => {
        if (!eventsByWeek[event.week]) {
          eventsByWeek[event.week] = [];
        }
        eventsByWeek[event.week].push(event);
      });
      
      // Process each week
      Object.keys(eventsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(weekStr => {
        const week = parseInt(weekStr);
        const events = eventsByWeek[week];
        
        recap += `### Week ${week}\n\n`;
        
        // Head of Household
        const hohEvents = events.filter(e => e.type === 'HOH_WIN');
        if (hohEvents.length > 0) {
          const hohId = this.extractHohId(hohEvents[0]);
          const hoh = hohId ? this.game?.getHouseguestById(hohId) : null;
          
          if (hoh) {
            recap += `- **Head of Household**: ${hoh.name}\n`;
          }
        }
        
        // Nominations
        const nominationEvents = events.filter(e => e.type === 'NOMINATION');
        if (nominationEvents.length > 0) {
          recap += `- **Nominees**: ${this.extractNominees(nominationEvents[0])}\n`;
        }
        
        // Power of Veto
        const povEvents = events.filter(e => e.type === 'POV_WIN');
        if (povEvents.length > 0) {
          const povId = this.extractPovId(povEvents[0]);
          const pov = povId ? this.game?.getHouseguestById(povId) : null;
          
          if (pov) {
            recap += `- **Power of Veto Winner**: ${pov.name}\n`;
          }
        }
        
        // Veto used/not used
        const vetoUsedEvents = events.filter(e => e.type === 'POV_USED' || e.type === 'POV_NOT_USED');
        if (vetoUsedEvents.length > 0) {
          recap += `- **Veto**: ${vetoUsedEvents[0].description}\n`;
        }
        
        // Eviction
        const evictionEvents = events.filter(e => e.type === 'EVICTION');
        if (evictionEvents.length > 0) {
          recap += `- **Evicted**: ${this.extractEvicted(evictionEvents[0])}\n`;
        }
        
        recap += '\n';
      });
      
      // Competition wins
      recap += `## Competition Wins\n\n`;
      
      // Sort houseguests by total wins
      const sortedHouseguests = [...this.game.houseguests].sort((a, b) => {
        const totalA = a.competitionsWon.hoh + a.competitionsWon.pov + a.competitionsWon.other;
        const totalB = b.competitionsWon.hoh + b.competitionsWon.pov + b.competitionsWon.other;
        return totalB - totalA;
      });
      
      // List top competitors
      recap += `| Houseguest | HoH Wins | PoV Wins | Total Wins |\n`;
      recap += `| ---------- | -------- | -------- | ---------- |\n`;
      
      for (const houseguest of sortedHouseguests) {
        const totalWins = houseguest.competitionsWon.hoh + houseguest.competitionsWon.pov + houseguest.competitionsWon.other;
        if (totalWins > 0) {
          recap += `| ${houseguest.name} | ${houseguest.competitionsWon.hoh} | ${houseguest.competitionsWon.pov} | ${totalWins} |\n`;
        }
      }
      
      recap += '\n';
      
      // Nomination counts
      recap += `## Most Nominated Houseguests\n\n`;
      
      // Sort by nomination count
      const mostNominated = [...this.game.houseguests].sort((a, b) => b.nominations - a.nominations);
      
      recap += `| Houseguest | Times Nominated |\n`;
      recap += `| ---------- | --------------- |\n`;
      
      for (const houseguest of mostNominated.slice(0, 5)) {
        if (houseguest.nominations > 0) {
          recap += `| ${houseguest.name} | ${houseguest.nominations} |\n`;
        }
      }
      
      recap += '\n';
      
      // Add a footer
      recap += `---\n\nBig Brother Season Complete!`;
      
      return recap;
    } catch (error) {
      this.logger.error('Error generating recap:', error);
      return 'An error occurred while generating the recap.';
    }
  }

  private extractHohId(event: GameEvent): string | null {
    // Implementation depends on actual event structure
    if (event.data && event.data.hohId) {
      return event.data.hohId as string;
    }
    return null;
  }

  private extractPovId(event: GameEvent): string | null {
    // Implementation depends on actual event structure
    if (event.data && event.data.povId) {
      return event.data.povId as string;
    }
    return null;
  }

  private extractNominees(event: GameEvent): string {
    // Implementation depends on actual event structure
    if (event.description) {
      return event.description.replace('have been nominated for eviction', '').trim();
    }
    return "Unknown nominees";
  }

  private extractEvicted(event: GameEvent): string {
    // Implementation depends on actual event structure
    if (event.data && event.data.evicted) {
      return event.data.evicted as string;
    }
    if (event.description) {
      return event.description;
    }
    return "Unknown evicted houseguest";
  }
}
