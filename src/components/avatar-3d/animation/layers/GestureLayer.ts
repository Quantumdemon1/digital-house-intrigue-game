 /**
  * @file animation/layers/GestureLayer.ts
  * @description Expanded gesture library with smooth interpolation
  */
 
 import * as THREE from 'three';
 import { BoneMap, BoneRotation, GestureType } from '../types';
 import { lerpBoneRotation } from '../utils/boneUtils';
 
 // Easing functions
 const easeInOutQuad = (t: number): number => 
   t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
 
 const easeInOutCubic = (t: number): number =>
   t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
 
 const easeOutBack = (t: number): number => {
   const c1 = 1.70158;
   const c3 = c1 + 1;
   return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
 };
 
 // Gesture keyframe definition
 interface GestureKeyframe {
   time: number;  // 0-1 normalized progress
   bones: Record<string, BoneRotation>;
   easing?: (t: number) => number;
 }
 
interface GestureDefinition {
  duration: number;      // Seconds
  keyframes: GestureKeyframe[];
  interruptible: boolean;
  blendInDuration: number;   // Seconds to blend into gesture (smooth start)
  blendOutDuration: number;  // Seconds to blend back to base pose
}
 
/**
 * REFINED Gesture Library
 * - Improved arm trajectories to prevent body collision
 * - Better shoulder engagement for natural motion
 * - Smoother keyframe distribution
 */
