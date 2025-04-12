
/**
 * @file src/utils/recap/finale-recap-builder.ts
 * @description Builds finale-related sections of the game recap
 */

import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { GameEvent } from '@/models/game-state';
import type { Logger } from '@/utils/logger';
import type { EventFormatter } from './event-formatter';

export class FinaleRecapBuilder {
  private game: BigBrotherGame | null = null;
  private logger: Logger | null = null;
  private eventFormatter: EventFormatter | null = null;

  setGame(game: BigBrotherGame): void {
    this.game = game;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  setEventFormatter(formatter: EventFormatter): void {
    this.eventFormatter = formatter;
  }

  buildWinnerSection(): string {
    if (!this.game || !this.game.winner) return '';
    
    let markdown = '';
    const winnerHG = this.game.winner;
    
    if (winnerHG) {
      markdown += `## Winner: ${winnerHG.name}\n\n`;
      
      // Add winner stats
      markdown += `**Competition wins**: HoH: ${winnerHG.competitionsWon?.hoh || 0}, PoV: ${winnerHG.competitionsWon?.pov || 0}\n\n`;
      
      // If we have finalists
      if (this.game.finalTwo && this.game.finalTwo.length >= 2) {
        const runner = this.game.runnerUp;
        if (runner) {
          markdown += `**Runner-up**: ${runner.name}\n\n`;
          markdown += `**Competition wins**: HoH: ${runner.competitionsWon?.hoh || 0}, PoV: ${runner.competitionsWon?.pov || 0}\n\n`;
        }
      }
    }
    
    return markdown;
  }

  buildJuryVotesSection(events: GameEvent[]): string | null {
    if (!this.eventFormatter) {
      if (this.logger) this.logger.warn("EventFormatter not set in FinaleRecapBuilder");
      return null;
    }
    
    const finalVotes = this.extractJuryVotes(events);
    if (finalVotes.length === 0) return null;
    
    let section = "## Jury Votes\n\n";
    finalVotes.forEach(vote => {
      section += `- ${vote.juror} voted for ${vote.vote}\n`;
    });
    section += "\n";
    
    // Add vote count
    if (this.game?.winner && this.game.runnerUp) {
      const winnerVotes = finalVotes.filter(v => v.vote === this.game!.winner!.name).length;
      const runnerUpVotes = finalVotes.filter(v => v.vote === this.game!.runnerUp!.name).length;
      
      section += `### Final Vote Count\n`;
      section += `- ${this.game.winner.name}: ${winnerVotes} vote${winnerVotes !== 1 ? 's' : ''}\n`;
      section += `- ${this.game.runnerUp.name}: ${runnerUpVotes} vote${runnerUpVotes !== 1 ? 's' : ''}\n\n`;
    }
    
    return section;
  }
  
  buildSeasonHighlightsSection(): string | null {
    if (!this.game || !this.eventFormatter) return null;
    
    let section = "## Season Highlights\n\n";
    
    // Add major rivalries
    const rivalries = this.eventFormatter.findSignificantRivalries();
    if (rivalries.length > 0) {
      section += "### Major Rivalries\n\n";
      rivalries.forEach(rivalry => {
        const guest1 = this.game!.getHouseguestById(rivalry.guest1);
        const guest2 = this.game!.getHouseguestById(rivalry.guest2);
        
        if (guest1 && guest2) {
          section += `- **${guest1.name} vs. ${guest2.name}**: `;
          
          // Add brief description of why they were rivals
          if (rivalry.events.some(e => e.type.includes('BETRAYAL'))) {
            section += `A bitter rivalry marked by betrayal`;
          } else if (rivalry.events.some(e => e.type === 'RELATIONSHIP_THRESHOLD' && e.data?.relationshipStatus === 'Enemies')) {
            section += `These two became sworn enemies in the house`;
          } else {
            section += `These houseguests clashed throughout the season`;
          }
          section += "\n";
        }
      });
      section += "\n";
    }
    
    // Add strong alliances
    const alliances = this.eventFormatter.findStrongAlliances();
    if (alliances.length > 0) {
      section += "### Power Alliances\n\n";
      alliances.slice(0, 3).forEach(alliance => {
        const memberNames = alliance.members
          .map(id => this.game!.getHouseguestById(id)?.name)
          .filter(Boolean);
        
        if (memberNames.length > 0) {
          section += `- **${alliance.name}**: ${memberNames.join(', ')}\n`;
        }
      });
      section += "\n";
    }
    
    // Add blindsides
    const blindsides = this.eventFormatter.findMajorBlindsides();
    if (blindsides.length > 0) {
      section += "### Biggest Blindsides\n\n";
      blindsides.forEach(event => {
        section += `- ${event.description}\n`;
      });
      section += "\n";
    }
    
    // Add competition streaks
    const compStreaks = this.eventFormatter.findCompetitionStreaks();
    if (compStreaks.length > 0) {
      section += "### Competition Beasts\n\n";
      compStreaks.forEach(streak => {
        const houseguest = this.game!.getHouseguestById(streak.houseguestId);
        if (houseguest) {
          section += `- **${houseguest.name}**: ${streak.count} ${streak.type} wins\n`;
        }
      });
      section += "\n";
    }
    
    return section;
  }
  
  buildPlayerJourneySection(): string | null {
    if (!this.game || !this.eventFormatter) return null;
    
    const player = this.game.houseguests.find(h => h.isPlayer);
    if (!player) return null;
    
    const storyArc = this.eventFormatter.constructPlayerStoryArc();
    if (storyArc.length === 0) return null;
    
    let section = `## ${player.name}'s Journey\n\n`;
    
    // Write a summary of the player's game
    const finalPlacement = player.status === 'Active' ? 
      (this.game.winner?.id === player.id ? 'Winner' : 'Runner-up') : 
      `Placed ${this.calculatePlacement(player.id)}`;
    
    section += `### ${finalPlacement}\n\n`;
    
    // Add competition stats
    const compWins = player.competitionsWon?.hoh || 0 + player.competitionsWon?.pov || 0;
    section += `- **Competition Wins**: ${compWins} (HoH: ${player.competitionsWon?.hoh || 0}, PoV: ${player.competitionsWon?.pov || 0})\n`;
    
    // Count how many times nominated
    const timesNominated = this.game.eventLog.filter(e => 
      e.type === 'NOMINATION' && e.involvedHouseguests.includes(player.id)
    ).length;
    section += `- **Times Nominated**: ${timesNominated}\n\n`;
    
    // Add key moments from the player's journey
    section += "### Key Moments\n\n";
    
    storyArc.filter(week => week.narrative.trim() !== '').forEach(week => {
      section += `- **Week ${week.week}**: ${week.narrative}\n`;
    });
    section += "\n";
    
    return section;
  }
  
  private extractJuryVotes(events: GameEvent[]): Array<{juror: string, vote: string}> {
    return events
      .filter(e => e.type === 'JURY_VOTE')
      .map(e => ({
        juror: e.data?.jurorName || 'Unknown Juror',
        vote: e.data?.voteName || 'Unknown Vote'
      }));
  }
  
  private calculatePlacement(houseguestId: string): string {
    if (!this.game) return 'Unknown';
    
    // Count number of houseguests
    const totalHouseguests = this.game.houseguests.length;
    
    // Find eviction event for this houseguest
    const evictionEvent = this.game.eventLog.find(e => 
      e.type === 'EVICTION' && 
      e.involvedHouseguests.includes(houseguestId)
    );
    
    if (!evictionEvent) return 'Unknown';
    
    // Count how many houseguests were evicted after this one
    const evictionWeek = evictionEvent.week;
    const laterEvictions = this.game.eventLog.filter(e => 
      e.type === 'EVICTION' && 
      e.week > evictionWeek
    ).length;
    
    // Calculate placement (add 2 for the winner and runner-up)
    const placement = laterEvictions + 2 + 1;
    
    // Convert to ordinal (1st, 2nd, 3rd, etc.)
    const ordinal = (num: number): string => {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const v = num % 100;
      return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    };
    
    return ordinal(placement);
  }
}
