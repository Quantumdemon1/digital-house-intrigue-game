
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
  lastMeetingWeek?: number; // The last week when this alliance had a meeting
}

export function createAlliance(
  id: string,
  name: string,
  members: Houseguest[],
  founder: Houseguest,
  currentWeek: number,
  isPublic: boolean = false
): Alliance {
  return {
    id,
    name,
    members,
    founder,
    createdOnWeek: currentWeek,
    status: 'Active',
    stability: 80, // Start with high stability
    isPublic,
    lastMeetingWeek: currentWeek
  };
}

/**
 * Calculate alliance stability based on member relationships
 * @returns Stability value between 0-100
 */
export function calculateAllianceStability(
  alliance: Alliance,
  getRelationship: (id1: string, id2: string) => number
): number {
  if (alliance.members.length <= 1) return 100;

  let totalRelationships = 0;
  let totalScore = 0;

  // Check relationships between all members
  for (let i = 0; i < alliance.members.length; i++) {
    for (let j = i + 1; j < alliance.members.length; j++) {
      const member1 = alliance.members[i];
      const member2 = alliance.members[j];
      
      if (!member1 || !member2) continue;
      
      const relationship = getRelationship(member1.id, member2.id);
      totalScore += relationship;
      totalRelationships++;
    }
  }

  // Calculate average and convert to 0-100 scale
  if (totalRelationships === 0) return 50;
  
  const avgRelationship = totalScore / totalRelationships;
  let stability = ((avgRelationship + 100) / 200) * 100; // Convert from -100-100 to 0-100
  
  // Penalize very small or very large alliances 
  // (2-person is unstable, 6+ person is unwieldy)
  if (alliance.members.length === 2) {
    stability *= 0.9; // 10% penalty
  } else if (alliance.members.length >= 6) {
    stability *= (1 - ((alliance.members.length - 5) * 0.05)); // 5% penalty per member over 5
  }
  
  return Math.max(0, Math.min(100, stability));
}
