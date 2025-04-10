
import { PersonalityTrait, HouseguestStats } from '@/models/houseguest';

export interface PlayerFormData {
  playerName: string;
  playerAge: number;
  playerBio: string;
  playerHometown: string;
  playerOccupation: string;
  selectedTraits: PersonalityTrait[];
  stats: HouseguestStats;
  houseguestCount: number;
}
