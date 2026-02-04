import { PersonalityTrait, HouseguestStats } from '@/models/houseguest';
import { Avatar3DConfig } from '@/models/avatar-config';

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
  avatarUrl?: string;         // Selected or generated avatar URL
  templateId?: string;        // ID of selected character template
  avatarConfig?: Avatar3DConfig; // 3D avatar configuration
}
