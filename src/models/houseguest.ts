
/**
 * @file models/houseguest.ts
 * @description Definition of a Big Brother houseguest
 */

import { v4 as uuidv4 } from 'uuid';

// Houseguest Status
export type HouseguestStatus = 'Active' | 'Evicted' | 'Jury' | 'Winner' | 'Runner-Up';

// Basic types
export type PersonalityTrait = 
  | 'Competitive' | 'Strategic' | 'Loyal' | 'Emotional' | 'Funny'
  | 'Charming' | 'Manipulative' | 'Analytical' | 'Impulsive' | 'Deceptive'
  | 'Social' | 'Introverted' | 'Stubborn' | 'Flexible' | 'Intuitive'
  | 'Sneaky' | 'Confrontational';

// Competition types
export type CompetitionType = 'physical' | 'mental' | 'endurance' | 'social' | 'luck';

// Mental state types
export type MoodType = 'Happy' | 'Content' | 'Neutral' | 'Upset' | 'Angry';
export type StressLevelType = 'Relaxed' | 'Normal' | 'Tense' | 'Stressed' | 'Overwhelmed';

// Stat boost structure for personality traits
export interface StatBoost {
  primary: keyof HouseguestStats;
  secondary: keyof HouseguestStats;
}

// Mapping of traits to their stat boosts
export const TRAIT_STAT_BOOSTS: Record<PersonalityTrait, StatBoost> = {
  'Competitive': { primary: 'physical', secondary: 'endurance' },
  'Strategic': { primary: 'mental', secondary: 'strategic' },
  'Loyal': { primary: 'loyalty', secondary: 'social' },
  'Emotional': { primary: 'social', secondary: 'loyalty' },
  'Funny': { primary: 'social', secondary: 'mental' },
  'Charming': { primary: 'social', secondary: 'strategic' },
  'Manipulative': { primary: 'strategic', secondary: 'mental' },
  'Analytical': { primary: 'mental', secondary: 'strategic' },
  'Impulsive': { primary: 'physical', secondary: 'endurance' },
  'Deceptive': { primary: 'strategic', secondary: 'social' },
  'Social': { primary: 'social', secondary: 'luck' },
  'Introverted': { primary: 'mental', secondary: 'loyalty' },
  'Stubborn': { primary: 'endurance', secondary: 'physical' },
  'Flexible': { primary: 'strategic', secondary: 'mental' },
  'Intuitive': { primary: 'mental', secondary: 'luck' },
  'Sneaky': { primary: 'strategic', secondary: 'mental' },
  'Confrontational': { primary: 'social', secondary: 'endurance' }
};

// Boost values for primary and secondary stats
export const TRAIT_BOOST_VALUES = {
  primary: 2,
  secondary: 1
};

// Define the nomination count interface separately
export interface NominationCount {
  times: number;
  receivedOn: number[];
}

// Houseguest stats - fixing the nominations property to be optional and correctly typed
export interface HouseguestStats {
  physical: number;
  mental: number;
  endurance: number;
  social: number;
  luck: number;
  competition: number;
  strategic: number;
  loyalty: number;
  nominations?: NominationCount;
}

// Houseguest competition stats
export interface CompetitionStats {
  hoh: number;
  pov: number;
  other: number;
}

// Mental state interface for AI integration
export interface MentalState {
  feelings: {
    [houseguestId: string]: {
      sentiment: number; // -1 to 1 scale
      notes: string[];
    }
  };
  goals: string[];
  memories: {
    general: string[]; // General memories about the game
    aboutPlayers: {
      [houseguestId: string]: string[]; // Memories about specific players
    };
  };
  reflections: string[]; // Internal monologue/thoughts
}

// Main houseguest interface
export interface Houseguest {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  bio: string;
  isPlayer: boolean;
  status: HouseguestStatus;
  stats: HouseguestStats;
  traits: PersonalityTrait[];
  
  // Competition status
  isHoH: boolean;
  isPovHolder: boolean;
  isNominated: boolean;
  
  // Competition history
  competitionsWon: CompetitionStats;
  nominations: NominationCount;
  timesVetoed: number;
  
  // Visual representation
  imageUrl?: string;
  avatarUrl?: string;
  
  // Advanced state for AI
  mentalState?: MentalState;

  // Mental state properties
  mood?: MoodType;
  stressLevel?: StressLevelType;
  currentGoals?: string[];
  internalThoughts?: string[];
  lastReflectionWeek?: number;
}

/**
 * Creates a new houseguest
 */
