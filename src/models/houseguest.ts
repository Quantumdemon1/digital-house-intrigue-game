
import { v4 as uuidv4 } from 'uuid';
import type { BigBrotherGame } from './BigBrotherGame';

export type HouseguestStatus = 'Active' | 'Evicted' | 'Jury';

export interface HouseguestStats {
  competition: number; // 1-10 scale
  social: number;      // 1-10 scale
  strategic: number;   // 1-10 scale
  loyalty: number;     // 1-10 scale
  physical: number;    // 1-10 scale
  mental: number;      // 1-10 scale
  endurance: number;   // 1-10 scale
  luck: number;        // 1-10 scale
}

export type CompetitionType = 'Physical' | 'Mental' | 'Endurance' | 'Social' | 'Luck';

export type PersonalityTrait = 
  | 'Strategic' 
  | 'Social' 
  | 'Competitive' 
  | 'Loyal'
  | 'Sneaky' 
  | 'Confrontational' 
  | 'Emotional' 
  | 'Analytical';

// Trait to stat boost mappings
export interface StatBoost {
  primary: keyof HouseguestStats;
  secondary: keyof HouseguestStats;
}

// Define how traits affect stats
export const TRAIT_STAT_BOOSTS: Record<PersonalityTrait, StatBoost> = {
  'Strategic': { primary: 'strategic', secondary: 'mental' },
  'Social': { primary: 'social', secondary: 'luck' },
  'Competitive': { primary: 'competition', secondary: 'physical' },
  'Loyal': { primary: 'loyalty', secondary: 'social' },
  'Sneaky': { primary: 'strategic', secondary: 'social' },
  'Confrontational': { primary: 'competition', secondary: 'physical' },
  'Emotional': { primary: 'social', secondary: 'luck' },
  'Analytical': { primary: 'mental', secondary: 'strategic' }
};

export const TRAIT_BOOST_VALUES = {
  primary: 2,
  secondary: 1
};

// Define mood and stress level types
export type HouseguestMood = 'Happy' | 'Content' | 'Neutral' | 'Upset' | 'Angry';
export type HouseguestStressLevel = 'Relaxed' | 'Normal' | 'Tense' | 'Stressed' | 'Overwhelmed';

export interface Houseguest {
  id: string;
  name: string;
  isPlayer: boolean;
  status: HouseguestStatus;
  avatarUrl?: string;
  stats: HouseguestStats;
  traits: PersonalityTrait[];
  isHoH: boolean;
  isPovHolder: boolean;
  isNominated: boolean;
  votedBy?: string[];  // IDs of houseguests who voted for this person
  age?: number;
  occupation?: string;
  hometown?: string;
  bio?: string;
  competitionsWon?: {
    hoh: number;
    pov: number;
  };
  nominations?: {
    times: number;
    receivedOn: number[];
  };
  
  // Mental state properties
  mood?: HouseguestMood;
  stressLevel?: HouseguestStressLevel;
  internalThoughts?: string[];
  currentGoals?: string[];
  lastReflectionWeek?: number;
}

// Create a new houseguest with default values
export function createHouseguest(name: string, isPlayer: boolean = false): Houseguest {
  return {
    id: uuidv4(),
    name,
    isPlayer,
    status: 'Active',
    avatarUrl: '',
    stats: {
      competition: 5 + Math.floor(Math.random() * 5),
      social: 5 + Math.floor(Math.random() * 5),
      strategic: 5 + Math.floor(Math.random() * 5),
      loyalty: 4 + Math.floor(Math.random() * 6),
      physical: 5 + Math.floor(Math.random() * 5),
      mental: 5 + Math.floor(Math.random() * 5),
      endurance: 5 + Math.floor(Math.random() * 5),
      luck: 5 + Math.floor(Math.random() * 5)
    },
    traits: [],
    isHoH: false,
    isPovHolder: false,
    isNominated: false,
    competitionsWon: {
      hoh: 0,
      pov: 0
    },
    nominations: {
      times: 0,
      receivedOn: []
    },
    mood: 'Neutral',
    stressLevel: 'Normal',
    internalThoughts: [],
    currentGoals: []
  };
}

// Assign random traits to a houseguest
export function assignRandomTraits(houseguest: Houseguest, possibleTraits: PersonalityTrait[], count: number = 3): void {
  // Shuffle array
  const shuffled = [...possibleTraits].sort(() => 0.5 - Math.random());
  // Get first n elements
  houseguest.traits = shuffled.slice(0, count);
}

