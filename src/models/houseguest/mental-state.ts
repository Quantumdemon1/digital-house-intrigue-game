
/**
 * @file models/houseguest/mental-state.ts
 * @description Mental state tracking for houseguests
 */

import { MoodType, StressLevelType } from './types';
import type { Houseguest } from './model';
import type { BigBrotherGame } from '../game/BigBrotherGame';

// Mental state model for houseguests
export interface MentalState {
  mood: MoodType;
  stressLevel: StressLevelType;
  currentGoals: string[];
  internalThoughts: string[];
  lastReflectionWeek: number;
}

// Create a default mental state for new houseguests
export function createDefaultMentalState(): MentalState {
  return {
    mood: 'Neutral',
    stressLevel: 'Normal',
    currentGoals: ['Survive the first week'],
    internalThoughts: ['I need to make some allies'],
    lastReflectionWeek: 0
  };
}

/**
 * Updates a houseguest's mental state based on game events
 */
export function updateHouseguestMentalState(
  houseguest: Houseguest,
  event: 'nominated' | 'saved' | 'competition_win' | 'competition_loss' | 'ally_evicted' | 'enemy_evicted' | 'betrayed' | 'positive_interaction' | 'negative_interaction'
): void {
  // Set default values if not present
  houseguest.mood = houseguest.mood || 'Neutral';
  houseguest.stressLevel = houseguest.stressLevel || 'Normal';
  
  // Apply event-specific changes
  switch (event) {
    case 'nominated':
      shiftMood(houseguest, -2);
      increaseStress(houseguest, 2);
      break;
    case 'saved':
      shiftMood(houseguest, 2);
      decreaseStress(houseguest, 1);
      break;
    case 'competition_win':
      shiftMood(houseguest, 2);
      decreaseStress(houseguest, 1);
      break;
    case 'competition_loss':
      shiftMood(houseguest, -1);
      increaseStress(houseguest, 1);
      break;
    case 'ally_evicted':
      shiftMood(houseguest, -2);
      increaseStress(houseguest, 1);
      break;
    case 'enemy_evicted':
      shiftMood(houseguest, 1);
      decreaseStress(houseguest, 1);
      break;
    case 'betrayed':
      shiftMood(houseguest, -2);
      increaseStress(houseguest, 2);
      break;
    case 'positive_interaction':
      shiftMood(houseguest, 1);
      break;
    case 'negative_interaction':
      shiftMood(houseguest, -1);
      increaseStress(houseguest, 1);
      break;
  }
}

/**
 * Generates a reflection prompt for houseguests
 */
export function generateReflectionPrompt(houseguest: Houseguest, game: BigBrotherGame): string {
  const week = game.week;
  const phase = game.phase;
  const isHoH = houseguest.isHoH;
  const isNominated = houseguest.isNominated;
  const isPov = houseguest.isPovHolder;
  
  return `
You are ${houseguest.name}, a houseguest on Big Brother. It's week ${week}, and you're currently in the ${phase} phase.
${isHoH ? "You are the current Head of Household." : ""}
${isNominated ? "You are currently nominated for eviction." : ""}
${isPov ? "You hold the Power of Veto this week." : ""}

Your personality traits are: ${houseguest.traits.join(", ")}
Your current mood is ${houseguest.mood} and your stress level is ${houseguest.stressLevel}.
${houseguest.currentGoals && houseguest.currentGoals.length > 0 ? `Your current goals are: ${houseguest.currentGoals.join(", ")}` : ""}

Please reflect on your current situation in the house and provide:
1. A reflection on your current game position (1-2 paragraphs)
2. Updated goals for the coming week (2-4 goals)
3. Your strategic approach moving forward (1 paragraph)

Format your response as a JSON object like this:
{
  "reflection": "Your reflection here...",
  "goals": ["Goal 1", "Goal 2", ...],
  "strategy": "Your strategic approach..."
}
`;
}

// Helper functions for mental state updates
function shiftMood(houseguest: Houseguest, amount: number): void {
  const moodOrder: MoodType[] = ['Angry', 'Upset', 'Neutral', 'Content', 'Happy'];
  
  // Find current mood index
  const currentIndex = moodOrder.indexOf(houseguest.mood as MoodType);
  
  // Calculate new index with bounds checking
  const newIndex = Math.max(0, Math.min(moodOrder.length - 1, currentIndex + amount));
  
  // Update mood
  houseguest.mood = moodOrder[newIndex];
}

function increaseStress(houseguest: Houseguest, amount: number): void {
  const stressOrder: StressLevelType[] = ['Relaxed', 'Normal', 'Tense', 'Stressed', 'Overwhelmed'];
  
  // Find current stress index
  const currentIndex = stressOrder.indexOf(houseguest.stressLevel as StressLevelType);
  
  // Calculate new index with bounds checking (can only go up)
  const newIndex = Math.min(stressOrder.length - 1, currentIndex + amount);
  
  // Update stress level
  houseguest.stressLevel = stressOrder[newIndex];
}

function decreaseStress(houseguest: Houseguest, amount: number): void {
  const stressOrder: StressLevelType[] = ['Relaxed', 'Normal', 'Tense', 'Stressed', 'Overwhelmed'];
  
  // Find current stress index
  const currentIndex = stressOrder.indexOf(houseguest.stressLevel as StressLevelType);
  
  // Calculate new index with bounds checking (can only go down)
  const newIndex = Math.max(0, currentIndex - amount);
  
  // Update stress level
  houseguest.stressLevel = stressOrder[newIndex];
}
