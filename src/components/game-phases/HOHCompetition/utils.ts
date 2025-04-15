
import { Houseguest, CompetitionType } from '@/models/houseguest';

// Helper function for weighted random selection based on stats
export const selectRandomWinner = (houseguests: Houseguest[], competitionType: CompetitionType): Houseguest => {
  let totalWeight = 0;
  const weights: number[] = [];

  // Calculate weights based on competition type
  houseguests.forEach(houseguest => {
    let weight = 1; // Base weight

    // Adjust weight based on competition type and related stats
    switch (competitionType) {
      case 'physical':
        weight = houseguest.stats.physical * 1.5;
        break;
      case 'mental':
        weight = houseguest.stats.mental * 1.5;
        break;
      case 'endurance':
        weight = houseguest.stats.endurance * 1.5;
        break;
      case 'social':
        weight = houseguest.stats.social * 1.5;
        break;
      case 'luck':
        // Everyone has roughly equal chance in luck competitions
        weight = houseguest.stats.luck + 5;
        break;
    }

    // Add some randomness
    weight *= 0.75 + Math.random() * 0.5; // 75-125% random factor

    // Add this houseguest's weight to the total
    totalWeight += weight;
    weights.push(totalWeight);
  });

  // Select a random point within the total weight range
  const selection = Math.random() * totalWeight;

  // Find the houseguest whose weight range contains the selection point
  for (let i = 0; i < weights.length; i++) {
    if (selection <= weights[i]) {
      return houseguests[i];
    }
  }

  // Fallback (should never happen)
  return houseguests[0];
};

export const competitionTypes: CompetitionType[] = ['physical', 'mental', 'endurance', 'luck', 'social'];