// Calculate advantage in competition based on houseguest traits
export function calculateCompetitionAdvantage(houseguest: Houseguest, competitionType: CompetitionType): number {
  let advantage = 0;
  
  // Check for trait-based advantages
  for (const trait of houseguest.traits) {
    switch (trait) {
      case 'Competitive':
        // Competitive gives advantage in Physical and Endurance
        if (competitionType === 'Physical') advantage += 1.5;
        if (competitionType === 'Endurance') advantage += 1;
        break;
      case 'Analytical':
        // Analytical gives advantage in Mental
        if (competitionType === 'Mental') advantage += 2;
        break;
      case 'Social':
        // Social gives advantage in Social comps
        if (competitionType === 'Social') advantage += 2;
        break;
      case 'Sneaky':
        // Sneaky gives slight advantage in Mental and Social
        if (competitionType === 'Mental') advantage += 0.5;
        if (competitionType === 'Social') advantage += 0.5;
        break;
      case 'Strategic':
        // Strategic gives advantage in Mental and slight in others
        if (competitionType === 'Mental') advantage += 1;
        if (competitionType !== 'Mental') advantage += 0.3; 
        break;
      // Other traits don't directly affect competition performance
    }
  }
  
  // Return the calculated advantage
  return advantage;
}

// Update a houseguest's mental state based on a game event
export function updateHouseguestMentalState(
  houseguest: Houseguest,
  event: 'nominated' | 'saved' | 'competition_win' | 'competition_loss' | 'ally_evicted' | 'enemy_evicted' | 'betrayed' | 'positive_interaction' | 'negative_interaction'
): void {
  // Initialize mental state properties if they don't exist
  if (!houseguest.mood) houseguest.mood = 'Neutral';
  if (!houseguest.stressLevel) houseguest.stressLevel = 'Normal';
  if (!houseguest.internalThoughts) houseguest.internalThoughts = [];
  
  // Define mood levels and stress levels for transitions
  const moodLevels: HouseguestMood[] = ['Angry', 'Upset', 'Neutral', 'Content', 'Happy'];
  const stressLevels: HouseguestStressLevel[] = ['Relaxed', 'Normal', 'Tense', 'Stressed', 'Overwhelmed'];
  
  // Get current index
  const currentMoodIndex = moodLevels.indexOf(houseguest.mood);
  const currentStressIndex = stressLevels.indexOf(houseguest.stressLevel);
  
  // Update based on event
  let moodChange = 0;
  let stressChange = 0;
  let thought = '';
  
  switch (event) {
    case 'nominated':
      moodChange = -2;
      stressChange = 2;
      thought = "Being nominated is stressful. I need to figure out how to stay in this game.";
      break;
    case 'saved':
      moodChange = 2;
      stressChange = -1;
      thought = "What a relief to be saved! I need to build on this momentum.";
      break;
    case 'competition_win':
      moodChange = 2;
      stressChange = -1;
      thought = "Winning feels amazing! This gives me more control in the game.";
      break;
    case 'competition_loss':
      moodChange = -1;
      stressChange = 1;
      thought = "Losing is frustrating. I need to find other ways to stay safe.";
      break;
    case 'ally_evicted':
      moodChange = -2;
      stressChange = 1;
      thought = "Losing an ally makes me vulnerable. I need to adapt my strategy.";
      break;
    case 'enemy_evicted':
      moodChange = 1;
      stressChange = -1;
      thought = "Having a threat removed is good for my game. I can breathe a little easier.";
      break;
    case 'betrayed':
      moodChange = -2;
      stressChange = 2;
      thought = "Being betrayed hurts. I won't forget this, and I'll be more careful with trust.";
      break;
    case 'positive_interaction':
      moodChange = 1;
      stressChange = -1;
      thought = "It's good to build connections in this house. This could help my game.";
      break;
    case 'negative_interaction':
      moodChange = -1;
      stressChange = 1;
      thought = "That interaction didn't go well. I need to be careful about house dynamics.";
      break;
  }
  
  // Apply personality trait modifiers
  if (houseguest.traits.includes('Emotional')) {
    moodChange *= 1.5; // Emotional houseguests have stronger mood swings
  }
  
  if (houseguest.traits.includes('Strategic')) {
    stressChange *= 0.7; // Strategic houseguests handle stress better
  }
  
  // Calculate new indices with bounds checking
  const newMoodIndex = Math.max(0, Math.min(moodLevels.length - 1, currentMoodIndex + moodChange));
  const newStressIndex = Math.max(0, Math.min(stressLevels.length - 1, currentStressIndex + stressChange));
  
  // Update houseguest
  houseguest.mood = moodLevels[newMoodIndex];
  houseguest.stressLevel = stressLevels[newStressIndex];
  
  // Add thought if it would change
  if (thought && houseguest.internalThoughts) {
    houseguest.internalThoughts.push(thought);
    
    // Cap internal thoughts at a reasonable number
    if (houseguest.internalThoughts.length > 10) {
      houseguest.internalThoughts = houseguest.internalThoughts.slice(-10);
    }
  }
}

