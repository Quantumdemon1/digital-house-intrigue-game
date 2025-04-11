
/**
 * @file models/houseguest/mental-state.ts
 * @description Mental state tracking for houseguests
 */

import { MoodType, StressLevelType } from './types';

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
