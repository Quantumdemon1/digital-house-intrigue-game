/**
 * @file src/components/feedback/RelationshipMilestoneToast.tsx
 * @description Custom toast component for relationship milestone celebrations
 */

import React from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { 
  MilestoneThreshold, 
  getMilestoneInfo, 
  getTierForScore 
} from '@/models/relationship-tier';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface MilestoneToastProps {
  targetName: string;
  targetAvatarUrl?: string;
  threshold: MilestoneThreshold;
  newScore: number;
}

/**
 * Show a milestone celebration toast with optional confetti
 */
export function showMilestoneToast({
  targetName,
  targetAvatarUrl,
  threshold,
  newScore,
}: MilestoneToastProps) {
  const milestoneInfo = getMilestoneInfo(threshold);
  const tierInfo = getTierForScore(newScore);
  
  // Trigger confetti for the 75+ milestone
  if (milestoneInfo.celebrationType === 'confetti') {
    triggerConfetti();
  }
  
  // Show custom toast
  toast.custom(
    (t) => (
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700 rounded-lg p-4 shadow-lg max-w-sm animate-enter">
        {/* Avatar */}
        <div className="relative">
          <StatusAvatar
            name={targetName}
            avatarUrl={targetAvatarUrl}
            size="md"
          />
          <span className="absolute -bottom-1 -right-1 text-lg">
            {tierInfo.icon}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            🎉 Milestone Reached!
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            You and <span className="font-medium">{targetName}</span> {milestoneInfo.message}
          </p>
          {milestoneInfo.unlockedDeals.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              ✨ New deal types unlocked!
            </p>
          )}
        </div>
      </div>
    ),
    {
      duration: milestoneInfo.celebrationType === 'confetti' ? 5000 : 4000,
      position: 'top-center',
    }
  );
}

/**
 * Trigger confetti animation for major milestones
 */
function triggerConfetti() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF'],
  };

  // Fire from both sides
  confetti({
    ...defaults,
    particleCount: 40,
    origin: { x: 0.2, y: 0.6 },
  });

  confetti({
    ...defaults,
    particleCount: 40,
    origin: { x: 0.8, y: 0.6 },
  });

  // Second burst after short delay
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 30,
      origin: { x: 0.5, y: 0.5 },
    });
  }, 200);
}

export default showMilestoneToast;