// Generate a reflection prompt for an AI houseguest
export function generateReflectionPrompt(houseguest: Houseguest, game: BigBrotherGame): string {
  const activeHouseguests = game.getActiveHouseguests();
  const week = game.week;
  const phase = game.phase;
  const isNominated = houseguest.isNominated;
  const isHoH = houseguest.isHoH;
  const isPov = houseguest.isPovHolder;
  const traits = houseguest.traits.join(', ');
  const mood = houseguest.mood || 'Neutral';
  const stressLevel = houseguest.stressLevel || 'Normal';
  
  // Get relationship information
  let relationshipContext = "";
  if (game.relationshipSystem) {
    // Find strongest positive relationships
    const allies = activeHouseguests
      .filter(hg => hg.id !== houseguest.id)
      .map(hg => {
        const score = game.relationshipSystem.getRelationship(houseguest.id, hg.id);
        return { name: hg.name, score };
      })
      .filter(rel => rel.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(ally => `${ally.name} (${ally.score})`)
      .join(', ');
    
    // Find strongest negative relationships
    const enemies = activeHouseguests
      .filter(hg => hg.id !== houseguest.id)
      .map(hg => {
        const score = game.relationshipSystem.getRelationship(houseguest.id, hg.id);
        return { name: hg.name, score };
      })
      .filter(rel => rel.score < -20)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(enemy => `${enemy.name} (${enemy.score})`)
      .join(', ');
    
    relationshipContext = `
Closest allies: ${allies || "None significant"}
Strongest enemies/rivals: ${enemies || "None significant"}
`;
  }
  
  // Get alliance information
  let allianceContext = "";
  if (game.allianceSystem) {
    const alliances = game.allianceSystem.getAlliances().filter(
      alliance => alliance.members.includes(houseguest.id)
    );
    
    if (alliances.length > 0) {
      allianceContext = `
You are in the following alliances:
${alliances.map(a => `- ${a.name} (Members: ${a.members.map(id => {
  const member = game.getHouseguestById(id);
  return member ? member.name : "Unknown";
}).join(", ")}, Stability: ${a.stability}/100)`).join("\n")}
`;
    } else {
      allianceContext = "\nYou are not currently in any alliances.";
    }
  }
  
  // Build the prompt
  return `You are roleplaying as ${houseguest.name}, a houseguest on Big Brother.

## Your Current Status:
- Week: ${week}
- Game Phase: ${phase}
- You are${isNominated ? " currently nominated for eviction." : " not currently nominated."}
- You are${isHoH ? " the current Head of Household." : " not the Head of Household."}
- You are${isPov ? " the current Power of Veto holder." : " not holding the Power of Veto."}
- Your personality traits: ${traits}
- Current mood: ${mood}
- Current stress level: ${stressLevel}

## Game Context:
- There are ${activeHouseguests.length} houseguests remaining.
- HoH: ${game.hohWinner ? game.hohWinner.name : "Not yet determined"}
- PoV holder: ${game.povWinner ? game.povWinner.name : "Not yet determined"}
- Nominees: ${game.nominees && game.nominees.length > 0 ? game.nominees.map(n => n.name).join(", ") : "None yet"}
${relationshipContext}
${allianceContext}

## Reflection Task:
Based on your personality, current game position, and relationships, provide a JSON response with the following:
1. A realistic inner reflection on your current game situation (200-300 characters)
2. Your top 3 goals moving forward in bullet points
3. Your strategic approach for the next few days (100-200 characters)

Response format:
{
  "reflection": "your internal thoughts about your current situation",
  "goals": ["goal 1", "goal 2", "goal 3"],
  "strategy": "your strategic approach moving forward"
}

Remember to stay in character based on your personality traits and current situation.`;
}
