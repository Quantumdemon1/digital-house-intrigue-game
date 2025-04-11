
export type PersonalityTrait = 
  | 'Strategic' | 'Social' | 'Competitive' | 'Loyal'
  | 'Sneaky' | 'Confrontational' | 'Emotional' | 'Analytical';

export type CompetitionType = 'Physical' | 'Mental' | 'Endurance' | 'Luck' | 'Social';

// Add these new types for mood and stress
export type MoodType = 'Happy' | 'Content' | 'Neutral' | 'Upset' | 'Angry';
export type StressLevel = 'Relaxed' | 'Normal' | 'Tense' | 'Stressed' | 'Overwhelmed';

export type HouseguestStats = {
  physical: number;  // 1-10 scale
  mental: number;    // 1-10 scale
  endurance: number; // 1-10 scale
  social: number;    // 1-10 scale
  luck: number;      // 1-10 scale
};

// Map traits to their primary and secondary stat boosts
export const TRAIT_STAT_BOOSTS: Record<PersonalityTrait, {primary: keyof HouseguestStats, secondary: keyof HouseguestStats}> = {
  'Strategic': { primary: 'mental', secondary: 'luck' },
  'Social': { primary: 'social', secondary: 'luck' },
  'Competitive': { primary: 'physical', secondary: 'endurance' },
  'Loyal': { primary: 'social', secondary: 'endurance' },
  'Sneaky': { primary: 'mental', secondary: 'luck' },
  'Confrontational': { primary: 'physical', secondary: 'mental' },
  'Emotional': { primary: 'social', secondary: 'physical' },
  'Analytical': { primary: 'mental', secondary: 'endurance' }
};

export const TRAIT_BOOST_VALUES = {
  primary: 2,
  secondary: 1
};

// Trait descriptions for tooltips and UI
export const TRAIT_DESCRIPTIONS: Record<PersonalityTrait, string> = {
  'Strategic': 'Focuses on game moves and long-term planning',
  'Social': 'Builds strong relationships and alliances',
  'Competitive': 'Highly motivated to win competitions',
  'Loyal': 'Values trust and keeps commitments',
  'Sneaky': 'Plays deceptively and gathers information',
  'Confrontational': 'Direct and doesn\'t shy away from conflict',
  'Emotional': 'Makes decisions based on feelings and connections',
  'Analytical': 'Carefully evaluates all options and scenarios'
};

// Character goals based on personality traits
export const TRAIT_GOALS: Record<PersonalityTrait, string[]> = {
  'Strategic': [
    'Eliminate the biggest strategic threats',
    'Form alliances with useful people',
    'Gather information about house dynamics',
    'Position myself in the power structure'
  ],
  'Social': [
    'Build relationships with everyone',
    'Avoid direct conflict when possible',
    'Join larger alliances for safety',
    'Be well-liked by the house'
  ],
  'Competitive': [
    'Win as many competitions as possible',
    'Target other competition threats',
    'Build respect through victories',
    'Control my own destiny through wins'
  ],
  'Loyal': [
    'Protect my closest allies at all costs',
    'Target those who betrayed my friends',
    'Honor my promises and commitments',
    'Build a trustworthy reputation'
  ],
  'Sneaky': [
    'Spread misinformation strategically',
    'Create secret alliances and deals',
    'Backstab when advantageous',
    'Manipulate others\'s perceptions'
  ],
  'Confrontational': [
    'Call out dishonesty directly',
    'Establish dominance in arguments',
    'Make big moves that shake up the house',
    'Stand my ground in conflicts'
  ],
  'Emotional': [
    'Follow my feelings about houseguests',
    'Keep loyal to those who are kind to me',
    'Distance myself from negative people',
    'Be authentic in my connections'
  ],
  'Analytical': [
    'Observe patterns in house behavior',
    'Make optimal strategic decisions',
    'Calculate risks and rewards carefully',
    'Find logical paths to victory'
  ]
};

export type HouseguestStatus = 
  | 'Active'       // Still in the game
  | 'Evicted'      // Voted out, not in jury
  | 'Jury'         // Voted out, in jury
  | 'Winner'       // Won the game
  | 'Runner-Up';   // Final 2 but lost

export interface Houseguest {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  bio: string;
  imageUrl: string; // path to avatar image
  traits: PersonalityTrait[];
  stats: HouseguestStats;
  status: HouseguestStatus;
  isPlayer: boolean;
  
