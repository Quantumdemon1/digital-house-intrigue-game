
import { Houseguest, CompetitionType } from '@/models/houseguest';

// Competition types available for POV
export const povCompetitionTypes: CompetitionType[] = ['physical', 'mental', 'endurance', 'luck', 'social'];

// Helper function for weighted random selection based on stats
// Uses the same logic as HOH competition for consistency
export const selectStatWeightedWinner = (houseguests: Houseguest[], competitionType: CompetitionType): Houseguest => {
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

// Select a random competition type
export const selectRandomCompetitionType = (): CompetitionType => {
  return povCompetitionTypes[Math.floor(Math.random() * povCompetitionTypes.length)];
};

// Legacy function for backwards compatibility - now uses stat-weighted selection
export const determineRandomWinner = (players: Houseguest[]): Houseguest => {
  const competitionType = selectRandomCompetitionType();
  return selectStatWeightedWinner(players, competitionType);
};

// Helper to check if we have valid players for the competition
export const hasValidPlayers = (players: Houseguest[]): boolean => {
  return players && players.length > 0;
};

// Get stat label for display
export const getCompetitionStatLabel = (type: CompetitionType): string => {
  switch (type) {
    case 'physical': return 'Physical prowess';
    case 'mental': return 'Mental acuity';
    case 'endurance': return 'Stamina & endurance';
    case 'social': return 'Social awareness';
    case 'luck': return 'Pure luck';
  }
};