export const GESTURE_LIBRARY: Partial<Record<GestureType, GestureDefinition>> = {
  wave: {
    duration: 1.6,
    interruptible: true,
    blendInDuration: 0.18,
    blendOutDuration: 0.35,
    keyframes: [
      // Start: arm relaxed at side, shoulder engaged
      { time: 0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }, 
        RightHand: { x: 0.05, y: 0, z: -0.1 } 
      }},
      // Lift arm up and out - shoulder rotates to clear body
      { time: 0.12, bones: { 
        RightShoulder: { x: 0.08, y: -0.15, z: -0.12 },
        RightArm: { x: -0.6, y: 0.25, z: -0.45 }, 
        RightForeArm: { x: 0.15, y: 0.3, z: -1.0 }, 
        RightHand: { x: 0, y: 0.2, z: 0 } 
      }},
      // Full wave position - arm raised, elbow bent
      { time: 0.2, bones: { 
        RightShoulder: { x: 0.1, y: -0.18, z: -0.15 },
        RightArm: { x: -1.1, y: 0.35, z: -0.35 }, 
        RightForeArm: { x: 0.2, y: 0.5, z: -1.4 }, 
        RightHand: { x: 0, y: 0.35, z: 0 } 
      }},
      // Wave 1 - hand rotates
      { time: 0.32, bones: { 
        RightShoulder: { x: 0.1, y: -0.18, z: -0.15 },
        RightArm: { x: -1.1, y: 0.35, z: -0.35 }, 
        RightForeArm: { x: 0.2, y: 0.5, z: -1.4 }, 
        RightHand: { x: 0, y: -0.4, z: 0 } 
      }},
      // Wave 2
      { time: 0.44, bones: { 
        RightShoulder: { x: 0.1, y: -0.18, z: -0.15 },
        RightArm: { x: -1.1, y: 0.35, z: -0.35 }, 
        RightForeArm: { x: 0.2, y: 0.5, z: -1.4 }, 
        RightHand: { x: 0, y: 0.4, z: 0 } 
      }},
      // Wave 3
      { time: 0.56, bones: { 
        RightShoulder: { x: 0.1, y: -0.18, z: -0.15 },
        RightArm: { x: -1.1, y: 0.35, z: -0.35 }, 
        RightForeArm: { x: 0.2, y: 0.5, z: -1.4 }, 
        RightHand: { x: 0, y: -0.35, z: 0 } 
      }},
      // Wave 4
      { time: 0.68, bones: { 
        RightShoulder: { x: 0.1, y: -0.18, z: -0.15 },
        RightArm: { x: -1.1, y: 0.35, z: -0.35 }, 
        RightForeArm: { x: 0.2, y: 0.5, z: -1.4 }, 
        RightHand: { x: 0, y: 0.3, z: 0 } 
      }},
      // Lower arm back down
      { time: 0.85, bones: { 
        RightShoulder: { x: 0.05, y: -0.12, z: -0.1 },
        RightArm: { x: -0.4, y: 0.15, z: -0.5 }, 
        RightForeArm: { x: 0.15, y: 0.2, z: -0.6 }, 
        RightHand: { x: 0, y: 0.1, z: -0.05 } 
      }},
      // Return to relaxed
      { time: 1.0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }, 
        RightHand: { x: 0.05, y: 0, z: -0.1 } 
      }},
    ],
  },
  
  nod: {
    duration: 0.9,
    interruptible: true,
    blendInDuration: 0.1,
    blendOutDuration: 0.2,
    keyframes: [
      { time: 0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
      { time: 0.2, bones: { Head: { x: 0.18, y: 0, z: 0 }, Neck: { x: 0.06, y: 0, z: 0 } } },
      { time: 0.45, bones: { Head: { x: -0.02, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
      { time: 0.65, bones: { Head: { x: 0.12, y: 0, z: 0 }, Neck: { x: 0.04, y: 0, z: 0 } } },
      { time: 1.0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
    ],
  },
  
  shrug: {
    duration: 1.3,
    interruptible: true,
    blendInDuration: 0.18,
    blendOutDuration: 0.35,
    keyframes: [
      // Relaxed start
      { time: 0, bones: { 
        LeftShoulder: { x: 0.02, y: 0.1, z: 0.1 },
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        LeftArm: { x: 0.08, y: 0.05, z: 0.55 }, 
        RightArm: { x: 0.08, y: -0.05, z: -0.55 },
        LeftForeArm: { x: 0.18, y: 0.05, z: 0.08 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 },
        Spine: { x: 0.03, y: 0, z: 0 }, 
        Head: { x: -0.02, y: 0, z: 0 }
      }},
      // Shoulders up, palms turn out
      { time: 0.25, bones: { 
        LeftShoulder: { x: 0.18, y: 0.15, z: 0.12 },
        RightShoulder: { x: 0.18, y: -0.15, z: -0.12 },
        LeftArm: { x: -0.15, y: 0.12, z: 0.7 }, 
        RightArm: { x: -0.15, y: -0.12, z: -0.7 },
        LeftForeArm: { x: 0.1, y: 0.25, z: 0.65 }, 
        RightForeArm: { x: 0.1, y: -0.25, z: -0.65 },
        LeftHand: { x: 0.1, y: 0.2, z: -0.3 },
        RightHand: { x: 0.1, y: -0.2, z: 0.3 },
        Spine: { x: 0.02, y: 0, z: 0.02 }, 
        Head: { x: 0, y: 0, z: 0.06 }
      }},
      // Peak shrug
      { time: 0.45, bones: { 
        LeftShoulder: { x: 0.22, y: 0.18, z: 0.15 },
        RightShoulder: { x: 0.22, y: -0.18, z: -0.15 },
        LeftArm: { x: -0.22, y: 0.15, z: 0.65 }, 
        RightArm: { x: -0.22, y: -0.15, z: -0.65 },
        LeftForeArm: { x: 0.12, y: 0.35, z: 0.85 }, 
        RightForeArm: { x: 0.12, y: -0.35, z: -0.85 },
        LeftHand: { x: 0.12, y: 0.25, z: -0.35 },
        RightHand: { x: 0.12, y: -0.25, z: 0.35 },
        Spine: { x: 0.01, y: 0, z: 0.025 }, 
        Head: { x: 0.02, y: 0, z: 0.08 }
      }},
      // Hold briefly
      { time: 0.6, bones: { 
        LeftShoulder: { x: 0.2, y: 0.16, z: 0.13 },
        RightShoulder: { x: 0.2, y: -0.16, z: -0.13 },
        LeftArm: { x: -0.18, y: 0.12, z: 0.68 }, 
        RightArm: { x: -0.18, y: -0.12, z: -0.68 },
        LeftForeArm: { x: 0.1, y: 0.3, z: 0.75 }, 
        RightForeArm: { x: 0.1, y: -0.3, z: -0.75 },
        LeftHand: { x: 0.1, y: 0.22, z: -0.32 },
        RightHand: { x: 0.1, y: -0.22, z: 0.32 },
        Spine: { x: 0.02, y: 0, z: 0.02 }, 
        Head: { x: 0.01, y: 0, z: 0.06 }
      }},
      // Relax down
      { time: 0.8, bones: { 
        LeftShoulder: { x: 0.08, y: 0.12, z: 0.1 },
        RightShoulder: { x: 0.08, y: -0.12, z: -0.1 },
        LeftArm: { x: 0, y: 0.08, z: 0.6 }, 
        RightArm: { x: 0, y: -0.08, z: -0.6 },
        LeftForeArm: { x: 0.15, y: 0.15, z: 0.3 }, 
        RightForeArm: { x: 0.15, y: -0.15, z: -0.3 },
        Spine: { x: 0.025, y: 0, z: 0.01 }, 
        Head: { x: -0.01, y: 0, z: 0.03 }
      }},
      // Back to relaxed
      { time: 1.0, bones: { 
        LeftShoulder: { x: 0.02, y: 0.1, z: 0.1 },
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        LeftArm: { x: 0.08, y: 0.05, z: 0.55 }, 
        RightArm: { x: 0.08, y: -0.05, z: -0.55 },
        LeftForeArm: { x: 0.18, y: 0.05, z: 0.08 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 },
        Spine: { x: 0.03, y: 0, z: 0 }, 
        Head: { x: -0.02, y: 0, z: 0 }
      }},
    ],
  },
  
  clap: {
    duration: 2.2,
    interruptible: false,
    blendInDuration: 0.18,
    blendOutDuration: 0.35,
    keyframes: [
      // Start: arms at sides
      { time: 0, bones: { 
        LeftShoulder: { x: 0.05, y: 0.12, z: 0.1 },
        RightShoulder: { x: 0.05, y: -0.12, z: -0.1 },
        LeftArm: { x: 0.5, y: 0.25, z: 0.45 }, 
        RightArm: { x: 0.5, y: -0.25, z: -0.45 },
        LeftForeArm: { x: 0.1, y: 0.18, z: 1.15 }, 
        RightForeArm: { x: 0.1, y: -0.18, z: -1.15 }
      }},
      // Clap 1 - hands meet
      { time: 0.12, bones: { 
        LeftShoulder: { x: 0.08, y: 0.08, z: 0.08 },
        RightShoulder: { x: 0.08, y: -0.08, z: -0.08 },
        LeftArm: { x: 0.45, y: 0.05, z: 0.32 }, 
        RightArm: { x: 0.45, y: -0.05, z: -0.32 },
        LeftForeArm: { x: 0.12, y: 0.28, z: 1.45 }, 
        RightForeArm: { x: 0.12, y: -0.28, z: -1.45 }
      }},
      // Clap apart
      { time: 0.22, bones: { 
        LeftShoulder: { x: 0.05, y: 0.12, z: 0.1 },
        RightShoulder: { x: 0.05, y: -0.12, z: -0.1 },
        LeftArm: { x: 0.52, y: 0.28, z: 0.48 }, 
        RightArm: { x: 0.52, y: -0.28, z: -0.48 },
        LeftForeArm: { x: 0.08, y: 0.15, z: 1.1 }, 
        RightForeArm: { x: 0.08, y: -0.15, z: -1.1 }
      }},
      // Clap 2
      { time: 0.34, bones: { 
        LeftShoulder: { x: 0.08, y: 0.08, z: 0.08 },
        RightShoulder: { x: 0.08, y: -0.08, z: -0.08 },
        LeftArm: { x: 0.45, y: 0.05, z: 0.32 }, 
        RightArm: { x: 0.45, y: -0.05, z: -0.32 },
        LeftForeArm: { x: 0.12, y: 0.28, z: 1.45 }, 
        RightForeArm: { x: 0.12, y: -0.28, z: -1.45 }
      }},
      // Apart
      { time: 0.46, bones: { 
        LeftShoulder: { x: 0.05, y: 0.12, z: 0.1 },
        RightShoulder: { x: 0.05, y: -0.12, z: -0.1 },
        LeftArm: { x: 0.52, y: 0.28, z: 0.48 }, 
        RightArm: { x: 0.52, y: -0.28, z: -0.48 },
        LeftForeArm: { x: 0.08, y: 0.15, z: 1.1 }, 
        RightForeArm: { x: 0.08, y: -0.15, z: -1.1 }
      }},
      // Clap 3
      { time: 0.58, bones: { 
        LeftShoulder: { x: 0.08, y: 0.08, z: 0.08 },
        RightShoulder: { x: 0.08, y: -0.08, z: -0.08 },
        LeftArm: { x: 0.45, y: 0.05, z: 0.32 }, 
        RightArm: { x: 0.45, y: -0.05, z: -0.32 },
        LeftForeArm: { x: 0.12, y: 0.28, z: 1.45 }, 
        RightForeArm: { x: 0.12, y: -0.28, z: -1.45 }
      }},
      // Apart
      { time: 0.7, bones: { 
        LeftShoulder: { x: 0.05, y: 0.12, z: 0.1 },
        RightShoulder: { x: 0.05, y: -0.12, z: -0.1 },
        LeftArm: { x: 0.52, y: 0.28, z: 0.48 }, 
        RightArm: { x: 0.52, y: -0.28, z: -0.48 },
        LeftForeArm: { x: 0.08, y: 0.15, z: 1.1 }, 
        RightForeArm: { x: 0.08, y: -0.15, z: -1.1 }
      }},
      // Clap 4
      { time: 0.82, bones: { 
        LeftShoulder: { x: 0.08, y: 0.08, z: 0.08 },
        RightShoulder: { x: 0.08, y: -0.08, z: -0.08 },
        LeftArm: { x: 0.45, y: 0.05, z: 0.32 }, 
        RightArm: { x: 0.45, y: -0.05, z: -0.32 },
        LeftForeArm: { x: 0.12, y: 0.28, z: 1.45 }, 
        RightForeArm: { x: 0.12, y: -0.28, z: -1.45 }
      }},
      // Return to relaxed
      { time: 1.0, bones: { 
        LeftShoulder: { x: 0.02, y: 0.1, z: 0.1 },
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        LeftArm: { x: 0.08, y: 0.05, z: 0.55 }, 
        RightArm: { x: 0.08, y: -0.05, z: -0.55 },
        LeftForeArm: { x: 0.18, y: 0.05, z: 0.08 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }
      }},
    ],
  },
  
  point: {
    duration: 1.1,
    interruptible: true,
    blendInDuration: 0.15,
    blendOutDuration: 0.28,
    keyframes: [
      // Start relaxed
      { time: 0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }, 
        RightHand: { x: 0.05, y: 0, z: -0.1 } 
      }},
      // Extend arm forward - shoulder forward to clear body
      { time: 0.25, bones: { 
        RightShoulder: { x: 0.12, y: -0.2, z: -0.15 },
        RightArm: { x: -0.65, y: 0.18, z: -0.25 }, 
        RightForeArm: { x: 0.28, y: 0.05, z: -0.45 }, 
        RightHand: { x: -0.08, y: 0, z: 0 } 
      }},
      // Hold point
      { time: 0.65, bones: { 
        RightShoulder: { x: 0.12, y: -0.2, z: -0.15 },
        RightArm: { x: -0.65, y: 0.18, z: -0.25 }, 
        RightForeArm: { x: 0.28, y: 0.05, z: -0.45 }, 
        RightHand: { x: -0.08, y: 0, z: 0 } 
      }},
      // Return
      { time: 1.0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }, 
        RightHand: { x: 0.05, y: 0, z: -0.1 } 
      }},
    ],
  },
  
  thumbsUp: {
    duration: 1.3,
    interruptible: true,
    blendInDuration: 0.18,
    blendOutDuration: 0.3,
    keyframes: [
      // Start
      { time: 0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }, 
        RightHand: { x: 0.05, y: 0, z: -0.1 } 
      }},
      // Raise arm with thumbs up - use easeOutBack for pop
      { time: 0.22, bones: { 
        RightShoulder: { x: 0.1, y: -0.18, z: -0.12 },
        RightArm: { x: -0.42, y: 0.38, z: -0.42 }, 
        RightForeArm: { x: 0.45, y: 0.28, z: -1.65 }, 
        RightHand: { x: -0.25, y: 0, z: 0.18 } 
      }, easing: easeOutBack },
      // Hold
      { time: 0.72, bones: { 
        RightShoulder: { x: 0.1, y: -0.18, z: -0.12 },
        RightArm: { x: -0.42, y: 0.38, z: -0.42 }, 
        RightForeArm: { x: 0.45, y: 0.28, z: -1.65 }, 
        RightHand: { x: -0.25, y: 0, z: 0.18 } 
      }},
      // Return
      { time: 1.0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }, 
        RightHand: { x: 0.05, y: 0, z: -0.1 } 
      }},
    ],
  },
  
  headShake: {
    duration: 1.0,
    interruptible: true,
    blendInDuration: 0.1,
    blendOutDuration: 0.22,
    keyframes: [
      { time: 0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
      { time: 0.12, bones: { Head: { x: 0, y: -0.22, z: 0 }, Neck: { x: 0, y: -0.07, z: 0 } } },
      { time: 0.32, bones: { Head: { x: 0, y: 0.22, z: 0 }, Neck: { x: 0, y: 0.07, z: 0 } } },
      { time: 0.5, bones: { Head: { x: 0, y: -0.18, z: 0 }, Neck: { x: 0, y: -0.05, z: 0 } } },
      { time: 0.68, bones: { Head: { x: 0, y: 0.14, z: 0 }, Neck: { x: 0, y: 0.04, z: 0 } } },
      { time: 0.85, bones: { Head: { x: 0, y: -0.08, z: 0 }, Neck: { x: 0, y: -0.02, z: 0 } } },
      { time: 1.0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
    ],
  },
  
  celebrate: {
    duration: 2.0,
    interruptible: true,
    blendInDuration: 0.22,
    blendOutDuration: 0.4,
    keyframes: [
      // Start
      { time: 0, bones: { 
        LeftShoulder: { x: 0.02, y: 0.1, z: 0.1 },
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        LeftArm: { x: 0.08, y: 0.05, z: 0.55 }, 
        RightArm: { x: 0.08, y: -0.05, z: -0.55 },
        LeftForeArm: { x: 0.18, y: 0.05, z: 0.08 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 },
        Spine: { x: 0.03, y: 0, z: 0 }
      }},
      // Arms shoot up - use easeOutBack for enthusiasm
      { time: 0.18, bones: { 
        LeftShoulder: { x: 0.12, y: 0.18, z: 0.15 },
        RightShoulder: { x: 0.12, y: -0.18, z: -0.15 },
        LeftArm: { x: -1.35, y: 0.22, z: 0.35 }, 
        RightArm: { x: -1.35, y: -0.22, z: -0.35 },
        LeftForeArm: { x: 0.28, y: 0.18, z: 0.7 }, 
        RightForeArm: { x: 0.28, y: -0.18, z: -0.7 },
        Spine: { x: -0.08, y: 0, z: 0 }
      }, easing: easeOutBack },
      // Sway left
      { time: 0.4, bones: { 
        LeftShoulder: { x: 0.1, y: 0.2, z: 0.18 },
        RightShoulder: { x: 0.1, y: -0.2, z: -0.18 },
        LeftArm: { x: -1.42, y: 0.28, z: 0.42 }, 
        RightArm: { x: -1.42, y: -0.28, z: -0.42 },
        LeftForeArm: { x: 0.2, y: 0.25, z: 0.55 }, 
        RightForeArm: { x: 0.2, y: -0.25, z: -0.55 },
        Spine: { x: -0.06, y: 0.025, z: 0 }
      }},
      // Sway right
      { time: 0.6, bones: { 
        LeftShoulder: { x: 0.1, y: 0.18, z: 0.15 },
        RightShoulder: { x: 0.1, y: -0.18, z: -0.15 },
        LeftArm: { x: -1.38, y: 0.2, z: 0.32 }, 
        RightArm: { x: -1.38, y: -0.2, z: -0.32 },
        LeftForeArm: { x: 0.25, y: 0.2, z: 0.65 }, 
        RightForeArm: { x: 0.25, y: -0.2, z: -0.65 },
        Spine: { x: -0.07, y: -0.025, z: 0 }
      }},
      // Sway left again
      { time: 0.8, bones: { 
        LeftShoulder: { x: 0.1, y: 0.2, z: 0.18 },
        RightShoulder: { x: 0.1, y: -0.2, z: -0.18 },
        LeftArm: { x: -1.4, y: 0.25, z: 0.38 }, 
        RightArm: { x: -1.4, y: -0.25, z: -0.38 },
        LeftForeArm: { x: 0.22, y: 0.22, z: 0.6 }, 
        RightForeArm: { x: 0.22, y: -0.22, z: -0.6 },
        Spine: { x: -0.06, y: 0.02, z: 0 }
      }},
      // Lower down
      { time: 1.0, bones: { 
        LeftShoulder: { x: 0.02, y: 0.1, z: 0.1 },
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        LeftArm: { x: 0.08, y: 0.05, z: 0.55 }, 
        RightArm: { x: 0.08, y: -0.05, z: -0.55 },
        LeftForeArm: { x: 0.18, y: 0.05, z: 0.08 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 },
        Spine: { x: 0.03, y: 0, z: 0 }
      }},
    ],
  },
  
  thinkingPose: {
    duration: 1.6,
    interruptible: true,
    blendInDuration: 0.22,
    blendOutDuration: 0.4,
    keyframes: [
      // Start
      { time: 0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 },
        Head: { x: -0.02, y: 0, z: 0 }, 
        Spine: { x: 0.03, y: 0, z: 0 }
      }},
      // Hand to chin
      { time: 0.28, bones: { 
        RightShoulder: { x: 0.15, y: -0.12, z: -0.08 },
        RightArm: { x: 0.8, y: 0.05, z: -0.22 }, 
        RightForeArm: { x: 0.05, y: 0.02, z: -1.85 },
        RightHand: { x: -0.28, y: 0, z: 0 },
        Head: { x: -0.06, y: 0.04, z: 0.035 }, 
        Spine: { x: 0.01, y: 0.02, z: 0 }
      }},
      // Slight head tilt while thinking
      { time: 0.55, bones: { 
        RightShoulder: { x: 0.15, y: -0.12, z: -0.08 },
        RightArm: { x: 0.8, y: 0.05, z: -0.22 }, 
        RightForeArm: { x: 0.05, y: 0.02, z: -1.85 },
        RightHand: { x: -0.28, y: 0, z: 0 },
        Head: { x: -0.08, y: 0.06, z: 0.04 }, 
        Spine: { x: 0.01, y: 0.025, z: 0 }
      }},
      // Hold
      { time: 0.75, bones: { 
        RightShoulder: { x: 0.15, y: -0.12, z: -0.08 },
        RightArm: { x: 0.8, y: 0.05, z: -0.22 }, 
        RightForeArm: { x: 0.05, y: 0.02, z: -1.85 },
        RightHand: { x: -0.28, y: 0, z: 0 },
        Head: { x: -0.06, y: 0.04, z: 0.035 }, 
        Spine: { x: 0.01, y: 0.02, z: 0 }
      }},
      // Return
      { time: 1.0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 },
        RightHand: { x: 0.05, y: 0, z: -0.1 },
        Head: { x: -0.02, y: 0, z: 0 }, 
        Spine: { x: 0.03, y: 0, z: 0 }
      }},
    ],
  },
  
  welcome: {
    duration: 1.5,
    interruptible: true,
    blendInDuration: 0.22,
    blendOutDuration: 0.35,
    keyframes: [
      // Start
      { time: 0, bones: { 
        LeftShoulder: { x: 0.02, y: 0.1, z: 0.1 },
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        LeftArm: { x: 0.08, y: 0.05, z: 0.55 }, 
        RightArm: { x: 0.08, y: -0.05, z: -0.55 },
        LeftForeArm: { x: 0.18, y: 0.05, z: 0.08 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }
      }},
      // Arms open wide - welcoming
      { time: 0.22, bones: { 
        LeftShoulder: { x: 0.08, y: 0.18, z: 0.15 },
        RightShoulder: { x: 0.08, y: -0.18, z: -0.15 },
        LeftArm: { x: -0.55, y: 0.32, z: 0.58 }, 
        RightArm: { x: -0.55, y: -0.32, z: -0.58 },
        LeftForeArm: { x: 0.18, y: 0.2, z: 0.38 }, 
        RightForeArm: { x: 0.18, y: -0.2, z: -0.38 },
        LeftHand: { x: 0.05, y: 0.1, z: -0.25 },
        RightHand: { x: 0.05, y: -0.1, z: 0.25 }
      }, easing: easeOutBack },
      // Hold
      { time: 0.68, bones: { 
        LeftShoulder: { x: 0.08, y: 0.18, z: 0.15 },
        RightShoulder: { x: 0.08, y: -0.18, z: -0.15 },
        LeftArm: { x: -0.55, y: 0.32, z: 0.58 }, 
        RightArm: { x: -0.55, y: -0.32, z: -0.58 },
        LeftForeArm: { x: 0.18, y: 0.2, z: 0.38 }, 
        RightForeArm: { x: 0.18, y: -0.2, z: -0.38 },
        LeftHand: { x: 0.05, y: 0.1, z: -0.25 },
        RightHand: { x: 0.05, y: -0.1, z: 0.25 }
      }},
      // Return
      { time: 1.0, bones: { 
        LeftShoulder: { x: 0.02, y: 0.1, z: 0.1 },
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        LeftArm: { x: 0.08, y: 0.05, z: 0.55 }, 
        RightArm: { x: 0.08, y: -0.05, z: -0.55 },
        LeftForeArm: { x: 0.18, y: 0.05, z: 0.08 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }
      }},
    ],
  },
  
  dismiss: {
    duration: 0.9,
    interruptible: true,
    blendInDuration: 0.12,
    blendOutDuration: 0.22,
    keyframes: [
      // Start
      { time: 0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }, 
        RightHand: { x: 0.05, y: 0, z: -0.1 } 
      }},
      // Dismissive wave up
      { time: 0.18, bones: { 
        RightShoulder: { x: 0.08, y: -0.15, z: -0.1 },
        RightArm: { x: -0.35, y: 0.28, z: -0.48 }, 
        RightForeArm: { x: 0.18, y: 0.18, z: -0.9 }, 
        RightHand: { x: 0, y: 0.28, z: 0 } 
      }},
      // Flick away
      { time: 0.35, bones: { 
        RightShoulder: { x: 0.06, y: -0.12, z: -0.12 },
        RightArm: { x: -0.32, y: -0.08, z: -0.55 }, 
        RightForeArm: { x: 0.15, y: -0.08, z: -0.7 }, 
        RightHand: { x: 0, y: -0.18, z: 0 } 
      }},
      // Second flick
      { time: 0.52, bones: { 
        RightShoulder: { x: 0.07, y: -0.13, z: -0.1 },
        RightArm: { x: -0.28, y: 0.18, z: -0.6 }, 
        RightForeArm: { x: 0.12, y: 0.1, z: -0.55 }, 
        RightHand: { x: 0, y: 0.12, z: 0 } 
      }},
      // Return
      { time: 1.0, bones: { 
        RightShoulder: { x: 0.02, y: -0.1, z: -0.1 },
        RightArm: { x: 0.08, y: -0.05, z: -0.55 }, 
        RightForeArm: { x: 0.18, y: -0.05, z: -0.08 }, 
        RightHand: { x: 0.05, y: 0, z: -0.1 } 
      }},
    ],
  },
  listenNod: {
    duration: 1.5,
    interruptible: true,
    blendInDuration: 0.1,
    blendOutDuration: 0.2,
     keyframes: [
       { time: 0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
       { time: 0.2, bones: { Head: { x: 0.1, y: 0, z: 0 }, Neck: { x: 0.04, y: 0, z: 0 } } },
       { time: 0.35, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
       { time: 0.55, bones: { Head: { x: 0.08, y: 0, z: 0 }, Neck: { x: 0.03, y: 0, z: 0 } } },
       { time: 0.7, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
       { time: 0.85, bones: { Head: { x: 0.06, y: 0, z: 0 }, Neck: { x: 0.02, y: 0, z: 0 } } },
       { time: 1.0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
     ],
   },
 walk: {
   duration: 0.8, // One step cycle - short for natural loop
   interruptible: true,
   blendInDuration: 0.1,
   blendOutDuration: 0.25,
    keyframes: [
      // Start pose - left arm back, right arm forward
      { time: 0, bones: { 
        LeftArm: { x: 0.15, y: -0.1, z: 1.4 },   // Left arm back
        RightArm: { x: 0.15, y: 0.1, z: -1.1 },  // Right arm forward
        LeftForeArm: { x: 0, y: 0, z: 0.2 },
        RightForeArm: { x: 0, y: 0, z: -0.4 },
        Spine: { x: -0.03, y: 0.02, z: 0 },
        Spine1: { x: -0.02, y: 0.01, z: 0 },
        Head: { x: 0, y: 0, z: 0 },
      }},
      // Mid-stride - arms swinging through center
      { time: 0.25, bones: { 
        LeftArm: { x: 0.1, y: 0, z: 1.25 },
        RightArm: { x: 0.1, y: 0, z: -1.25 },
        LeftForeArm: { x: 0, y: 0, z: 0.3 },
        RightForeArm: { x: 0, y: 0, z: -0.3 },
        Spine: { x: -0.02, y: 0, z: 0 },
        Spine1: { x: -0.01, y: 0, z: 0 },
        Head: { x: 0, y: 0, z: 0 },
      }},
      // Opposite stride - left arm forward, right arm back
      { time: 0.5, bones: { 
        LeftArm: { x: 0.15, y: 0.1, z: 1.1 },    // Left arm forward
        RightArm: { x: 0.15, y: -0.1, z: -1.4 }, // Right arm back
        LeftForeArm: { x: 0, y: 0, z: 0.4 },
        RightForeArm: { x: 0, y: 0, z: -0.2 },
        Spine: { x: -0.03, y: -0.02, z: 0 },
        Spine1: { x: -0.02, y: -0.01, z: 0 },
        Head: { x: 0, y: 0, z: 0 },
      }},
      // Returning to start
      { time: 0.75, bones: { 
        LeftArm: { x: 0.1, y: 0, z: 1.25 },
        RightArm: { x: 0.1, y: 0, z: -1.25 },
        LeftForeArm: { x: 0, y: 0, z: 0.3 },
        RightForeArm: { x: 0, y: 0, z: -0.3 },
        Spine: { x: -0.02, y: 0, z: 0 },
        Spine1: { x: -0.01, y: 0, z: 0 },
        Head: { x: 0, y: 0, z: 0 },
      }},
      // Back to start (seamless loop)
      { time: 1.0, bones: { 
        LeftArm: { x: 0.15, y: -0.1, z: 1.4 },
        RightArm: { x: 0.15, y: 0.1, z: -1.1 },
        LeftForeArm: { x: 0, y: 0, z: 0.2 },
        RightForeArm: { x: 0, y: 0, z: -0.4 },
        Spine: { x: -0.03, y: 0.02, z: 0 },
        Spine1: { x: -0.02, y: 0.01, z: 0 },
        Head: { x: 0, y: 0, z: 0 },
      }},
    ],
  },
  // ===== IDLE ARM GESTURES (for NPC autonomous animation) =====
  armFold: {
    duration: 1.0,
    interruptible: true,
    blendInDuration: 0.15,
    blendOutDuration: 0.3,
    keyframes: [
      { time: 0, bones: { 
        LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
        LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 }
      }},
      { time: 0.3, bones: { 
        LeftArm: { x: 0.5, y: 0.2, z: 0.6 }, RightArm: { x: 0.5, y: -0.2, z: -0.6 },
        LeftForeArm: { x: 0, y: 0.4, z: 1.2 }, RightForeArm: { x: 0, y: -0.4, z: -1.2 }
      }},
      { time: 0.6, bones: { 
        LeftArm: { x: 0.5, y: 0.2, z: 0.6 }, RightArm: { x: 0.5, y: -0.2, z: -0.6 },
        LeftForeArm: { x: 0, y: 0.4, z: 1.2 }, RightForeArm: { x: 0, y: -0.4, z: -1.2 }
      }},
      { time: 1.0, bones: { 
        LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
        LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 }
      }},
    ],
  },
  shoulderRoll: {
    duration: 0.9,
    interruptible: true,
    blendInDuration: 0.1,
    blendOutDuration: 0.2,
    keyframes: [
      { time: 0, bones: { 
        LeftShoulder: { x: 0, y: 0, z: 0 }, RightShoulder: { x: 0, y: 0, z: 0 },
        Spine1: { x: 0, y: 0, z: 0 }
      }},
      { time: 0.25, bones: { 
        LeftShoulder: { x: 0.1, y: -0.1, z: 0 }, RightShoulder: { x: 0.1, y: 0.1, z: 0 },
        Spine1: { x: 0.02, y: 0, z: 0 }
      }},
      { time: 0.5, bones: { 
        LeftShoulder: { x: -0.1, y: 0, z: 0.05 }, RightShoulder: { x: -0.1, y: 0, z: -0.05 },
        Spine1: { x: -0.02, y: 0, z: 0 }
      }},
      { time: 0.75, bones: { 
        LeftShoulder: { x: 0.05, y: 0.05, z: 0 }, RightShoulder: { x: 0.05, y: -0.05, z: 0 },
        Spine1: { x: 0.01, y: 0, z: 0 }
      }},
      { time: 1.0, bones: { 
        LeftShoulder: { x: 0, y: 0, z: 0 }, RightShoulder: { x: 0, y: 0, z: 0 },
        Spine1: { x: 0, y: 0, z: 0 }
      }},
    ],
  },
  armStretch: {
    duration: 1.2,
    interruptible: true,
    blendInDuration: 0.15,
    blendOutDuration: 0.3,
    keyframes: [
      { time: 0, bones: { 
        LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
        LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
        Spine: { x: 0, y: 0, z: 0 }
      }},
      { time: 0.3, bones: { 
        LeftArm: { x: -0.3, y: 0.2, z: 0.8 }, RightArm: { x: -0.3, y: -0.2, z: -0.8 },
        LeftForeArm: { x: 0, y: 0, z: 0.1 }, RightForeArm: { x: 0, y: 0, z: -0.1 },
        Spine: { x: -0.05, y: 0, z: 0 }
      }},
      { time: 0.6, bones: { 
        LeftArm: { x: -0.4, y: 0.3, z: 0.7 }, RightArm: { x: -0.4, y: -0.3, z: -0.7 },
        LeftForeArm: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0 },
        Spine: { x: -0.08, y: 0, z: 0 }
      }},
      { time: 1.0, bones: { 
        LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
        LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
        Spine: { x: 0, y: 0, z: 0 }
      }},
    ],
  },
  handCheck: {
    duration: 1.0,
    interruptible: true,
    blendInDuration: 0.12,
    blendOutDuration: 0.25,
    keyframes: [
      { time: 0, bones: { 
        RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
        RightHand: { x: 0, y: 0, z: 0 }, Head: { x: 0, y: 0, z: 0 }
      }},
      { time: 0.25, bones: { 
        RightArm: { x: 0.6, y: 0.3, z: -0.4 }, RightForeArm: { x: 0.3, y: 0.2, z: -1.8 },
        RightHand: { x: -0.4, y: 0.2, z: 0 }, Head: { x: 0.1, y: -0.1, z: 0 }
      }},
      { time: 0.6, bones: { 
        RightArm: { x: 0.6, y: 0.3, z: -0.4 }, RightForeArm: { x: 0.3, y: 0.2, z: -1.8 },
        RightHand: { x: -0.3, y: 0.3, z: 0.1 }, Head: { x: 0.1, y: -0.1, z: 0 }
      }},
      { time: 1.0, bones: { 
        RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
        RightHand: { x: 0, y: 0, z: 0 }, Head: { x: 0, y: 0, z: 0 }
      }},
    ],
  },
};
 
 export interface GestureState {
   isPlaying: boolean;
   currentGesture: GestureType | null;
   startTime: number;
   blendingOut: boolean;
   blendOutStartTime: number;
 }
 
 /**
  * Create initial gesture state
  */
 export const createGestureState = (): GestureState => ({
   isPlaying: false,
   currentGesture: null,
   startTime: 0,
   blendingOut: false,
   blendOutStartTime: 0,
 });
 
 /**
  * Start playing a gesture
  */
 export const startGesture = (
   state: GestureState,
   gesture: GestureType,
   currentTime: number
 ): GestureState => {
   const definition = GESTURE_LIBRARY[gesture];
   if (!definition) return state;
   
   // If currently playing and not interruptible, don't start new gesture
   if (state.isPlaying && state.currentGesture) {
     const currentDef = GESTURE_LIBRARY[state.currentGesture];
     if (currentDef && !currentDef.interruptible && !state.blendingOut) {
       return state;
     }
   }
   
   return {
     isPlaying: true,
     currentGesture: gesture,
     startTime: currentTime,
     blendingOut: false,
     blendOutStartTime: 0,
   };
 };
 
 /**
  * Stop current gesture
  */
 export const stopGesture = (state: GestureState, currentTime: number): GestureState => {
   if (!state.isPlaying || !state.currentGesture) return state;
   
   return {
     ...state,
     blendingOut: true,
     blendOutStartTime: currentTime,
   };
 };
 
 /**
  * Interpolate between keyframes
  */
 const interpolateKeyframes = (
   keyframes: GestureKeyframe[],
   progress: number
 ): Record<string, BoneRotation> => {
   // Find surrounding keyframes
   let prev = keyframes[0];
   let next = keyframes[keyframes.length - 1];
   
   for (let i = 0; i < keyframes.length - 1; i++) {
     if (progress >= keyframes[i].time && progress < keyframes[i + 1].time) {
       prev = keyframes[i];
       next = keyframes[i + 1];
       break;
     }
   }
   
   // Calculate segment progress
   const segmentDuration = next.time - prev.time;
   const segmentProgress = segmentDuration > 0 
     ? (progress - prev.time) / segmentDuration 
     : 0;
   
   // Apply easing
   const easing = next.easing ?? easeInOutQuad;
   const eased = easing(segmentProgress);
   
   // Interpolate bone rotations
   const result: Record<string, BoneRotation> = {};
   const allBoneNames = new Set([
     ...Object.keys(prev.bones),
     ...Object.keys(next.bones)
   ]);
   
   allBoneNames.forEach(boneName => {
     const prevRot = prev.bones[boneName] ?? { x: 0, y: 0, z: 0 };
     const nextRot = next.bones[boneName] ?? prevRot;
     
     result[boneName] = lerpBoneRotation(prevRot, nextRot, eased);
   });
   
   return result;
 };
 
 /**
  * Update gesture and get current bones
  */