  // Game state properties
  isHoH: boolean;
  isPovHolder: boolean;
  isNominated: boolean;
  nominations: number; // How many times they've been nominated
  competitionsWon: {
    hoh: number;
    pov: number;
    other: number;
  };
  
  // New personality state properties
  mood: MoodType;
  stressLevel: StressLevel;
  currentGoals?: string[];
  internalThoughts?: string[];
  lastReflectionWeek?: number;
}

export function createHouseguest(
  id: string,
  name: string, 
  age: number, 
  occupation: string, 
  hometown: string, 
  bio: string,
  imageUrl: string,
  traits: PersonalityTrait[],
  stats: Partial<HouseguestStats> = {},
  isPlayer: boolean = false
): Houseguest {
  // Apply trait boosts to stats
  const boostedStats = { ...stats };
  
  // For players, we use their exact stats (after trait boosts are applied in PlayerForm)
  // For NPCs, we generate random base stats and apply trait boosts
  if (!isPlayer) {
    // Generate base stats first
    const baseStats: HouseguestStats = {
      physical: stats.physical || Math.floor(Math.random() * 8) + 1, // 1-8 range
      mental: stats.mental || Math.floor(Math.random() * 8) + 1,
      endurance: stats.endurance || Math.floor(Math.random() * 8) + 1,
      social: stats.social || Math.floor(Math.random() * 8) + 1,
      luck: stats.luck || Math.floor(Math.random() * 8) + 1,
    };
    
    // Apply trait boosts for NPCs
    traits.forEach(trait => {
      const boost = TRAIT_STAT_BOOSTS[trait];
      baseStats[boost.primary] = Math.min(10, baseStats[boost.primary] + TRAIT_BOOST_VALUES.primary);
      baseStats[boost.secondary] = Math.min(10, baseStats[boost.secondary] + TRAIT_BOOST_VALUES.secondary);
    });
    
    Object.assign(boostedStats, baseStats);
  }

  // Generate initial goals based on personality traits
  const initialGoals: string[] = [];
  traits.forEach(trait => {
    // Get a random goal from this trait
    const traitGoals = TRAIT_GOALS[trait];
    if (traitGoals && traitGoals.length > 0) {
      const randomGoal = traitGoals[Math.floor(Math.random() * traitGoals.length)];
      initialGoals.push(randomGoal);
    }
  });

  return {
    id,
    name,
    age,
    occupation,
    hometown,
    bio,
    imageUrl,
    traits,
    stats: {
      physical: boostedStats.physical || Math.floor(Math.random() * 10) + 1,
      mental: boostedStats.mental || Math.floor(Math.random() * 10) + 1,
      endurance: boostedStats.endurance || Math.floor(Math.random() * 10) + 1,
      social: boostedStats.social || Math.floor(Math.random() * 10) + 1, 
      luck: boostedStats.luck || Math.floor(Math.random() * 10) + 1,
    },
    status: 'Active',
    isPlayer,
    isHoH: false,
    isPovHolder: false,
    isNominated: false,
    nominations: 0,
    competitionsWon: {
      hoh: 0,
      pov: 0,
      other: 0,
    },
    // Initial mood and stress are neutral/normal
    mood: 'Neutral',
    stressLevel: 'Normal',
    currentGoals: initialGoals,
    internalThoughts: [],
    lastReflectionWeek: 1
  };
}

// Function to calculate competition advantage based on traits and competition type
export function calculateCompetitionAdvantage(
  houseguest: Houseguest,
  competitionType: CompetitionType
): number {
  let advantage = 0;
  
  // Base advantage comes from the relevant stat
  switch(competitionType) {
    case 'Physical':
      advantage += houseguest.stats.physical;
      break;
    case 'Mental':
      advantage += houseguest.stats.mental;
      break;
    case 'Endurance':
      advantage += houseguest.stats.endurance;
      break;
    case 'Social':
      advantage += houseguest.stats.social;
      break;
    case 'Luck':
      advantage += houseguest.stats.luck;
      break;
  }
  
  // Additional bonus if houseguest has traits that align with the competition
  houseguest.traits.forEach(trait => {
    const boost = TRAIT_STAT_BOOSTS[trait];
    
    if ((competitionType === 'Physical' && boost.primary === 'physical') ||
        (competitionType === 'Mental' && boost.primary === 'mental') ||
        (competitionType === 'Endurance' && boost.primary === 'endurance') ||
        (competitionType === 'Social' && boost.primary === 'social') ||
        (competitionType === 'Luck' && boost.primary === 'luck')) {
      advantage += TRAIT_BOOST_VALUES.primary;
    }
  });

  // Factor in stress and mood
  if (houseguest.stressLevel === 'Stressed' || houseguest.stressLevel === 'Overwhelmed') {
    advantage -= 1; // Stress negatively affects performance
  } else if (houseguest.stressLevel === 'Relaxed') {
    advantage += 0.5; // Being relaxed gives a small boost
  }

  if (houseguest.mood === 'Happy') {
    advantage += 0.5; // Being happy gives a small boost
  } else if (houseguest.mood === 'Angry' || houseguest.mood === 'Upset') {
    advantage -= 0.5; // Negative mood slightly reduces performance
  }
  
  return advantage;
}

