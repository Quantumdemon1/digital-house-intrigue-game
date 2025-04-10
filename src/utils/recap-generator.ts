
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
        recap += `## Winner: ${this.game.winner.name}\n\n`;
        recap += `![Winner](${this.game.winner.imageUrl})\n\n`;
        recap += `${this.game.winner.name} from ${this.game.winner.hometown} has won Big Brother!\n\n`;
      }
      
      // Runner-up information
      if (this.game.runnerUp) {
        recap += `## Runner-up: ${this.game.runnerUp.name}\n\n`;
      }
      
      // Week-by-week breakdown
      recap += `## Week-by-Week Breakdown\n\n`;
      
      // Group events by week
      const eventsByWeek: Record<number, GameEvent[]> = {};
      this.game.gameLog.forEach(event => {
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
          const hohEvent = hohEvents[0];
          const hohId = hohEvent.involvedHouseguests[0];
          const hoh = hohId ? this.game?.getHouseguestById(hohId) : null;
          
          if (hoh) {
            recap += `- **Head of Household**: ${hoh.name}\n`;
          }
        }
        
        // Nominations
        const nominationEvents = events.filter(e => e.type === 'NOMINATION');
        if (nominationEvents.length > 0) {
          const nomEvent = nominationEvents[0];
          recap += `- **Nominees**: ${nomEvent.description.replace('have been nominated for eviction', '')}\n`;
        }
        
        // Power of Veto
        const povEvents = events.filter(e => e.type === 'POV_WIN');
        if (povEvents.length > 0) {
          const povEvent = povEvents[0];
          const povId = povEvent.involvedHouseguests[0];
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
          recap += `- **Evicted**: ${evictionEvents[0].description}\n`;
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
}
