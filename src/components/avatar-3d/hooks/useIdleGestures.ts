/**
 * @file hooks/useIdleGestures.ts
 * @description Hook for triggering autonomous idle gestures on NPCs
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GestureType } from '../animation/types';

// Subset of subtle, appropriate gestures for idle animation
const IDLE_GESTURES: GestureType[] = ['nod', 'shrug', 'thinkingPose', 'listenNod', 'armFold', 'shoulderRoll'];

// Timing constants (in milliseconds)
const MIN_INTERVAL = 8000;  // 8 seconds minimum between gestures
const MAX_INTERVAL = 20000; // 20 seconds maximum

/**
 * Calculate gesture interval based on personality traits
 */
const getGestureInterval = (traits: string[] = []): number => {
  const isExtrovert = traits.some(t => 
    ['Social', 'Charismatic', 'Energetic', 'Friendly'].includes(t)
  );
  const baseMin = isExtrovert ? 6000 : 10000;
  const baseMax = isExtrovert ? 15000 : 25000;
  return baseMin + Math.random() * (baseMax - baseMin);
};

/**
 * Select a random gesture from the idle gesture pool
 */
const selectRandomGesture = (): GestureType => {
  return IDLE_GESTURES[Math.floor(Math.random() * IDLE_GESTURES.length)];
};

interface UseIdleGesturesOptions {
  characterId: string;
  isPlayer: boolean;
  isSelected?: boolean;
  traits?: string[];
  enabled?: boolean;
}

interface UseIdleGesturesReturn {
  idleGesture: GestureType | null;
  onIdleGestureComplete: () => void;
}

/**
 * Hook that randomly triggers idle gestures for NPC characters
 * 
 * @param options.characterId - Unique identifier for the character
 * @param options.isPlayer - Whether this is the player character (disables idle gestures)
 * @param options.isSelected - Whether the character is currently selected (pauses gestures)
 * @param options.traits - Character personality traits (affects gesture frequency)
 * @param options.enabled - Whether idle gestures are enabled (default: true)
 */
export function useIdleGestures({
  characterId,
  isPlayer,
  isSelected = false,
  traits = [],
  enabled = true,
}: UseIdleGesturesOptions): UseIdleGesturesReturn {
  const [currentGesture, setCurrentGesture] = useState<GestureType | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Clear timeout on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Schedule next gesture
  const scheduleNextGesture = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const interval = getGestureInterval(traits);
    
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      
      // Only trigger if not player, not selected, and enabled
      if (!isPlayer && !isSelected && enabled) {
        const gesture = selectRandomGesture();
        setCurrentGesture(gesture);
      } else {
        // Still schedule next check
        scheduleNextGesture();
      }
    }, interval);
  }, [isPlayer, isSelected, enabled, traits]);

  // Handle gesture completion
  const onIdleGestureComplete = useCallback(() => {
    setCurrentGesture(null);
    scheduleNextGesture();
  }, [scheduleNextGesture]);

  // Start/restart scheduling when conditions change
  useEffect(() => {
    // Player characters don't get idle gestures
    if (isPlayer || !enabled) {
      setCurrentGesture(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Start scheduling with a random initial delay
    const initialDelay = Math.random() * 5000 + 2000; // 2-7 seconds initial delay
    
    timeoutRef.current = setTimeout(() => {
      scheduleNextGesture();
    }, initialDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [characterId, isPlayer, enabled, scheduleNextGesture]);

  // Pause gestures when selected (in conversation)
  useEffect(() => {
    if (isSelected && currentGesture) {
      // Let current gesture finish but don't start new ones
    }
  }, [isSelected, currentGesture]);

  return {
    idleGesture: currentGesture,
    onIdleGestureComplete,
  };
}

export type { UseIdleGesturesOptions, UseIdleGesturesReturn };
