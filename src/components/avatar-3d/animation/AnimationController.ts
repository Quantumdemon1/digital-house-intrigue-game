 /**
  * @file animation/AnimationController.ts
  * @description Master animation controller hook that orchestrates all animation layers
  */
 
 import { useRef, useEffect, useCallback } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 import {
   PoseType,
   GestureType,
   QualityLevel,
   QualityConfig,
   QUALITY_PRESETS,
   RelationshipContext,
   AnimationControllerState,
   BoneMap,
 } from './types';
 import { findBones, applyBoneMap, blendBoneMaps } from './utils/boneUtils';
 import {
   PoseTransitionState,
   createPoseTransition,
   startPoseTransition,
   updatePoseTransition,
 } from './layers/BasePoseLayer';
 import {
   IdleConfig,
   DEFAULT_IDLE_CONFIG,
   calculateIdleLayer,
 } from './layers/IdleProceduralLayer';
 import {
   LookAtConfig,
   LookAtState,
   DEFAULT_LOOKAT_CONFIG,
   createLookAtState,
   updateLookAt,
 } from './layers/LookAtLayer';
 import {
   GestureState,
   createGestureState,
   startGesture,
   stopGesture,
   updateGesture,
 } from './layers/GestureLayer';
 import {
   ReactiveState,
   createReactiveState,
   updateReactiveExpressions,
 } from './layers/ReactiveLayer';
 import {
   BlinkState,
   BlinkConfig,
   DEFAULT_BLINK_CONFIG,
   createBlinkState,
   updateBlink,
   getBlinkMorphs,
 } from './expressions/BlinkController';
 import {
   SecondaryMotionState,
   createSecondaryMotionState,
   updateSecondaryMotion,
 } from './physics/SecondaryMotionSystem';
import { POSE_CONFIGS } from './layers/BasePoseLayer';
import { applyBoneMap as applyBoneMapDirect } from './utils/boneUtils';
 
