
import { ReactNode } from 'react';
import { PersonalityTrait } from '@/models/houseguest';

export interface InteractionOption {
  id: string;
  text: string;
  responseText: string;
  relationshipChange: number;
  icon: ReactNode;
  successChance?: number;
  requiredSocialStat?: number; // Minimum social stat required for successful outcome
  compatibleTraits?: PersonalityTrait[]; // Traits that respond well to this interaction
  incompatibleTraits?: PersonalityTrait[]; // Traits that respond poorly to this interaction
}
