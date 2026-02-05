 /**
  * @file hooks/useGestureAnimation.ts
  * @description Hook for gesture animations using bone keyframe interpolation
  */
 
 import { useRef, useCallback, useEffect } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 // Gesture types
 export type GestureType = 
   | 'wave' | 'nod' | 'shrug' | 'clap' | 'point' | 'thumbsUp'
   // New social gestures
   | 'facepalm' | 'crossArms' | 'handOnHip' | 'nervousFidget' | 'emphasize';
 
 // Bone rotation configuration
 interface BoneRotation {
   x: number;
   y: number;
   z: number;
 }
 
 // Gesture keyframe
 interface GestureKeyframe {
   time: number; // 0-1 normalized progress
   bones: Record<string, BoneRotation>;
 }
 
 // Gesture duration in seconds
 const GESTURE_DURATIONS: Record<GestureType, number> = {
   wave: 1.5,
   nod: 0.8,
   shrug: 1.2,
   clap: 2.0,
   point: 1.0,
   thumbsUp: 1.2,
   // New gestures
   facepalm: 2.0,
   crossArms: 1.8,
   handOnHip: 1.5,
   nervousFidget: 2.5,
   emphasize: 1.8,
 };
 
 // Gesture keyframe definitions
 const GESTURE_KEYFRAMES: Record<GestureType, GestureKeyframe[]> = {
   wave: [
     { time: 0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: -0.1 } } },
     { time: 0.15, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: 0.4, z: 0 } } },
     { time: 0.3, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: -0.5, z: 0 } } },
     { time: 0.45, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: 0.5, z: 0 } } },
     { time: 0.6, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: -0.5, z: 0 } } },
     { time: 0.75, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: 0.4, z: 0 } } },
     { time: 1.0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: -0.1 } } },
   ],
   nod: [
     { time: 0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
     { time: 0.25, bones: { Head: { x: 0.2, y: 0, z: 0 }, Neck: { x: 0.08, y: 0, z: 0 } } },
     { time: 0.5, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
     { time: 0.75, bones: { Head: { x: 0.15, y: 0, z: 0 }, Neck: { x: 0.05, y: 0, z: 0 } } },
     { time: 1.0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
   ],
   shrug: [
     { time: 0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       Spine: { x: 0, y: 0, z: 0 }, Head: { x: 0, y: 0, z: 0 }
     }},
     { time: 0.3, bones: { 
       LeftArm: { x: -0.2, y: 0, z: 0.9 }, RightArm: { x: -0.2, y: 0, z: -0.9 },
       LeftForeArm: { x: 0, y: 0.3, z: 0.8 }, RightForeArm: { x: 0, y: -0.3, z: -0.8 },
       Spine: { x: 0, y: 0, z: 0.02 }, Head: { x: 0, y: 0, z: 0.05 }
     }},
     { time: 0.5, bones: { 
       LeftArm: { x: -0.3, y: 0, z: 0.8 }, RightArm: { x: -0.3, y: 0, z: -0.8 },
       LeftForeArm: { x: 0, y: 0.4, z: 1.0 }, RightForeArm: { x: 0, y: -0.4, z: -1.0 },
       Spine: { x: 0, y: 0, z: 0.03 }, Head: { x: 0, y: 0, z: 0.08 }
     }},
     { time: 0.7, bones: { 
       LeftArm: { x: -0.2, y: 0, z: 0.9 }, RightArm: { x: -0.2, y: 0, z: -0.9 },
       LeftForeArm: { x: 0, y: 0.3, z: 0.8 }, RightForeArm: { x: 0, y: -0.3, z: -0.8 },
       Spine: { x: 0, y: 0, z: 0.02 }, Head: { x: 0, y: 0, z: 0.05 }
     }},
     { time: 1.0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       Spine: { x: 0, y: 0, z: 0 }, Head: { x: 0, y: 0, z: 0 }
     }},
   ],
   clap: [
     { time: 0, bones: { 
       LeftArm: { x: 0.6, y: 0.3, z: 0.4 }, RightArm: { x: 0.6, y: -0.3, z: -0.4 },
       LeftForeArm: { x: 0, y: 0.2, z: 1.3 }, RightForeArm: { x: 0, y: -0.2, z: -1.3 }
     }},
     { time: 0.15, bones: { 
       LeftArm: { x: 0.5, y: 0, z: 0.3 }, RightArm: { x: 0.5, y: 0, z: -0.3 },
       LeftForeArm: { x: 0, y: 0.3, z: 1.6 }, RightForeArm: { x: 0, y: -0.3, z: -1.6 }
     }},
     { time: 0.25, bones: { 
       LeftArm: { x: 0.6, y: 0.3, z: 0.4 }, RightArm: { x: 0.6, y: -0.3, z: -0.4 },
       LeftForeArm: { x: 0, y: 0.2, z: 1.3 }, RightForeArm: { x: 0, y: -0.2, z: -1.3 }
     }},
     { time: 0.4, bones: { 
       LeftArm: { x: 0.5, y: 0, z: 0.3 }, RightArm: { x: 0.5, y: 0, z: -0.3 },
       LeftForeArm: { x: 0, y: 0.3, z: 1.6 }, RightForeArm: { x: 0, y: -0.3, z: -1.6 }
     }},
     { time: 0.55, bones: { 
       LeftArm: { x: 0.6, y: 0.3, z: 0.4 }, RightArm: { x: 0.6, y: -0.3, z: -0.4 },
       LeftForeArm: { x: 0, y: 0.2, z: 1.3 }, RightForeArm: { x: 0, y: -0.2, z: -1.3 }
     }},
     { time: 0.7, bones: { 
       LeftArm: { x: 0.5, y: 0, z: 0.3 }, RightArm: { x: 0.5, y: 0, z: -0.3 },
       LeftForeArm: { x: 0, y: 0.3, z: 1.6 }, RightForeArm: { x: 0, y: -0.3, z: -1.6 }
     }},
     { time: 0.85, bones: { 
       LeftArm: { x: 0.6, y: 0.3, z: 0.4 }, RightArm: { x: 0.6, y: -0.3, z: -0.4 },
       LeftForeArm: { x: 0, y: 0.2, z: 1.3 }, RightForeArm: { x: 0, y: -0.2, z: -1.3 }
     }},
     { time: 1.0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 }
     }},
   ],
   point: [
     { time: 0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
     { time: 0.3, bones: { RightArm: { x: -0.8, y: 0.2, z: -0.2 }, RightForeArm: { x: 0.3, y: 0, z: -0.5 }, RightHand: { x: -0.1, y: 0, z: 0 } } },
     { time: 0.7, bones: { RightArm: { x: -0.8, y: 0.2, z: -0.2 }, RightForeArm: { x: 0.3, y: 0, z: -0.5 }, RightHand: { x: -0.1, y: 0, z: 0 } } },
     { time: 1.0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
   ],
   thumbsUp: [
     { time: 0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
     { time: 0.25, bones: { RightArm: { x: -0.5, y: 0.4, z: -0.4 }, RightForeArm: { x: 0.5, y: 0.3, z: -1.8 }, RightHand: { x: -0.3, y: 0, z: 0.2 } } },
     { time: 0.75, bones: { RightArm: { x: -0.5, y: 0.4, z: -0.4 }, RightForeArm: { x: 0.5, y: 0.3, z: -1.8 }, RightHand: { x: -0.3, y: 0, z: 0.2 } } },
     { time: 1.0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
   ],
   
   // Facepalm - hand to forehead in frustration
   facepalm: [
     { time: 0, bones: { 
       RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 },
       Head: { x: 0, y: 0, z: 0 }, Spine: { x: 0, y: 0, z: 0 }
     }},
     { time: 0.3, bones: { 
       RightArm: { x: -1.0, y: 0.5, z: -0.2 }, RightForeArm: { x: 0.8, y: 0.3, z: -1.8 }, RightHand: { x: -0.4, y: 0, z: 0 },
       Head: { x: 0.15, y: 0, z: 0 }, Spine: { x: 0.05, y: 0, z: 0 }
     }},
     { time: 0.5, bones: { 
       RightArm: { x: -1.2, y: 0.4, z: 0 }, RightForeArm: { x: 1.2, y: 0.2, z: -1.5 }, RightHand: { x: -0.5, y: -0.2, z: 0 },
       Head: { x: 0.25, y: 0, z: 0 }, Spine: { x: 0.08, y: 0, z: 0 }
     }},
     { time: 0.8, bones: { 
       RightArm: { x: -1.2, y: 0.4, z: 0 }, RightForeArm: { x: 1.2, y: 0.2, z: -1.5 }, RightHand: { x: -0.5, y: -0.2, z: 0 },
       Head: { x: 0.2, y: 0.1, z: 0 }, Spine: { x: 0.06, y: 0, z: 0 }
     }},
     { time: 1.0, bones: { 
       RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 },
       Head: { x: 0, y: 0, z: 0 }, Spine: { x: 0, y: 0, z: 0 }
     }},
   ],
   
   // Cross arms - defensive/skeptical pose
   crossArms: [
     { time: 0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       Spine: { x: 0, y: 0, z: 0 }
     }},
     { time: 0.35, bones: { 
       LeftArm: { x: 0.4, y: 0.3, z: 0.6 }, RightArm: { x: 0.4, y: -0.3, z: -0.6 },
       LeftForeArm: { x: 0.3, y: 1.0, z: 1.4 }, RightForeArm: { x: 0.3, y: -1.0, z: -1.4 },
       Spine: { x: 0.03, y: 0, z: 0 }
     }},
     { time: 0.5, bones: { 
       LeftArm: { x: 0.5, y: 0.4, z: 0.4 }, RightArm: { x: 0.5, y: -0.4, z: -0.4 },
       LeftForeArm: { x: 0.4, y: 1.3, z: 1.6 }, RightForeArm: { x: 0.4, y: -1.3, z: -1.6 },
       Spine: { x: 0.04, y: 0, z: 0 }
     }},
     { time: 0.85, bones: { 
       LeftArm: { x: 0.5, y: 0.4, z: 0.4 }, RightArm: { x: 0.5, y: -0.4, z: -0.4 },
       LeftForeArm: { x: 0.4, y: 1.3, z: 1.6 }, RightForeArm: { x: 0.4, y: -1.3, z: -1.6 },
       Spine: { x: 0.04, y: 0, z: 0 }
     }},
     { time: 1.0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       Spine: { x: 0, y: 0, z: 0 }
     }},
   ],
   
   // Hand on hip - assertive stance
   handOnHip: [
     { time: 0, bones: { 
       RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       Spine: { x: 0, y: 0, z: 0 }, Hips: { x: 0, y: 0, z: 0 }
     }},
     { time: 0.35, bones: { 
       RightArm: { x: 0.3, y: -0.3, z: -0.8 }, RightForeArm: { x: 0.2, y: -0.8, z: -1.2 },
       Spine: { x: 0, y: 0.03, z: 0.02 }, Hips: { x: 0, y: 0, z: 0.02 }
     }},
     { time: 0.5, bones: { 
       RightArm: { x: 0.4, y: -0.4, z: -0.6 }, RightForeArm: { x: 0.3, y: -1.0, z: -1.4 },
       Spine: { x: 0, y: 0.05, z: 0.03 }, Hips: { x: 0, y: 0, z: 0.03 }
     }},
     { time: 0.85, bones: { 
       RightArm: { x: 0.4, y: -0.4, z: -0.6 }, RightForeArm: { x: 0.3, y: -1.0, z: -1.4 },
       Spine: { x: 0, y: 0.05, z: 0.03 }, Hips: { x: 0, y: 0, z: 0.03 }
     }},
     { time: 1.0, bones: { 
       RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       Spine: { x: 0, y: 0, z: 0 }, Hips: { x: 0, y: 0, z: 0 }
     }},
   ],
   
   // Nervous fidget - anxious hand wringing
   nervousFidget: [
     { time: 0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       LeftHand: { x: 0, y: 0, z: 0 }, RightHand: { x: 0, y: 0, z: 0 },
       Spine: { x: 0, y: 0, z: 0 }
     }},
     { time: 0.15, bones: { 
       LeftArm: { x: 0.4, y: 0.2, z: 0.7 }, RightArm: { x: 0.4, y: -0.2, z: -0.7 },
       LeftForeArm: { x: 0.3, y: 0.5, z: 1.2 }, RightForeArm: { x: 0.3, y: -0.5, z: -1.2 },
       LeftHand: { x: 0.1, y: 0.2, z: 0 }, RightHand: { x: 0.1, y: -0.2, z: 0 },
       Spine: { x: 0.02, y: 0, z: 0 }
     }},
     { time: 0.3, bones: { 
       LeftArm: { x: 0.5, y: 0.15, z: 0.65 }, RightArm: { x: 0.5, y: -0.15, z: -0.65 },
       LeftForeArm: { x: 0.4, y: 0.6, z: 1.3 }, RightForeArm: { x: 0.4, y: -0.6, z: -1.3 },
       LeftHand: { x: 0.15, y: 0.3, z: 0.1 }, RightHand: { x: 0.15, y: -0.3, z: -0.1 },
       Spine: { x: 0.03, y: 0.02, z: 0 }
     }},
     { time: 0.45, bones: { 
       LeftArm: { x: 0.4, y: 0.2, z: 0.7 }, RightArm: { x: 0.4, y: -0.2, z: -0.7 },
       LeftForeArm: { x: 0.3, y: 0.5, z: 1.2 }, RightForeArm: { x: 0.3, y: -0.5, z: -1.2 },
       LeftHand: { x: 0.1, y: -0.1, z: -0.1 }, RightHand: { x: 0.1, y: 0.1, z: 0.1 },
       Spine: { x: 0.02, y: -0.02, z: 0 }
     }},
     { time: 0.6, bones: { 
       LeftArm: { x: 0.5, y: 0.15, z: 0.65 }, RightArm: { x: 0.5, y: -0.15, z: -0.65 },
       LeftForeArm: { x: 0.4, y: 0.6, z: 1.3 }, RightForeArm: { x: 0.4, y: -0.6, z: -1.3 },
       LeftHand: { x: 0.2, y: 0.25, z: 0.05 }, RightHand: { x: 0.2, y: -0.25, z: -0.05 },
       Spine: { x: 0.03, y: 0.01, z: 0 }
     }},
     { time: 0.75, bones: { 
       LeftArm: { x: 0.4, y: 0.2, z: 0.7 }, RightArm: { x: 0.4, y: -0.2, z: -0.7 },
       LeftForeArm: { x: 0.3, y: 0.5, z: 1.2 }, RightForeArm: { x: 0.3, y: -0.5, z: -1.2 },
       LeftHand: { x: 0.1, y: 0.15, z: 0 }, RightHand: { x: 0.1, y: -0.15, z: 0 },
       Spine: { x: 0.02, y: 0, z: 0 }
     }},
     { time: 1.0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       LeftHand: { x: 0, y: 0, z: 0 }, RightHand: { x: 0, y: 0, z: 0 },
       Spine: { x: 0, y: 0, z: 0 }
     }},
   ],
   
   // Emphasize - talking with hands gesture
   emphasize: [
     { time: 0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       LeftHand: { x: 0, y: 0, z: 0 }, RightHand: { x: 0, y: 0, z: 0 }
     }},
     { time: 0.15, bones: { 
       LeftArm: { x: -0.3, y: 0.2, z: 0.7 }, RightArm: { x: -0.3, y: -0.2, z: -0.7 },
       LeftForeArm: { x: 0.2, y: 0.3, z: 0.9 }, RightForeArm: { x: 0.2, y: -0.3, z: -0.9 },
       LeftHand: { x: -0.2, y: 0.3, z: 0 }, RightHand: { x: -0.2, y: -0.3, z: 0 }
     }},
     { time: 0.35, bones: { 
       LeftArm: { x: -0.5, y: 0.3, z: 0.5 }, RightArm: { x: -0.5, y: -0.3, z: -0.5 },
       LeftForeArm: { x: 0.3, y: 0.4, z: 1.1 }, RightForeArm: { x: 0.3, y: -0.4, z: -1.1 },
       LeftHand: { x: -0.3, y: 0.4, z: 0.1 }, RightHand: { x: -0.3, y: -0.4, z: -0.1 }
     }},
     { time: 0.55, bones: { 
       LeftArm: { x: -0.3, y: 0.15, z: 0.8 }, RightArm: { x: -0.3, y: -0.15, z: -0.8 },
       LeftForeArm: { x: 0.2, y: 0.25, z: 0.8 }, RightForeArm: { x: 0.2, y: -0.25, z: -0.8 },
       LeftHand: { x: -0.15, y: 0.2, z: 0 }, RightHand: { x: -0.15, y: -0.2, z: 0 }
     }},
     { time: 0.75, bones: { 
       LeftArm: { x: -0.4, y: 0.25, z: 0.6 }, RightArm: { x: -0.4, y: -0.25, z: -0.6 },
       LeftForeArm: { x: 0.25, y: 0.35, z: 1.0 }, RightForeArm: { x: 0.25, y: -0.35, z: -1.0 },
       LeftHand: { x: -0.25, y: 0.35, z: 0.05 }, RightHand: { x: -0.25, y: -0.35, z: -0.05 }
     }},
     { time: 1.0, bones: { 
       LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
       LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
       LeftHand: { x: 0, y: 0, z: 0 }, RightHand: { x: 0, y: 0, z: 0 }
     }},
   ],
 };
 
 // Easing function for smooth animations
 const easeInOutQuad = (t: number): number => {
   return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
 };
 
 // Find a bone by name in the scene hierarchy
 const findBone = (scene: THREE.Object3D, name: string): THREE.Bone | null => {
   let bone: THREE.Bone | null = null;
   scene.traverse((child) => {
     if (child instanceof THREE.Bone && child.name === name) {
       bone = child;
     }
   });
   return bone;
 };
 
 // Interpolate between keyframes
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
   const eased = easeInOutQuad(segmentProgress);
   
   // Interpolate bone rotations
   const result: Record<string, BoneRotation> = {};
   const allBoneNames = new Set([
     ...Object.keys(prev.bones),
     ...Object.keys(next.bones)
   ]);
   
   allBoneNames.forEach(boneName => {
     const prevRot = prev.bones[boneName] ?? { x: 0, y: 0, z: 0 };
     const nextRot = next.bones[boneName] ?? prevRot;
     
     result[boneName] = {
       x: THREE.MathUtils.lerp(prevRot.x, nextRot.x, eased),
       y: THREE.MathUtils.lerp(prevRot.y, nextRot.y, eased),
       z: THREE.MathUtils.lerp(prevRot.z, nextRot.z, eased),
     };
   });
   
   return result;
 };
 
 export interface UseGestureAnimationOptions {
   enabled?: boolean;
   onComplete?: () => void;
 }
 
 export interface UseGestureAnimationReturn {
   playGesture: (gesture: GestureType) => void;
   stopGesture: () => void;
   isPlaying: boolean;
   currentGesture: GestureType | null;
 }
 
 /**
  * Hook for gesture animations using bone keyframe interpolation
  */
 export const useGestureAnimation = (
   scene: THREE.Object3D | null,
   options: UseGestureAnimationOptions = {}
 ): UseGestureAnimationReturn => {
   const { enabled = true, onComplete } = options;
   
   const isPlaying = useRef(false);
   const currentGesture = useRef<GestureType | null>(null);
   const startTime = useRef(0);
   const bonesCache = useRef<Map<string, THREE.Bone>>(new Map());
   
   // Cache bones on scene change
   useEffect(() => {
     bonesCache.current.clear();
     if (!scene) return;
     
     const boneNames = [
       'Head', 'Neck', 'Spine', 'Spine1', 'Spine2',
       'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm',
       'LeftHand', 'RightHand', 'Hips'
     ];
     
     boneNames.forEach(name => {
       const bone = findBone(scene, name);
       if (bone) bonesCache.current.set(name, bone);
     });
   }, [scene]);
   
   const playGesture = useCallback((gesture: GestureType) => {
     if (!enabled || !scene) return;
     
     isPlaying.current = true;
     currentGesture.current = gesture;
     startTime.current = -1; // Will be set on first frame
   }, [enabled, scene]);
   
   const stopGesture = useCallback(() => {
     isPlaying.current = false;
     currentGesture.current = null;
   }, []);
   
   // Animation frame
   useFrame(({ clock }) => {
     if (!isPlaying.current || !currentGesture.current || !scene) return;
     
     const gesture = currentGesture.current;
     const duration = GESTURE_DURATIONS[gesture];
     const keyframes = GESTURE_KEYFRAMES[gesture];
     
     // Initialize start time on first frame
     if (startTime.current < 0) {
       startTime.current = clock.getElapsedTime();
     }
     
     // Calculate progress
     const elapsed = clock.getElapsedTime() - startTime.current;
     const progress = Math.min(elapsed / duration, 1);
     
     // Get interpolated bone rotations
     const boneRotations = interpolateKeyframes(keyframes, progress);
     
     // Apply rotations to bones
     Object.entries(boneRotations).forEach(([boneName, rot]) => {
       const bone = bonesCache.current.get(boneName);
       if (bone) {
         bone.rotation.set(rot.x, rot.y, rot.z);
       }
     });
     
     // Check if complete
     if (progress >= 1) {
       isPlaying.current = false;
       currentGesture.current = null;
       onComplete?.();
     }
   });
   
   return {
     playGesture,
     stopGesture,
     isPlaying: isPlaying.current,
     currentGesture: currentGesture.current,
   };
 };
 
 export default useGestureAnimation;