// Mobile detection for physics disable
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
};

 // ============ Configuration ============
 
 export interface AnimationControllerConfig {
   // Scene refs
   scene: THREE.Object3D | null;
   skinnedMeshes: THREE.SkinnedMesh[];
   
   // Base pose
   basePose: PoseType;
   phaseOffset?: number;
   
   // Look-at
   lookAtTarget: THREE.Vector3 | null;
   characterPosition: [number, number, number];
   characterRotationY: number;
   
   // Social context
   relationshipContext: RelationshipContext;
   
   // Gesture (player only)
   gestureToPlay: GestureType | null;
   onGestureComplete?: () => void;
   
   // Options
   quality: QualityLevel;
   enabled?: boolean;
 }
 
 // ============ State ============
 
 interface ControllerState {
   poseTransition: PoseTransitionState;
   lookAt: LookAtState;
   gesture: GestureState;
   reactive: ReactiveState;
   blink: BlinkState;
   secondaryMotion: SecondaryMotionState;
   lastTime: number;
   boneCache: Map<string, THREE.Bone>;
   initialized: boolean;
 }
 
 // All bone names we might manipulate
 const ALL_BONE_NAMES = [
   'Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head',
   'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand',
   'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
    // Mixamo bone naming variants (used by some RPM models)
    'mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 
    'mixamorigNeck', 'mixamorigHead',
    'mixamorigLeftShoulder', 'mixamorigLeftArm', 'mixamorigLeftForeArm', 'mixamorigLeftHand',
    'mixamorigRightShoulder', 'mixamorigRightArm', 'mixamorigRightForeArm', 'mixamorigRightHand',
 ];
 
 // ============ Main Hook ============
 
 export const useAnimationController = (config: AnimationControllerConfig): AnimationControllerState => {
   const {
     scene,
     skinnedMeshes,
     basePose,
     phaseOffset = 0,
     lookAtTarget,
     characterPosition,
     characterRotationY,
     relationshipContext,
     gestureToPlay,
     onGestureComplete,
     quality,
     enabled = true,
   } = config;
   
   const qualityConfig = QUALITY_PRESETS[quality];
   
   // Internal state
   const stateRef = useRef<ControllerState>({
     poseTransition: createPoseTransition(basePose),
     lookAt: createLookAtState(),
     gesture: createGestureState(),
     reactive: createReactiveState(),
     blink: createBlinkState(0),
     secondaryMotion: createSecondaryMotionState(),
     lastTime: 0,
     boneCache: new Map(),
     initialized: false,
   });
   
   // Track last gesture to detect changes
   const lastGestureRef = useRef<GestureType | null>(null);
    
    // Track retry attempts for bone discovery
    const retryCountRef = useRef(0);
    const MAX_BONE_RETRIES = 10;
   
   // Initialize bones when scene changes
   useEffect(() => {
     if (!scene || !enabled) {
       stateRef.current.initialized = false;
        retryCountRef.current = 0;
       return;
     }
     
      // Bone discovery with retry mechanism
      const attemptBoneDiscovery = () => {
        stateRef.current.boneCache = findBones(scene, ALL_BONE_NAMES);
        
        if (stateRef.current.boneCache.size === 0 && retryCountRef.current < MAX_BONE_RETRIES) {
          retryCountRef.current++;
          requestAnimationFrame(attemptBoneDiscovery);
          return;
        }
        
        stateRef.current.initialized = stateRef.current.boneCache.size > 0;
        stateRef.current.poseTransition = createPoseTransition(basePose);
        
        // CRITICAL: Apply initial pose immediately to prevent T-pose flash
        if (stateRef.current.initialized) {
          const initialBones = POSE_CONFIGS[basePose];
          if (initialBones) {
            // Apply pose with normalized bone names for mixamo compatibility
            applyBoneMapWithNormalization(stateRef.current.boneCache, initialBones, 1);
          }
        }
      };
      
      attemptBoneDiscovery();
   }, [scene, enabled, basePose]);
   
   // Handle gesture trigger
   useEffect(() => {
     if (gestureToPlay && gestureToPlay !== lastGestureRef.current) {
       stateRef.current.gesture = startGesture(
         stateRef.current.gesture,
         gestureToPlay,
         stateRef.current.lastTime
       );
       lastGestureRef.current = gestureToPlay;
     } else if (!gestureToPlay && lastGestureRef.current) {
       lastGestureRef.current = null;
     }
   }, [gestureToPlay]);
   
   // Handle pose changes
   useEffect(() => {
     if (stateRef.current.initialized && basePose !== stateRef.current.poseTransition.toPose) {
       stateRef.current.poseTransition = startPoseTransition(
         stateRef.current.poseTransition,
         basePose,
         stateRef.current.lastTime
       );
     }
   }, [basePose]);
   
   // Main animation frame
   useFrame(({ clock }) => {
     if (!enabled || !stateRef.current.initialized || skinnedMeshes.length === 0) return;
     
     const state = stateRef.current;
     const time = clock.getElapsedTime();
     const deltaTime = time - state.lastTime;
     state.lastTime = time;
     
     // Avoid huge delta on first frame
     if (deltaTime > 0.1) return;
     
     // ============ Layer 1: Base Pose ============
     const { bones: baseBones, state: newPoseState } = updatePoseTransition(
       state.poseTransition,
       time
     );
     state.poseTransition = newPoseState;
     
     // ============ Layer 2: Idle Procedural ============
     const idleBones = calculateIdleLayer(time, DEFAULT_IDLE_CONFIG, qualityConfig, phaseOffset);
     
     // ============ Layer 3: Look-At ============
     let lookAtBones: BoneMap = {};
     let eyeMorphs: Record<string, number> = {};
     
     if (lookAtTarget) {
       const lookAtConfig: LookAtConfig = {
         ...DEFAULT_LOOKAT_CONFIG,
         targetPosition: lookAtTarget,
         characterPosition,
         characterRotationY,
       };
       
       const lookAtResult = updateLookAt(state.lookAt, lookAtConfig, time, deltaTime);
       lookAtBones = lookAtResult.bones;
       eyeMorphs = lookAtResult.eyeMorphs;
       state.lookAt = lookAtResult.state;
     }
     
     // ============ Layer 4: Reactive Expressions ============
     let reactiveMorphs: Record<string, number> = {};
     
     if (qualityConfig.enableExpressions) {
       const reactiveResult = updateReactiveExpressions(
         state.reactive,
         relationshipContext
       );
       reactiveMorphs = reactiveResult.morphs;
       state.reactive = reactiveResult.state;
     }
     
     // ============ Layer 5: Gestures ============
     const { bones: gestureBones, weight: gestureWeight, state: newGestureState } = updateGesture(
       state.gesture,
       time,
       onGestureComplete
     );
     state.gesture = newGestureState;
     
     // ============ Blend Layers ============
     // Priority: Gesture > Look-At > Idle > Base
     const layers: Array<{ bones: BoneMap; weight: number }> = [];
     
     // Base pose (always weight 1)
     layers.push({ bones: baseBones, weight: 1 });
     
     // Idle is additive to base
     const combinedBase = additiveBoneBlend(baseBones, idleBones);
     
     // Start with combined base
     let finalBones = combinedBase;
     
     // Blend in look-at (only affects head/neck)
     if (Object.keys(lookAtBones).length > 0) {
       finalBones = overrideBones(finalBones, lookAtBones, 1);
     }
     
     // Blend in gesture if playing
     if (gestureBones && gestureWeight > 0) {
       finalBones = overrideBones(finalBones, gestureBones, gestureWeight);
     }
     
       // ============ Secondary Motion Layer (Physics) ============
       let physicsFilteredBones = finalBones;
      // Disable physics on mobile for stability
      const enablePhysics = qualityConfig.enablePhysics && !isMobileDevice();
      if (enablePhysics) {
         const physicsResult = updateSecondaryMotion(
           state.secondaryMotion,
           finalBones,
           deltaTime,
           true
         );
         physicsFilteredBones = physicsResult.bones;
         state.secondaryMotion = physicsResult.state;
       }
       
       // ============ Apply Bones ============
       applyBoneMap(state.boneCache, physicsFilteredBones, 1);
     
     // ============ Apply Morph Targets ============
     // Blink
     const blinkResult = updateBlink(state.blink, DEFAULT_BLINK_CONFIG, time);
     state.blink = blinkResult.state;
     const blinkMorphs = getBlinkMorphs(blinkResult.value);
     
     // Combine all morphs (blink + eye tracking + reactive)
     const allMorphs = { ...blinkMorphs, ...eyeMorphs, ...reactiveMorphs };
     
     // Apply to skinned meshes
     applyMorphTargets(skinnedMeshes, allMorphs);
   });
   
   // Return current state
   return {
     isGesturePlaying: stateRef.current.gesture.isPlaying,
     currentGesture: stateRef.current.gesture.currentGesture,
     currentPose: stateRef.current.poseTransition.toPose,
     currentExpression: stateRef.current.reactive.currentExpression,
   };
 };
 
 // ============ Helper Functions ============
 
 /**
  * Additive blend: add idle adjustments to base pose
  */
 const additiveBoneBlend = (base: BoneMap, additive: BoneMap): BoneMap => {
   const result: BoneMap = { ...base };
   
   Object.entries(additive).forEach(([boneName, state]) => {
     if (result[boneName]) {
       result[boneName] = {
         rotation: {
           x: result[boneName].rotation.x + state.rotation.x,
           y: result[boneName].rotation.y + state.rotation.y,
           z: result[boneName].rotation.z + state.rotation.z,
         },
       };
     } else {
       result[boneName] = state;
     }
   });
   
   return result;
 };
 
 /**
  * Override specific bones with weighted blend
  */
 const overrideBones = (base: BoneMap, override: BoneMap, weight: number): BoneMap => {
   const result: BoneMap = { ...base };
   
   Object.entries(override).forEach(([boneName, state]) => {
     if (result[boneName]) {
       result[boneName] = {
         rotation: {
           x: THREE.MathUtils.lerp(result[boneName].rotation.x, state.rotation.x, weight),
           y: THREE.MathUtils.lerp(result[boneName].rotation.y, state.rotation.y, weight),
           z: THREE.MathUtils.lerp(result[boneName].rotation.z, state.rotation.z, weight),
         },
       };
     } else {
       result[boneName] = {
         rotation: {
           x: state.rotation.x * weight,
           y: state.rotation.y * weight,
           z: state.rotation.z * weight,
         },
       };
     }
   });
   
   return result;
 };
 
 /**
  * Apply morph targets to skinned meshes
  */
 const applyMorphTargets = (
   meshes: THREE.SkinnedMesh[],
   morphs: Record<string, number>
 ): void => {
   meshes.forEach(mesh => {
     if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
     
     Object.entries(morphs).forEach(([morphName, value]) => {
       const index = mesh.morphTargetDictionary![morphName];
       if (index !== undefined) {
         // Take max of current and new value (for layering blinks + expressions)
         mesh.morphTargetInfluences![index] = Math.max(
           mesh.morphTargetInfluences![index] ?? 0,
           value
         );
       }
     });
   });
 };
 
 export default useAnimationController;

/**
 * Apply bone map with normalization for mixamo bone naming
 */
const applyBoneMapWithNormalization = (
  boneCache: Map<string, THREE.Bone>,
  boneMap: BoneMap,
  blend: number
): void => {
  // First try direct application
  applyBoneMapDirect(boneCache, boneMap, blend);
  
  // Then try with mixamo prefix for any bones that might use that naming
  Object.entries(boneMap).forEach(([boneName, state]) => {
    const mixamoName = `mixamorig${boneName}`;
    const bone = boneCache.get(mixamoName);
    if (bone) {
      if (blend >= 1) {
        bone.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
      } else {
        bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, state.rotation.x, blend);
        bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, state.rotation.y, blend);
        bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, state.rotation.z, blend);
      }
    }
  });
};