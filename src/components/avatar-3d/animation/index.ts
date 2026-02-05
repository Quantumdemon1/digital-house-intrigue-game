 /**
  * @file animation/index.ts
  * @description Export all animation system components
  */
 
 // Main controller
 export { useAnimationController, type AnimationControllerConfig } from './AnimationController';
 
 // Types
 export * from './types';
 
 // Layers
 export { 
   POSE_CONFIGS,
   createPoseTransition,
   startPoseTransition,
   updatePoseTransition,
   getBasePoseBones,
 } from './layers/BasePoseLayer';
 
 export {
   DEFAULT_IDLE_CONFIG,
   calculateBreathing,
   calculateWeightShift,
   calculateMicroMovements,
   calculateIdleLayer,
   type IdleConfig,
 } from './layers/IdleProceduralLayer';
 
 export {
   DEFAULT_LOOKAT_CONFIG,
   createLookAtState,
   updateLookAt,
   getLookAtNeutralBones,
   type LookAtConfig,
   type LookAtState,
 } from './layers/LookAtLayer';
 
 export {
   GESTURE_LIBRARY,
   createGestureState,
   startGesture,
   stopGesture,
   updateGesture,
   type GestureState,
 } from './layers/GestureLayer';
 
 export {
   REACTIVE_EXPRESSIONS,
   determineExpression,
   createReactiveState,
   updateReactiveExpressions,
   getReactiveMorphNames,
   type ReactiveState,
 } from './layers/ReactiveLayer';
 
 // Expressions
 export {
   DEFAULT_BLINK_CONFIG,
   createBlinkState,
   updateBlink,
   getBlinkMorphs,
   triggerBlink,
   type BlinkConfig,
   type BlinkState,
 } from './expressions/BlinkController';
 
 // Utilities
 export {
   findBone,
   findBones,
   lerpBoneRotation,
   addBoneRotation,
   scaleBoneRotation,
   applyBoneMap,
   blendBoneMaps,
   getBoneRotation,
   clampBoneRotation,
 } from './utils/boneUtils';
 
 export {
   SPRING_CONFIGS,
   createSpringState,
   updateSpring,
   setSpringTarget,
   isSpringAtRest,
   snapSpringIfClose,
   createSpring3D,
   updateSpring3D,
   setSpring3DTarget,
   getSpring3DPosition,
   type Spring3DState,
 } from './utils/springPhysics';
 
 // Physics layer
 export {
   SECONDARY_MOTION_CONFIGS,
   createSecondaryMotionState,
   initializeSecondaryMotion,
   updateSecondaryMotion,
   resetSecondaryMotion,
   applyImpulse,
   type SecondaryMotionState,
 } from './physics/SecondaryMotionSystem';