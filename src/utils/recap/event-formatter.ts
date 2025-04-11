
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
}
