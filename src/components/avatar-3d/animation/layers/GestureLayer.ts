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
   blendOutDuration: number;  // Seconds to blend back to base pose
 }
 
 // Expanded gesture library
 export const GESTURE_LIBRARY: Partial<Record<GestureType, GestureDefinition>> = {
   wave: {
     duration: 1.5,
     interruptible: true,
     blendOutDuration: 0.3,
     keyframes: [
       { time: 0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: -0.1 } } },
       { time: 0.15, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: 0.4, z: 0 } } },
       { time: 0.3, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: -0.5, z: 0 } } },
       { time: 0.45, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: 0.5, z: 0 } } },
       { time: 0.6, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: -0.5, z: 0 } } },
       { time: 0.75, bones: { RightArm: { x: -1.2, y: 0.3, z: -0.3 }, RightForeArm: { x: 0.2, y: 0.5, z: -1.5 }, RightHand: { x: 0, y: 0.4, z: 0 } } },
       { time: 1.0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: -0.1 } } },
     ],
   },
   nod: {
     duration: 0.8,
     interruptible: true,
     blendOutDuration: 0.2,
     keyframes: [
       { time: 0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
       { time: 0.25, bones: { Head: { x: 0.2, y: 0, z: 0 }, Neck: { x: 0.08, y: 0, z: 0 } } },
       { time: 0.5, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
       { time: 0.75, bones: { Head: { x: 0.15, y: 0, z: 0 }, Neck: { x: 0.05, y: 0, z: 0 } } },
       { time: 1.0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
     ],
   },
   shrug: {
     duration: 1.2,
     interruptible: true,
     blendOutDuration: 0.3,
     keyframes: [
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
   },
   clap: {
     duration: 2.0,
     interruptible: false,
     blendOutDuration: 0.3,
     keyframes: [
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
   },
   point: {
     duration: 1.0,
     interruptible: true,
     blendOutDuration: 0.25,
     keyframes: [
       { time: 0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
       { time: 0.3, bones: { RightArm: { x: -0.8, y: 0.2, z: -0.2 }, RightForeArm: { x: 0.3, y: 0, z: -0.5 }, RightHand: { x: -0.1, y: 0, z: 0 } } },
       { time: 0.7, bones: { RightArm: { x: -0.8, y: 0.2, z: -0.2 }, RightForeArm: { x: 0.3, y: 0, z: -0.5 }, RightHand: { x: -0.1, y: 0, z: 0 } } },
       { time: 1.0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
     ],
   },
   thumbsUp: {
     duration: 1.2,
     interruptible: true,
     blendOutDuration: 0.25,
     keyframes: [
       { time: 0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
       { time: 0.25, bones: { RightArm: { x: -0.5, y: 0.4, z: -0.4 }, RightForeArm: { x: 0.5, y: 0.3, z: -1.8 }, RightHand: { x: -0.3, y: 0, z: 0.2 } }, easing: easeOutBack },
       { time: 0.75, bones: { RightArm: { x: -0.5, y: 0.4, z: -0.4 }, RightForeArm: { x: 0.5, y: 0.3, z: -1.8 }, RightHand: { x: -0.3, y: 0, z: 0.2 } } },
       { time: 1.0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
     ],
   },
   headShake: {
     duration: 0.9,
     interruptible: true,
     blendOutDuration: 0.2,
     keyframes: [
       { time: 0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
       { time: 0.15, bones: { Head: { x: 0, y: -0.25, z: 0 }, Neck: { x: 0, y: -0.08, z: 0 } } },
       { time: 0.35, bones: { Head: { x: 0, y: 0.25, z: 0 }, Neck: { x: 0, y: 0.08, z: 0 } } },
       { time: 0.55, bones: { Head: { x: 0, y: -0.2, z: 0 }, Neck: { x: 0, y: -0.06, z: 0 } } },
       { time: 0.75, bones: { Head: { x: 0, y: 0.15, z: 0 }, Neck: { x: 0, y: 0.05, z: 0 } } },
       { time: 1.0, bones: { Head: { x: 0, y: 0, z: 0 }, Neck: { x: 0, y: 0, z: 0 } } },
     ],
   },
   celebrate: {
     duration: 1.8,
     interruptible: true,
     blendOutDuration: 0.4,
     keyframes: [
       { time: 0, bones: { 
         LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
         LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
         Spine: { x: 0, y: 0, z: 0 }
       }},
       { time: 0.2, bones: { 
         LeftArm: { x: -1.4, y: 0.2, z: 0.3 }, RightArm: { x: -1.4, y: -0.2, z: -0.3 },
         LeftForeArm: { x: 0.3, y: 0.2, z: 0.8 }, RightForeArm: { x: 0.3, y: -0.2, z: -0.8 },
         Spine: { x: -0.1, y: 0, z: 0 }
       }, easing: easeOutBack },
       { time: 0.5, bones: { 
         LeftArm: { x: -1.5, y: 0.3, z: 0.4 }, RightArm: { x: -1.5, y: -0.3, z: -0.4 },
         LeftForeArm: { x: 0.2, y: 0.3, z: 0.6 }, RightForeArm: { x: 0.2, y: -0.3, z: -0.6 },
         Spine: { x: -0.08, y: 0.02, z: 0 }
       }},
       { time: 0.8, bones: { 
         LeftArm: { x: -1.4, y: 0.2, z: 0.3 }, RightArm: { x: -1.4, y: -0.2, z: -0.3 },
         LeftForeArm: { x: 0.3, y: 0.2, z: 0.8 }, RightForeArm: { x: 0.3, y: -0.2, z: -0.8 },
         Spine: { x: -0.1, y: -0.02, z: 0 }
       }},
       { time: 1.0, bones: { 
         LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
         LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
         Spine: { x: 0, y: 0, z: 0 }
       }},
     ],
   },
   thinkingPose: {
     duration: 1.5,
     interruptible: true,
     blendOutDuration: 0.4,
     keyframes: [
       { time: 0, bones: { 
         RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
         Head: { x: 0, y: 0, z: 0 }, Spine: { x: 0, y: 0, z: 0 }
       }},
       { time: 0.3, bones: { 
         RightArm: { x: 0.9, y: 0, z: -0.2 }, RightForeArm: { x: 0, y: 0, z: -2.0 },
         RightHand: { x: -0.3, y: 0, z: 0 },
         Head: { x: -0.08, y: 0, z: 0.04 }, Spine: { x: -0.02, y: 0.02, z: 0 }
       }},
       { time: 0.7, bones: { 
         RightArm: { x: 0.9, y: 0, z: -0.2 }, RightForeArm: { x: 0, y: 0, z: -2.0 },
         RightHand: { x: -0.3, y: 0, z: 0 },
         Head: { x: -0.1, y: 0.05, z: 0.04 }, Spine: { x: -0.02, y: 0.02, z: 0 }
       }},
       { time: 1.0, bones: { 
         RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 },
         RightHand: { x: 0, y: 0, z: 0 },
         Head: { x: 0, y: 0, z: 0 }, Spine: { x: 0, y: 0, z: 0 }
       }},
     ],
   },
   welcome: {
     duration: 1.4,
     interruptible: true,
     blendOutDuration: 0.3,
     keyframes: [
       { time: 0, bones: { 
         LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
         LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 }
       }},
       { time: 0.25, bones: { 
         LeftArm: { x: -0.6, y: 0.3, z: 0.6 }, RightArm: { x: -0.6, y: -0.3, z: -0.6 },
         LeftForeArm: { x: 0.2, y: 0.2, z: 0.4 }, RightForeArm: { x: 0.2, y: -0.2, z: -0.4 }
       }, easing: easeOutBack },
       { time: 0.7, bones: { 
         LeftArm: { x: -0.6, y: 0.3, z: 0.6 }, RightArm: { x: -0.6, y: -0.3, z: -0.6 },
         LeftForeArm: { x: 0.2, y: 0.2, z: 0.4 }, RightForeArm: { x: 0.2, y: -0.2, z: -0.4 }
       }},
       { time: 1.0, bones: { 
         LeftArm: { x: 0.1, y: 0, z: 1.2 }, RightArm: { x: 0.1, y: 0, z: -1.2 },
         LeftForeArm: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: -0.3 }
       }},
     ],
   },
   dismiss: {
     duration: 0.8,
     interruptible: true,
     blendOutDuration: 0.2,
     keyframes: [
       { time: 0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
       { time: 0.2, bones: { RightArm: { x: -0.4, y: 0.3, z: -0.5 }, RightForeArm: { x: 0.2, y: 0.2, z: -1.0 }, RightHand: { x: 0, y: 0.3, z: 0 } } },
       { time: 0.4, bones: { RightArm: { x: -0.4, y: -0.1, z: -0.6 }, RightForeArm: { x: 0.2, y: -0.1, z: -0.8 }, RightHand: { x: 0, y: -0.2, z: 0 } } },
       { time: 0.6, bones: { RightArm: { x: -0.3, y: 0.2, z: -0.7 }, RightForeArm: { x: 0.1, y: 0.1, z: -0.6 }, RightHand: { x: 0, y: 0.1, z: 0 } } },
       { time: 1.0, bones: { RightArm: { x: 0.1, y: 0, z: -1.2 }, RightForeArm: { x: 0, y: 0, z: -0.3 }, RightHand: { x: 0, y: 0, z: 0 } } },
     ],
   },
   listenNod: {
     duration: 1.5,
     interruptible: true,
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
 ): { bones: BoneMap | null; weight: number; state: GestureState } => {
   if (!state.isPlaying || !state.currentGesture) {
     return { bones: null, weight: 0, state };
   }
   
   const definition = GESTURE_LIBRARY[state.currentGesture];
   if (!definition) {
     return { bones: null, weight: 0, state: createGestureState() };
   }
   
   let newState = { ...state };
   let weight = 1;
   
   // Handle blend out
   if (state.blendingOut) {
     const blendOutProgress = (currentTime - state.blendOutStartTime) / definition.blendOutDuration;
     
     if (blendOutProgress >= 1) {
       onComplete?.();
       return { bones: null, weight: 0, state: createGestureState() };
     }
     
     weight = 1 - easeInOutQuad(blendOutProgress);
   }
   
   // Calculate gesture progress
   const elapsed = currentTime - state.startTime;
   const progress = Math.min(elapsed / definition.duration, 1);
   
   // Check if gesture complete
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
   
   return { bones, weight, state: newState };
 };