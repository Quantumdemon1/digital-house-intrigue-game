
import { PersonalityTrait, HouseguestStats } from '@/models/houseguest';

export interface PlayerFormData {
  playerName: string;
  playerAge: number;
  playerBio: string;
  playerHometown: string;
  playerOccupation: string;
  selectedTraits: PersonalityTrait[];
  stats: HouseguestStats;
  remainingPoints: number;
  houseguestCount: number;
  avatarUrl?: string;      // Selected or generated avatar URL
  templateId?: string;      // ID of selected character template
}