export function createHouseguest(
  id: string,
  name: string,
  age: number = 25,
  occupation: string = "",
  hometown: string = "",
  bio: string = "",
  imageUrl: string = "",
  traits: PersonalityTrait[] = [],
  statsOverrides: Partial<HouseguestStats> = {},
  isPlayer: boolean = false
): Houseguest {
  // Generate base stats (1-10 scale)
  const baseStats: HouseguestStats = {
    physical: Math.floor(Math.random() * 5) + 3, // 3-7
    mental: Math.floor(Math.random() * 5) + 3, // 3-7
    endurance: Math.floor(Math.random() * 5) + 3, // 3-7
    social: Math.floor(Math.random() * 5) + 3, // 3-7
    luck: Math.floor(Math.random() * 5) + 3, // 3-7
    competition: Math.floor(Math.random() * 5) + 3, // 3-7
    strategic: Math.floor(Math.random() * 5) + 3, // 3-7
    loyalty: Math.floor(Math.random() * 5) + 3, // 3-7
  };
  
  // Apply trait boosts to stats
  for (const trait of traits) {
    if (TRAIT_STAT_BOOSTS[trait]) {
      const { primary, secondary } = TRAIT_STAT_BOOSTS[trait];
      // Skip if primary/secondary is 'nominations'
      if (primary !== 'nominations' && typeof baseStats[primary] === 'number') {
        baseStats[primary] = Math.min(10, (baseStats[primary] as number) + TRAIT_BOOST_VALUES.primary);
      }
      if (secondary !== 'nominations' && typeof baseStats[secondary] === 'number') {
        baseStats[secondary] = Math.min(10, (baseStats[secondary] as number) + TRAIT_BOOST_VALUES.secondary);
      }
    }
  }
  
  // Apply any stat overrides
  const stats = { ...baseStats, ...statsOverrides };
  
  return {
    id: id || uuidv4(),
    name,
    age,
    occupation,
    hometown,
    bio,
    isPlayer,
    status: 'Active',
    stats,
    traits,
    isHoH: false,
    isPovHolder: false,
    isNominated: false,
    competitionsWon: { hoh: 0, pov: 0, other: 0 },
    nominations: { times: 0, receivedOn: [] }, // Always initialize as a proper object
    timesVetoed: 0,
    imageUrl,
    avatarUrl: imageUrl, // Set avatarUrl to the same as imageUrl initially
    mentalState: {
      feelings: {},
      goals: [],
      memories: { 
        general: [], 
        aboutPlayers: {} 
      },
      reflections: []
    },
    // Initialize mental state properties
    mood: 'Neutral',
    stressLevel: 'Normal',
    currentGoals: [],
    internalThoughts: [],
    lastReflectionWeek: 0
  };
}

/**
 * Calculate advantage in competitions based on houseguest stats
 */
export function calculateCompetitionAdvantage(
  houseguest: Houseguest, 
  competitionType: CompetitionType
): number {
  const { stats } = houseguest;
  let advantage = stats[competitionType];
  
  // Add a small boost from competition stat
  advantage += stats.competition * 0.2;
  
  // Add random factor (luck)
  advantage += stats.luck * Math.random() * 0.3;
  
  return advantage;
}

/**
 * Generate a reflection prompt for AI
 */
export function generateReflectionPrompt(
  houseguest: Houseguest,
  game: any // Game state reference
): string {
  // Get alliances that the houseguest is part of - safe check if allianceSystem exists
  const alliances = game.allianceSystem ? 
    game.allianceSystem.getAllAlliances().filter(alliance => 
      alliance.members.includes(houseguest.id)
    ) : [];
  
  // Generate base prompt
  let prompt = `You are ${houseguest.name}, a ${houseguest.age}-year-old ${houseguest.occupation} from ${houseguest.hometown}. `;
  
  // Add personality traits
  prompt += `Your personality traits are: ${houseguest.traits.join(', ')}. `;
  
  // Add alliance information
  if (alliances.length > 0) {
    prompt += `You are in ${alliances.length} alliance(s): ${alliances.map(a => a.name).join(', ')}. `;
  } else {
    prompt += `You are not currently in any alliances. `;
  }
  
  // Add current game status
  prompt += `It is currently week ${game.week}, and ${game.phase}. `;
  
  // Add mental state
  prompt += `You are feeling ${houseguest.mood || 'Neutral'} and your stress level is ${houseguest.stressLevel || 'Normal'}. `;
  
  // Add any internal thoughts if available
  if (houseguest.internalThoughts && houseguest.internalThoughts.length > 0) {
    prompt += `One of your recent thoughts was: "${houseguest.internalThoughts[houseguest.internalThoughts.length - 1]}". `;
  }
  
  // Add reflection request
  prompt += `Based on your personality and game position, what are your thoughts about this situation? Provide your response as structured JSON with the following format: 
  {
    "reflection": "Your internal monologue and thoughts about the current game situation",
    "goals": ["Goal 1", "Goal 2", "Goal 3"],
    "strategy": "Your strategy moving forward in the game"
  }`;
  
  return prompt;
}

