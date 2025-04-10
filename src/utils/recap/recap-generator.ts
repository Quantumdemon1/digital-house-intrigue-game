
/**
 * @file src/utils/recap/recap-generator.ts
 * @description Main recap generator class that coordinates the different recap components
 */

import { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame, GameEvent } from '@/models/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import { WeeklyRecapBuilder } from './weekly-recap-builder';
import { FinaleRecapBuilder } from './finale-recap-builder';
import { EventFormatter } from './event-formatter';

export class GameRecapGenerator {
  private game: BigBrotherGame | null = null;
  private logger: Logger | null = null;
  private weeklyRecapBuilder: WeeklyRecapBuilder;
  private finaleRecapBuilder: FinaleRecapBuilder;
  private eventFormatter: EventFormatter;

  constructor() {
    this.weeklyRecapBuilder = new WeeklyRecapBuilder();
    this.finaleRecapBuilder = new FinaleRecapBuilder();
    this.eventFormatter = new EventFormatter();
  }

  setGame(game: BigBrotherGame): void {
    this.game = game;
    this.weeklyRecapBuilder.setGame(game);
    this.finaleRecapBuilder.setGame(game);
    this.eventFormatter.setGame(game);
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
    this.weeklyRecapBuilder.setLogger(logger);
    this.finaleRecapBuilder.setLogger(logger);
    this.eventFormatter.setLogger(logger);
  }

  async generateRecap(): Promise<string> {
    if (!this.game) {
      if (this.logger) this.logger.error("Cannot generate recap: Game not set");
      return "Game recap unavailable.";
    }
    
    let markdown = "# Big Brother: Season Recap\n\n";
    
    // Add winner information if available
    if (this.game.winner) {
      markdown += this.finaleRecapBuilder.buildWinnerSection();
    }
    
    // Generate weekly summaries
    markdown += "## Weekly Overview\n\n";
    
    const eventsByWeek = this.eventFormatter.groupEventsByWeek();
    
    for (const [week, events] of Object.entries(eventsByWeek)) {
      const weekNum = parseInt(week);
      if (isNaN(weekNum)) continue;
      
      markdown += `### Week ${weekNum}\n\n`;
      markdown += this.weeklyRecapBuilder.buildWeekRecap(weekNum, events);
    }
    
    // Add jury votes if available
    const finalEvents = eventsByWeek[this.game.currentWeek.toString()] || [];
    const juryVotesSection = this.finaleRecapBuilder.buildJuryVotesSection(finalEvents);
    if (juryVotesSection) {
      markdown += juryVotesSection;
    }
    
    return markdown;
  }
}
