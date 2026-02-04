
/**
 * @file models/houseguest/model.ts
 * @description Core houseguest model definition
 */

import { 
  HouseguestStatus, 
  PersonalityTrait, 
  CompetitionStats, 
  HouseguestStats, 
  MentalState,
  MoodType,
  StressLevelType,
  NominationCount,
  Avatar3DConfig
} from './types';

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
  avatarConfig?: Avatar3DConfig; // 3D avatar configuration
  
  // Advanced state for AI
  mentalState?: MentalState;

  // Mental state properties
  mood?: MoodType;
  stressLevel?: StressLevelType;
  currentGoals?: string[];
  internalThoughts?: string[];
  lastReflectionWeek?: number;
}
