 /**
  * @file animation/layers/IdleProceduralLayer.ts
  * @description Procedural idle animations: breathing, weight shift, micro-movements
  */
 
 import * as THREE from 'three';
 import { BoneMap, BoneRotation, QualityConfig } from '../types';
 
 export interface IdleConfig {
   // Breathing
   breathRate: number;          // Breaths per minute (12-20)
   breathDepth: number;         // How visible (0.3-1.0)
   breathVariation: number;     // Randomness (0-0.3)
   
   // Weight shifting
   shiftFrequency: number;      // How often (0.15-0.3 Hz)
   shiftMagnitude: number;      // How much (0.3-1.0)
   
   // Micro-movements
   microMovementScale: number;  // Subtle adjustments (0-1)
   
   // Character personality
   energyLevel: number;         // Affects all movement (0.5-1.5)
 }
 
 export const DEFAULT_IDLE_CONFIG: IdleConfig = {
   breathRate: 15,
   breathDepth: 0.7,
   breathVariation: 0.15,
   shiftFrequency: 0.2,
   shiftMagnitude: 0.6,
   microMovementScale: 0.7,
   energyLevel: 1.0,
 };
 
 // Noise function for organic randomness
 const noise = (seed: number): number => {
   const x = Math.sin(seed * 12.9898 + Math.cos(seed * 78.233)) * 43758.5453;
   return x - Math.floor(x);
 };
 
 // Multi-octave noise for smoother variation
 const smoothNoise = (t: number, octaves: number = 3): number => {
   let value = 0;
   let amplitude = 1;
   let frequency = 1;
   let totalAmplitude = 0;
   
   for (let i = 0; i < octaves; i++) {
     value += Math.sin(t * frequency) * amplitude;
     totalAmplitude += amplitude;
     amplitude *= 0.5;
     frequency *= 2;
   }
   
   return value / totalAmplitude;
 };
 
 /**
  * Calculate breathing animation bones
  */
 export const calculateBreathing = (
   time: number,
   config: IdleConfig,
   phaseOffset: number = 0
 ): BoneMap => {
   const adjustedTime = time + phaseOffset;
   const breathCycle = (config.breathRate / 60) * Math.PI * 2;
   
   // Breathing rhythm with slight variation
   const variation = 1 + smoothNoise(adjustedTime * 0.1) * config.breathVariation;
   const breathPhase = adjustedTime * breathCycle * variation;
   
   // Inhale is slower than exhale (natural breathing pattern)
   const breathValue = Math.sin(breathPhase);
   const inhaleValue = Math.max(0, breathValue);
   const exhaleValue = Math.max(0, -breathValue) * 0.7; // Exhale is gentler
   const breath = (inhaleValue - exhaleValue) * config.breathDepth * config.energyLevel;
   
   return {
     Spine: { rotation: { x: breath * -0.008, y: 0, z: 0 } },
     Spine1: { rotation: { x: breath * -0.012, y: 0, z: 0 } },
     Spine2: { rotation: { x: breath * -0.006, y: 0, z: 0 } },
     // Shoulders rise slightly on inhale
     LeftShoulder: { rotation: { x: 0, y: breath * -0.01, z: 0 } },
     RightShoulder: { rotation: { x: 0, y: breath * 0.01, z: 0 } },
     // Very subtle head movement with breath
     Head: { rotation: { x: breath * 0.004, y: 0, z: 0 } },
   };
 };
 
 /**
  * Calculate weight shift animation bones
  */
 export const calculateWeightShift = (
   time: number,
   config: IdleConfig,
   phaseOffset: number = 0
 ): BoneMap => {
   const adjustedTime = time + phaseOffset;
   const shiftCycle = config.shiftFrequency * Math.PI * 2;
   
   // Slow, organic weight shifting
   const shift = smoothNoise(adjustedTime * shiftCycle, 2) * config.shiftMagnitude * config.energyLevel;
   const secondaryShift = smoothNoise(adjustedTime * shiftCycle * 0.7 + 1.5, 2) * config.shiftMagnitude * 0.5;
   
   return {
     Hips: { 
       rotation: { 
         x: 0, 
         y: shift * 0.008, 
         z: shift * 0.012 
       } 
     },
     Spine: { 
       rotation: { 
         x: 0, 
         y: -shift * 0.005, // Counter-rotate spine
         z: -shift * 0.008 
       } 
     },
     // Subtle knee/hip compensation (using spine as proxy)
     Spine1: { 
       rotation: { 
         x: 0, 
         y: secondaryShift * 0.003, 
         z: 0 
       } 
     },
   };
 };
 
 /**
  * Calculate micro-movement animation bones
  */
 export const calculateMicroMovements = (
   time: number,
   config: IdleConfig,
   phaseOffset: number = 0
 ): BoneMap => {
   const adjustedTime = time + phaseOffset;
   const scale = config.microMovementScale * config.energyLevel;
   
   // Very subtle, random-feeling movements
   const headJitter = smoothNoise(adjustedTime * 0.8, 2) * scale;
   const fingerTwitch = noise(adjustedTime * 2) > 0.95 ? smoothNoise(adjustedTime * 3) * scale : 0;
   const armDrift = smoothNoise(adjustedTime * 0.3 + 2, 2) * scale;
   
   return {
     Head: { 
       rotation: { 
         x: headJitter * 0.008, 
         y: smoothNoise(adjustedTime * 0.5 + 1) * scale * 0.012, 
         z: headJitter * 0.004 
       } 
     },
     Neck: {
       rotation: {
         x: headJitter * 0.004,
         y: smoothNoise(adjustedTime * 0.4) * scale * 0.006,
         z: 0
       }
     },
     // Subtle arm drift
     LeftArm: { 
       rotation: { 
         x: armDrift * 0.01, 
         y: 0, 
         z: smoothNoise(adjustedTime * 0.4) * scale * 0.015 
       } 
     },
     RightArm: { 
       rotation: { 
         x: armDrift * 0.01, 
         y: 0, 
         z: smoothNoise(adjustedTime * 0.4 + 0.5) * scale * -0.015 
       } 
     },
     // Occasional finger movement
     LeftHand: { rotation: { x: fingerTwitch * 0.05, y: 0, z: fingerTwitch * 0.02 } },
     RightHand: { rotation: { x: fingerTwitch * 0.05, y: 0, z: -fingerTwitch * 0.02 } },
   };
 };
 
 /**
  * Get complete idle layer bones based on quality settings
  */
 export const calculateIdleLayer = (
   time: number,
   config: IdleConfig,
   quality: QualityConfig,
   phaseOffset: number = 0
 ): BoneMap => {
   let result: BoneMap = {};
   
   // Breathing is always on (but detail varies by quality)
   const breathConfig = { ...config };
   if (quality.breathingDetail === 'minimal') {
     breathConfig.breathDepth *= 0.5;
   }
   result = mergeIdleBones(result, calculateBreathing(time, breathConfig, phaseOffset));
   
   // Weight shift (if enabled)
   if (quality.enableWeightShift) {
     result = mergeIdleBones(result, calculateWeightShift(time, config, phaseOffset));
   }
   
   // Micro-movements (if enabled)
   if (quality.enableMicroMovements) {
     result = mergeIdleBones(result, calculateMicroMovements(time, config, phaseOffset));
   }
   
   return result;
 };
 
 /**
  * Merge idle bone adjustments (additive)
  */
 const mergeIdleBones = (base: BoneMap, additions: BoneMap): BoneMap => {
   const result = { ...base };
   
   Object.entries(additions).forEach(([boneName, state]) => {
     if (!result[boneName]) {
       result[boneName] = { rotation: { x: 0, y: 0, z: 0 } };
     }
     result[boneName] = {
       rotation: {
         x: (result[boneName].rotation?.x ?? 0) + state.rotation.x,
         y: (result[boneName].rotation?.y ?? 0) + state.rotation.y,
         z: (result[boneName].rotation?.z ?? 0) + state.rotation.z,
       },
     };
   });
   
   return result;
 };