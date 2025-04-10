
import { Houseguest, CompetitionType, calculateCompetitionAdvantage } from '../models/houseguest';

export interface CompetitionResult {
  houseguest: Houseguest;
  score: number;
  position: number;
}

export class CompetitionSystem {
  private logger: any;

  constructor(logger: any) {
    this.logger = logger;
  }

  runCompetition(
    participants: Houseguest[],
    competitionType: CompetitionType,
    options: {
      numberOfWinners?: number;
      excludeFromWinning?: string[];
    } = {}
  ): CompetitionResult[] {
    const { numberOfWinners = 1, excludeFromWinning = [] } = options;
    
    if (participants.length === 0) {
      this.logger.warn('Cannot run competition with 0 participants');
      return [];
    }
    
    // Calculate scores for each participant
    const results: CompetitionResult[] = participants.map(houseguest => {
      // Base score based on relevant stat
      let baseScore = 0;
      
      switch (competitionType) {
        case 'Physical':
          baseScore = houseguest.stats.physical * 1.5;
          break;
        case 'Mental':
          baseScore = houseguest.stats.mental * 1.5;
          break;
        case 'Endurance':
          baseScore = houseguest.stats.endurance * 1.5;
          break;
        case 'Social':
          baseScore = houseguest.stats.social * 1.5;
          break;
        case 'Luck':
          // Everyone has roughly equal chance in luck competitions
          baseScore = houseguest.stats.luck + 5;
          break;
      }
      
      // Add trait-based advantage
      const traitBonus = calculateCompetitionAdvantage(houseguest, competitionType);
      
      // Add randomness
      const randomFactor = 0.7 + Math.random() * 0.6; // 70%-130% random factor
      
      // Calculate final score
      const score = (baseScore + traitBonus) * randomFactor;
      
      return {
        houseguest,
        score,
        position: 0 // Will be calculated after sorting
      };
    });
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    // Assign positions (ranks)
    results.forEach((result, index) => {
      result.position = index + 1;
    });
    
    // Handle exclusions (can't win but still compete)
    if (excludeFromWinning.length > 0) {
      // Filter excluded houseguests from potential winners
      const eligibleResults = results.filter(
        result => !excludeFromWinning.includes(result.houseguest.id)
      );
      
      // If we have enough eligible participants for winners
      if (eligibleResults.length >= numberOfWinners) {
        // Move eligible houseguests to the top positions
        for (let i = 0; i < numberOfWinners; i++) {
          if (excludeFromWinning.includes(results[i].houseguest.id)) {
            // Find next eligible houseguest
            const nextEligible = results.findIndex(
              r => !excludeFromWinning.includes(r.houseguest.id) && r.position > numberOfWinners
            );
            
            if (nextEligible !== -1) {
              // Swap positions
              const temp = results[i].position;
              results[i].position = results[nextEligible].position;
              results[nextEligible].position = temp;
              
              // Also swap in the array to maintain sorted order
              [results[i], results[nextEligible]] = [results[nextEligible], results[i]];
            }
          }
        }
      }
    }
    
    this.logger.info(`Competition (${competitionType}) results:`, 
      results.slice(0, 3).map(r => `${r.position}. ${r.houseguest.name}: ${r.score.toFixed(2)}`));
    
    return results;
  }

  simulateHoHCompetition(
    participants: Houseguest[]
  ): CompetitionResult[] {
    // Select a random competition type
    const competitionTypes: CompetitionType[] = ['Physical', 'Mental', 'Endurance', 'Social', 'Luck'];
    const competitionType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
    
    this.logger.info(`Running HoH Competition (${competitionType}) with ${participants.length} participants`);
    
    const results = this.runCompetition(participants, competitionType, {
      numberOfWinners: 1
    });
    
    // Log the winner
    if (results.length > 0) {
      const winner = results[0];
      this.logger.info(`${winner.houseguest.name} won the HoH competition!`);
    }
    
    return results;
  }

  simulatePovCompetition(
    participants: Houseguest[], 
    hohId: string
  ): CompetitionResult[] {
    // Select a random competition type
    const competitionTypes: CompetitionType[] = ['Physical', 'Mental', 'Endurance', 'Social', 'Luck'];
    const competitionType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
    
    this.logger.info(`Running PoV Competition (${competitionType}) with ${participants.length} participants`);
    
    const results = this.runCompetition(participants, competitionType, {
      numberOfWinners: 1
    });
    
    // Log the winner
    if (results.length > 0) {
      const winner = results[0];
      this.logger.info(`${winner.houseguest.name} won the Power of Veto!`);
    }
    
    return results;
  }
}
