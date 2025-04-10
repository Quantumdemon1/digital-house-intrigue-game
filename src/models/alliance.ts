
import type { Houseguest } from './houseguest';

export type AllianceStatus = 'Active' | 'Broken' | 'Exposed';

export interface Alliance {
  id: string;
  name: string;
  members: Houseguest[];
  founder: Houseguest;
  createdOnWeek: number;
  status: AllianceStatus;
  stability: number; // 0-100, how likely the alliance is to stay together
  isPublic: boolean; // Whether other houseguests know about this alliance
}

export function createAlliance(
  id: string,
  name: string,
  members: Houseguest[],
  founder: Houseguest,
  currentWeek: number
): Alliance {
  return {
    id,
    name,
    members,
    founder,
    createdOnWeek: currentWeek,
    status: 'Active',
    stability: 80, // Start with high stability
    isPublic: false,
  };
}
