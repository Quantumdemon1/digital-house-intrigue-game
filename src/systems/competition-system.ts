/**
 * @file src/systems/competition-system.ts
 * @description Manages competitions between houseguests
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import type { CompetitionType } from '@/models/houseguest';

export class CompetitionSystem {
  private game: BigBrotherGame | null = null;
  private logger: Logger | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  setGame(game: BigBrotherGame): void {
    this.game = game;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  // Calculate the average stat of a houseguest
  getAverageStat(houseguest: Houseguest): number {
    const stats = houseguest.stats;
    const sum = stats.physical + stats.mental + stats.endurance + stats.social + stats.luck;
    return sum / 5;
  }

  // Calculate the relevant stat based on the competition type
  getRelevantStat(houseguest: Houseguest, competitionType: CompetitionType): number {
    switch (competitionType) {
      case 'physical':
        return houseguest.stats.physical;
      case 'mental':
        return houseguest.stats.mental;
      case 'endurance':
        return houseguest.stats.endurance;
      case 'social':
        return houseguest.stats.social;
      case 'luck':
        return houseguest.stats.luck;
      default:
        this.logger.warn(`Unknown competition type: ${competitionType}, defaulting to average`);
        return this.getAverageStat(houseguest);
    }
  }

  // Run a competition with a specific type, or random if not specified
  runCompetition(competitors: Houseguest[], competitionType?: CompetitionType): {
    winner: Houseguest;
    results: {houseguest: Houseguest; score: number}[];
  } {
    // Choose a random competition type if none specified
    const type = competitionType || this.getRandomCompetitionType();

    // Log the competition type
    this.logger?.info(`Running ${type} competition between ${competitors.map(c => c.name).join(', ')}`);

    // Calculate scores for each competitor
    const results = competitors.map(houseguest => {
      const score = this.getRelevantStat(houseguest, type) * (0.75 + Math.random() * 0.5); // Add some randomness
      return { houseguest, score };
    });

    // Determine the winner
    const winner = results.reduce((prev, current) => (prev.score > current.score) ? prev : current).houseguest;

    // Log the winner
    this.logger?.info(`${winner.name} won the ${type} competition`);

    return { winner, results };
  }

  getRandomCompetitionType(): CompetitionType {
    const types: CompetitionType[] = ['physical', 'mental', 'endurance', 'social', 'luck'];
    return types[Math.floor(Math.random() * types.length)];
  }
}