// Function to update a houseguest's mood and stress based on game events
export function updateHouseguestMentalState(
  houseguest: Houseguest, 
  event: 'nominated' | 'saved' | 'competition_win' | 'competition_loss' | 'ally_evicted' | 'enemy_evicted' | 'betrayed' | 'positive_interaction' | 'negative_interaction'
): void {
  // Scale of change depends on personality
  const emotionalMultiplier = houseguest.traits.includes('Emotional') ? 2 : 1;
  const analyticalResistance = houseguest.traits.includes('Analytical') ? 0.5 : 1;
  
  // Calculate the impact considering personality
  const impactFactor = emotionalMultiplier * analyticalResistance;
  
  // Current numerical values for mood and stress (for easier manipulation)
  const moodValues: Record<MoodType, number> = {
    'Happy': 2,
    'Content': 1,
    'Neutral': 0,
    'Upset': -1,
    'Angry': -2
  };
  
  const stressValues: Record<StressLevel, number> = {
    'Relaxed': -2,
    'Normal': -1,
    'Tense': 0,
    'Stressed': 1,
    'Overwhelmed': 2
  };
  
  // Get current values
  let currentMoodValue = moodValues[houseguest.mood];
  let currentStressValue = stressValues[houseguest.stressLevel];
  
  // Adjust based on event
  switch (event) {
    case 'nominated':
      currentMoodValue -= 1 * impactFactor;
      currentStressValue += 2 * impactFactor;
      break;
    case 'saved':
      currentMoodValue += 2 * impactFactor;
      currentStressValue -= 1 * impactFactor;
      break;
    case 'competition_win':
      currentMoodValue += 1 * impactFactor;
      currentStressValue -= 1 * impactFactor;
      break;
    case 'competition_loss':
      currentMoodValue -= 0.5 * impactFactor;
      currentStressValue += 0.5 * impactFactor;
      break;
    case 'ally_evicted':
      currentMoodValue -= 1.5 * impactFactor;
      currentStressValue += 0.5 * impactFactor;
      break;
    case 'enemy_evicted':
      currentMoodValue += 1 * impactFactor;
      currentStressValue -= 0.5 * impactFactor;
      break;
    case 'betrayed':
      currentMoodValue -= 2 * impactFactor;
      currentStressValue += 1 * impactFactor;
      break;
    case 'positive_interaction':
      currentMoodValue += 0.5 * impactFactor;
      currentStressValue -= 0.3 * impactFactor;
      break;
    case 'negative_interaction':
      currentMoodValue -= 0.5 * impactFactor;
      currentStressValue += 0.3 * impactFactor;
      break;
  }
  
  // Clamp values to valid ranges
  currentMoodValue = Math.max(-2, Math.min(2, currentMoodValue));
  currentStressValue = Math.max(-2, Math.min(2, currentStressValue));
  
  // Convert back to named states
  const moodEntries = Object.entries(moodValues);
  const stressEntries = Object.entries(stressValues);
  
  // Find the closest mood value
  const closestMood = moodEntries.reduce((prev, curr) => {
    return Math.abs(curr[1] - currentMoodValue) < Math.abs(prev[1] - currentMoodValue) ? curr : prev;
  });
  
  // Find the closest stress value
  const closestStress = stressEntries.reduce((prev, curr) => {
    return Math.abs(curr[1] - currentStressValue) < Math.abs(prev[1] - currentStressValue) ? curr : prev;
  });
  
  // Update the houseguest's mental state
  houseguest.mood = closestMood[0] as MoodType;
  houseguest.stressLevel = closestStress[0] as StressLevel;
}