/**
 * Updates a houseguest's mental state based on game events
 */
export function updateHouseguestMentalState(
  houseguest: Houseguest,
  event: 'nominated' | 'saved' | 'competition_win' | 'competition_loss' | 'ally_evicted' | 
        'enemy_evicted' | 'betrayed' | 'positive_interaction' | 'negative_interaction'
): void {
  // Initialize mood and stress level if they don't exist
  if (!houseguest.mood) houseguest.mood = 'Neutral';
  if (!houseguest.stressLevel) houseguest.stressLevel = 'Normal';
  
  const moodLevels: MoodType[] = ['Angry', 'Upset', 'Neutral', 'Content', 'Happy'];
  const stressLevels: StressLevelType[] = ['Relaxed', 'Normal', 'Tense', 'Stressed', 'Overwhelmed'];
  
  // Get current indices
  let moodIndex = moodLevels.indexOf(houseguest.mood);
  let stressIndex = stressLevels.indexOf(houseguest.stressLevel);
  
  // Update based on event
  switch(event) {
    case 'nominated':
      moodIndex = Math.max(0, moodIndex - 2); // Much worse mood
      stressIndex = Math.min(stressLevels.length - 1, stressIndex + 2); // Much more stress
      break;
    case 'saved':
      moodIndex = Math.min(moodLevels.length - 1, moodIndex + 2); // Much better mood
      stressIndex = Math.max(0, stressIndex - 2); // Much less stress
      break;
    case 'competition_win':
      moodIndex = Math.min(moodLevels.length - 1, moodIndex + 1); // Better mood
      // Stress can go either way depending on the competition
      if (Math.random() > 0.5) {
        stressIndex = Math.max(0, stressIndex - 1); // Less stress
      }
      break;
    case 'competition_loss':
      moodIndex = Math.max(0, moodIndex - 1); // Worse mood
      // Stress often increases after a loss
      stressIndex = Math.min(stressLevels.length - 1, stressIndex + 1);
      break;
    case 'ally_evicted':
      moodIndex = Math.max(0, moodIndex - 1); // Worse mood
      stressIndex = Math.min(stressLevels.length - 1, stressIndex + 1); // More stress
      break;
    case 'enemy_evicted':
      moodIndex = Math.min(moodLevels.length - 1, moodIndex + 1); // Better mood
      stressIndex = Math.max(0, stressIndex - 1); // Less stress
      break;
    case 'betrayed':
      moodIndex = Math.max(0, moodIndex - 2); // Much worse mood
      stressIndex = Math.min(stressLevels.length - 1, stressIndex + 1); // More stress
      break;
    case 'positive_interaction':
      moodIndex = Math.min(moodLevels.length - 1, moodIndex + 1); // Better mood
      if (houseguest.stressLevel !== 'Relaxed') {
        stressIndex = Math.max(0, stressIndex - 1); // Slightly less stress
      }
      break;
    case 'negative_interaction':
      moodIndex = Math.max(0, moodIndex - 1); // Worse mood
      if (houseguest.stressLevel !== 'Overwhelmed') {
        stressIndex = Math.min(stressLevels.length - 1, stressIndex + 1); // Slightly more stress
      }
      break;
  }
  
  // Update houseguest mood and stress
  houseguest.mood = moodLevels[moodIndex];
  houseguest.stressLevel = stressLevels[stressIndex];
  
  // Add to internal thoughts based on the event
  if (!houseguest.internalThoughts) {
    houseguest.internalThoughts = [];
  }
  
  // Generate a thought based on the event
  let thought = "";
  switch(event) {
    case 'nominated':
      thought = "I've been nominated. I need to win the veto or campaign hard to stay in the game.";
      break;
    case 'saved':
      thought = "I was saved from the block! I'm so relieved, but I need to be careful going forward.";
      break;
    case 'competition_win':
      thought = "Winning this competition feels great. I need to use this power wisely.";
      break;
    case 'competition_loss':
      thought = "I lost the competition. I need to rely on my social game now.";
      break;
    case 'ally_evicted':
      thought = "Losing an ally is tough. I need to reposition myself in the house.";
      break;
    case 'enemy_evicted':
      thought = "Good riddance! One less person coming after me in the game.";
      break;
    case 'betrayed':
      thought = "I trusted them and they stabbed me in the back. I won't forget this.";
      break;
    case 'positive_interaction':
      thought = "That conversation went well. I might have a new potential ally.";
      break;
    case 'negative_interaction':
      thought = "That didn't go as planned. I need to be careful around them.";
      break;
  }
  
  // Add the thought to internal thoughts
  houseguest.internalThoughts.push(thought);
  
  // Cap internal thoughts at 10 entries
  if (houseguest.internalThoughts.length > 10) {
    houseguest.internalThoughts = houseguest.internalThoughts.slice(-10);
  }
}
