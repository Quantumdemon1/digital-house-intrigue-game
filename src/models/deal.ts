/**
 * @file src/models/deal.ts
 * @description Deal and NPCProposal type definitions for the Deals & Alliances system
 */

export type DealStatus = 'proposed' | 'accepted' | 'active' | 'fulfilled' | 'broken' | 'declined' | 'expired';

export type DealType = 
  | 'target_agreement'      // Agree to target specific houseguest if win HoH
  | 'safety_agreement'      // Agree not to nominate each other
  | 'vote_together'         // Vote as a block this week
  | 'veto_use'              // Use veto on partner if they're on block
  | 'information_sharing'   // Share game intel with each other
  | 'final_two'             // Take each other to final 2
  | 'partnership'           // General working together
  | 'alliance_invite';      // Formal alliance formation

export interface Deal {
  id: string;
  type: DealType;
  title: string;
  description: string;
  proposerId: string;
  recipientId: string;
  week: number;
  status: DealStatus;
  createdAt: number;
  updatedAt: number;
  expiresWeek?: number;
  trustImpact: 'low' | 'medium' | 'high' | 'critical';
  context?: {
    targetHouseguestId?: string;
    allianceId?: string;
    votingPreference?: string;
    upgradeFrom?: string;
  };
}

export interface NPCProposal {
  id: string;
  fromNPCId: string;
  fromNPCName: string;
  toPlayerId: string;
  deal: Omit<Deal, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
  reasoning: string;
  timestamp: number;
  response: 'accepted' | 'declined' | 'pending';
}

export interface DealDisplayData extends Deal {
  proposerName: string;
  recipientName: string;
  targetName?: string;
}

// Deal type metadata for UI display
export const DEAL_TYPE_INFO: Record<DealType, {
  title: string;
  icon: string;
  description: string;
  defaultTrustImpact: Deal['trustImpact'];
}> = {
  target_agreement: {
    title: 'Target Agreement',
    icon: '🎯',
    description: 'Agree to target a specific houseguest if either wins HoH',
    defaultTrustImpact: 'high'
  },
  safety_agreement: {
    title: 'Safety Pact',
    icon: '🛡️',
    description: 'Promise not to nominate each other',
    defaultTrustImpact: 'high'
  },
  vote_together: {
    title: 'Voting Block',
    icon: '🗳️',
    description: 'Vote together this week',
    defaultTrustImpact: 'medium'
  },
  veto_use: {
    title: 'Veto Commitment',
    icon: '🏆',
    description: 'Use veto on partner if they are on the block',
    defaultTrustImpact: 'critical'
  },
  information_sharing: {
    title: 'Information Sharing',
    icon: '💬',
    description: 'Share all game intel with each other',
    defaultTrustImpact: 'low'
  },
  final_two: {
    title: 'Final Two Deal',
    icon: '🤝',
    description: 'Take each other to the final 2',
    defaultTrustImpact: 'critical'
  },
  partnership: {
    title: 'Partnership',
    icon: '👥',
    description: 'Work together moving forward',
    defaultTrustImpact: 'medium'
  },
  alliance_invite: {
    title: 'Alliance Invitation',
    icon: '⭐',
    description: 'Form or join an official alliance',
    defaultTrustImpact: 'high'
  }
};

/**
 * Get display title for a deal type
 */
export function getDealTypeTitle(type: DealType): string {
  return DEAL_TYPE_INFO[type]?.title || type;
}

/**
 * Get icon for a deal type
 */
export function getDealTypeIcon(type: DealType): string {
  return DEAL_TYPE_INFO[type]?.icon || '📋';
}
