
/**
 * @file src/utils/recap/finale-recap-builder.ts
 * @description Builds finale-related sections of the game recap
 */

import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { GameEvent } from '@/models/game-state';
import type { Logger } from '@/utils/logger';

export class FinaleRecapBuilder {
  private game: BigBrotherGame | null = null;
  private logger: Logger | null = null;
  private eventFormatter: any = null;

  setGame(game: BigBrotherGame): void {
    this.game = game;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  setEventFormatter(formatter: any): void {
    this.eventFormatter = formatter;
  }

  buildWinnerSection(): string {
    if (!this.game || !this.game.winner) return '';
    
    let markdown = '';
    const winnerHG = this.game.winner;
    
    if (winnerHG) {
      markdown += `## Winner: ${winnerHG.name}\n\n`;
      
      // If we have finalists
      if (this.game.finalTwo && this.game.finalTwo.length >= 2) {
        const runner = this.game.runnerUp;
        if (runner) {
          markdown += `**Runner-up**: ${runner.name}\n\n`;
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
}