export const updateGesture = (
  state: GestureState,
  currentTime: number,
  onComplete?: () => void
): { bones: BoneMap | null; weight: number; state: GestureState; isComplete: boolean } => {
  if (!state.isPlaying || !state.currentGesture) {
    return { bones: null, weight: 0, state, isComplete: false };
  }
  
  const definition = GESTURE_LIBRARY[state.currentGesture];
  if (!definition) {
    return { bones: null, weight: 0, state: createGestureState(), isComplete: true };
  }
  
  let newState = { ...state };
  let weight = 1;
  
  // Calculate elapsed time
  const elapsed = currentTime - state.startTime;
  
  // Handle blend out (takes priority)
  if (state.blendingOut) {
    const blendOutProgress = (currentTime - state.blendOutStartTime) / definition.blendOutDuration;
    
    if (blendOutProgress >= 1) {
      // Gesture fully complete - call onComplete here after blend-out finishes
      onComplete?.();
      return { bones: null, weight: 0, state: createGestureState(), isComplete: true };
    }
    
    weight = 1 - easeInOutQuad(blendOutProgress);
  } else {
    // Handle blend in (smooth start)
    if (elapsed < definition.blendInDuration) {
      const blendInProgress = elapsed / definition.blendInDuration;
      weight = easeInOutQuad(blendInProgress);
    }
  }
  
  // Calculate gesture progress
  const progress = Math.min(elapsed / definition.duration, 1);
  
  // Check if gesture complete (start blend out)
  if (progress >= 1 && !state.blendingOut) {
    newState.blendingOut = true;
    newState.blendOutStartTime = currentTime;
  }
  
  // Interpolate keyframes
  const boneRotations = interpolateKeyframes(definition.keyframes, progress);
  
  // Convert to BoneMap
  const bones: BoneMap = {};
  Object.entries(boneRotations).forEach(([name, rotation]) => {
    bones[name] = { rotation };
  });
  
  return { bones, weight, state: newState, isComplete: false };
};