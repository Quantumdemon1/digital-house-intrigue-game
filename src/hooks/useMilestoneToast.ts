/**
 * @file src/hooks/useMilestoneToast.ts
 * @description Hook to show milestone celebration toast when relationship thresholds are crossed
 */

import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { showMilestoneToast } from '@/components/feedback/RelationshipMilestoneToast';

/**
 * Hook that watches for pending milestones and shows celebration toasts
 * Should be used in a top-level component like GameScreen
 */
export function useMilestoneToast() {
  const { gameState, dispatch } = useGame();
  const shownMilestones = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const milestone = gameState.pendingMilestone;
    
    if (milestone) {
      // Create a unique key for this milestone
      const key = `${milestone.targetId}-${milestone.threshold}-${milestone.timestamp}`;
      
      // Only show if we haven't shown this specific milestone
      if (!shownMilestones.current.has(key)) {
        shownMilestones.current.add(key);
        
        // Show the celebration toast
        showMilestoneToast({
          targetName: milestone.targetName,
          targetAvatarUrl: milestone.targetAvatarUrl,
          threshold: milestone.threshold,
          newScore: milestone.newScore,
        });
        
        // Clear the milestone from state after showing
        setTimeout(() => {
          dispatch({ type: 'CLEAR_MILESTONE' });
        }, 100);
      }
    }
  }, [gameState.pendingMilestone, dispatch]);
}

export default useMilestoneToast;