// Generate a reflection for the houseguest based on their current game state
export function generateReflectionPrompt(houseguest: Houseguest, gameState: any): string {
  const traits = houseguest.traits.join(", ");
  const allies = extractAllies(houseguest, gameState);
  const threats = extractThreats(houseguest, gameState);
  const recentEvents = extractRecentEvents(houseguest, gameState);
  
  return `You are ${houseguest.name}, a houseguest in the Big Brother game with a ${traits} personality.
Week ${gameState.week} has just ${gameState.phase === 'SocialInteraction' ? 'started' : 'ended'}.

Your current status:
- Mood: ${houseguest.mood}
- Stress Level: ${houseguest.stressLevel}
- HoH: ${houseguest.isHoH ? 'Yes (you have power)' : 'No'}
- POV holder: ${houseguest.isPovHolder ? 'Yes' : 'No'}
- Nominated: ${houseguest.isNominated ? 'Yes (you are in danger)' : 'No'}
- Competitions won: HOH=${houseguest.competitionsWon.hoh}, POV=${houseguest.competitionsWon.pov}

Your current allies appear to be: ${allies.length > 0 ? allies.join(", ") : "none (you should form some alliances)"}
Your current threats appear to be: ${threats.length > 0 ? threats.join(", ") : "none identified yet"}

Recent important events:
${recentEvents.length > 0 ? recentEvents.join("\n") : "No significant events recently."}

Instructions:
Based on this information and your personality traits (${traits}), reflect on your current position in the game.
Consider what your immediate goals should be, who you should target, who you should align with, and what your game strategy should be.
Write in first-person as if you're thinking to yourself, feeling the emotions associated with your current mood (${houseguest.mood}) and stress level (${houseguest.stressLevel}).

Respond with ONLY a JSON object with:
1. "reflection": Your internal thoughts (3-5 sentences in first person)
2. "goals": An array of 2-3 specific goals you want to accomplish next
3. "strategy": Your overall approach going forward (1-2 sentences)`;
}

// Helper functions for generating reflection prompts
function extractAllies(houseguest: Houseguest, gameState: any): string[] {
  const allies: string[] = [];
  const relationships = gameState.relationships.get(houseguest.id);
  
  if (relationships) {
    relationships.forEach((rel: any, id: string) => {
      if (rel.score > 50 || rel.alliance) {
        const ally = gameState.houseguests.find((h: Houseguest) => h.id === id);
        if (ally && ally.status === 'Active') {
          allies.push(ally.name);
        }
      }
    });
  }
  
  return allies;
}

function extractThreats(houseguest: Houseguest, gameState: any): string[] {
  const threats: string[] = [];
  const relationships = gameState.relationships.get(houseguest.id);
  
  if (relationships) {
    // Consider very negative relationships as threats
    relationships.forEach((rel: any, id: string) => {
      if (rel.score < -30) {
        const threat = gameState.houseguests.find((h: Houseguest) => h.id === id);
        if (threat && threat.status === 'Active') {
          threats.push(threat.name);
        }
      }
    });
  }
  
  // Add competition threats if houseguest is competitive
  if (houseguest.traits.includes('Competitive')) {
    gameState.houseguests.forEach((h: Houseguest) => {
      if (h.id !== houseguest.id && h.status === 'Active' && 
         (h.competitionsWon.hoh > 0 || h.competitionsWon.pov > 0)) {
        if (!threats.includes(h.name)) {
          threats.push(h.name);
        }
      }
    });
  }
  
  return threats;
}

function extractRecentEvents(houseguest: Houseguest, gameState: any): string[] {
  const recentEvents: string[] = [];
  
  // Check for recent nominations
  if (houseguest.isNominated) {
    const hoh = gameState.houseguests.find((h: Houseguest) => h.isHoH);
    if (hoh) {
      recentEvents.push(`You were nominated by ${hoh.name}.`);
    }
  }
  
  // Check for recent competition wins
  const recentGameLog = gameState.gameLog
    .filter((event: any) => event.week === gameState.week && event.involvedHouseguests.includes(houseguest.id))
    .slice(-5);
  
  recentGameLog.forEach((event: any) => {
    if (event.type === 'competition' && event.description.includes(houseguest.name + ' won')) {
      recentEvents.push(event.description);
    }
    else if (event.type === 'nomination' && event.description.includes(houseguest.name)) {
      recentEvents.push(event.description);
    }
    else if (event.type === 'veto' && event.description.includes(houseguest.name)) {
      recentEvents.push(event.description);
    }
    else if (event.type === 'social' && event.description.includes(houseguest.name)) {
      recentEvents.push(event.description);
    }
  });
  
  return recentEvents;
}
