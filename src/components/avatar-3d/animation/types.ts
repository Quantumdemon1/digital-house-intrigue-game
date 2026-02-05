 /**
  * @file animation/types.ts
  * @description Core types for the unified animation system
  */
 
 import * as THREE from 'three';
 
 // ============ Core Types ============
 
 export interface BoneRotation {
   x: number;
   y: number;
   z: number;
 }
 
 export interface BoneState {
   rotation: BoneRotation;
   position?: { x: number; y: number; z: number };
 }
 
 export type BoneMap = Record<string, BoneState>;
 
 // ============ Animation Layer Types ============
 
 export type AnimationLayerType = 
   | 'base'
   | 'idle'
   | 'lookAt'
   | 'reactive'
   | 'gesture';
 
 export interface AnimationLayer {
   type: AnimationLayerType;
   priority: number;
   weight: number;
   bones: BoneMap;
   morphTargets: Record<string, number>;
 }
 
 // Layer priorities (higher = more important)
 export const LAYER_PRIORITIES: Record<AnimationLayerType, number> = {
   base: 0,
   idle: 1,
   lookAt: 2,
   reactive: 3,
   gesture: 4,
 };
 
 // ============ Physics Types ============
 
 export interface SpringConfig {
   stiffness: number;  // How fast it returns to rest (0.1-1.0)
   damping: number;    // How quickly oscillations decay (0.1-1.0)
   mass: number;       // Weight affects momentum
 }
 
 export interface SpringState {
   position: number;
   velocity: number;
   target: number;
 }
 
 // ============ Pose Types ============
 
 export type PoseType = 
   | 'relaxed'
   | 'crossed-arms'
   | 'hands-on-hips'
   | 'thinking'
   | 'casual-lean';
 
 // ============ Gesture Types ============
 
 export type GestureType =
   // Original
   | 'wave' | 'nod' | 'shrug' | 'clap' | 'point' | 'thumbsUp'
   // New social gestures
   | 'headShake' | 'facepalm' | 'crossArms' | 'handOnHip'
   | 'celebrate' | 'thinkingPose' | 'nervousFidget'
   // Conversational
   | 'listenNod' | 'emphasize' | 'dismiss' | 'welcome';
 
 // ============ Expression Types ============
 
 export type EmotionType = 
   | 'happy' | 'sad' | 'angry' | 'surprised'
   | 'disgusted' | 'fearful' | 'neutral';
 
 export type ReactiveExpressionType =
   | 'curiosity' | 'jealousy' | 'admiration' | 'confidence'
   | 'concern' | 'respect' | 'surprise' | 'neutral';
 
 export interface EmotionalState {
   primary: EmotionType;
   intensity: number;  // 0-1
   secondary?: EmotionType;
   secondaryIntensity?: number;
 }
 
 // ============ Character Context ============
 
 export interface RelationshipContext {
   score: number;        // -100 to 100
   isNominee: boolean;
   isHoH: boolean;
   isSelf: boolean;
   hasSelection: boolean;
 }
 
 // ============ Quality Presets ============
 
 export type QualityLevel = 'low' | 'medium' | 'high';
 
 export interface QualityConfig {
   enablePhysics: boolean;
   enableMicroMovements: boolean;
   enableWeightShift: boolean;
   enableExpressions: boolean;
   enableEyeTracking: boolean;
   breathingDetail: 'minimal' | 'basic' | 'full';
 }
 
 export const QUALITY_PRESETS: Record<QualityLevel, QualityConfig> = {
   low: {
     enablePhysics: false,
     enableMicroMovements: false,
     enableWeightShift: false,
     enableExpressions: false,
     enableEyeTracking: false,
     breathingDetail: 'minimal',
   },
   medium: {
     enablePhysics: false,
     enableMicroMovements: true,
     enableWeightShift: true,
     enableExpressions: true,
     enableEyeTracking: true,
     breathingDetail: 'basic',
   },
   high: {
     enablePhysics: true,
     enableMicroMovements: true,
     enableWeightShift: true,
     enableExpressions: true,
     enableEyeTracking: true,
     breathingDetail: 'full',
   },
 };
 
 // ============ Bone Names ============
 
 export const BONE_NAMES = {
   // Core
   hips: 'Hips',
   spine: 'Spine',
   spine1: 'Spine1',
   spine2: 'Spine2',
   neck: 'Neck',
   head: 'Head',
   // Left arm
   leftShoulder: 'LeftShoulder',
   leftArm: 'LeftArm',
   leftForeArm: 'LeftForeArm',
   leftHand: 'LeftHand',
   // Right arm
   rightShoulder: 'RightShoulder',
   rightArm: 'RightArm',
   rightForeArm: 'RightForeArm',
   rightHand: 'RightHand',
   // Legs (for future use)
   leftUpLeg: 'LeftUpLeg',
   leftLeg: 'LeftLeg',
   leftFoot: 'LeftFoot',
   rightUpLeg: 'RightUpLeg',
   rightLeg: 'RightLeg',
   rightFoot: 'RightFoot',
 } as const;
 
 // ============ Utility Types ============
 
 export interface AnimationControllerState {
   isGesturePlaying: boolean;
   currentGesture: GestureType | null;
   currentPose: PoseType;
   currentExpression: ReactiveExpressionType;
 }