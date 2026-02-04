/**
 * @file src/models/conversation-topic.ts
 * @description Conversation topic types and configurations for social interactions
 */

export type ConversationTopicType = 
  | 'small_talk'
  | 'personal_chat'
  | 'discuss_game'
  | 'vent_about'
  | 'share_secret';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export interface ConversationTopic {
  type: ConversationTopicType;
  label: string;
  description: string;
  icon: string;
  risk: RiskLevel;
  baseReward: { min: number; max: number };
  failurePenalty: number;
  requiresTarget?: boolean; // For "vent about" - needs a third party
  traitModifiers: Record<string, number>; // Trait -> modifier
}

export const CONVERSATION_TOPICS: Record<ConversationTopicType, ConversationTopic> = {
  small_talk: {
    type: 'small_talk',
    label: 'Small Talk',
    description: 'Safe, casual conversation about hobbies and life',
    icon: '💬',
    risk: 'none',
    baseReward: { min: 3, max: 5 },
    failurePenalty: 0,
    traitModifiers: {
      'Friendly': 2,
      'Social': 1,
      'Shy': -1,
    },
  },
  personal_chat: {
    type: 'personal_chat',
    label: 'Personal Chat',
    description: 'Share personal stories and build deeper connection',
    icon: '❤️',
    risk: 'low',
    baseReward: { min: 5, max: 8 },
    failurePenalty: -2,
    traitModifiers: {
      'Emotional': 3,
      'Empathetic': 2,
      'Cold': -2,
      'Guarded': -1,
    },
  },
  discuss_game: {
    type: 'discuss_game',
    label: 'Discuss the Game',
    description: 'Talk strategy and game dynamics - shows your cards',
    icon: '🎯',
    risk: 'medium',
    baseReward: { min: 4, max: 10 },
    failurePenalty: -5,
    traitModifiers: {
      'Strategic': 4,
      'Analytical': 3,
      'Competitive': 2,
      'Paranoid': -3,
      'Trusting': -1,
    },
  },
  vent_about: {
    type: 'vent_about',
    label: 'Vent About Houseguest',
    description: 'Gossip about another player - risky if they\'re allied!',
    icon: '🗣️',
    risk: 'high',
    baseReward: { min: 8, max: 15 },
    failurePenalty: -10,
    requiresTarget: true,
    traitModifiers: {
      'Sneaky': 4,
      'Gossipy': 3,
      'Dramatic': 2,
      'Loyal': -5,
      'Honest': -3,
    },
  },
  share_secret: {
    type: 'share_secret',
    label: 'Share a Secret',
    description: 'Reveal game intel to build trust - major betrayal risk',
    icon: '🤫',
    risk: 'high',
    baseReward: { min: 10, max: 18 },
    failurePenalty: -15,
    traitModifiers: {
      'Strategic': 3,
      'Trusting': 2,
      'Manipulative': 2,
      'Paranoid': -4,
      'Guarded': -3,
    },
  },
};

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'none': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function getRiskLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'none': return 'No Risk';
    case 'low': return 'Low Risk';
    case 'medium': return 'Medium Risk';
    case 'high': return 'High Risk';
    default: return 'Unknown';
  }
}
