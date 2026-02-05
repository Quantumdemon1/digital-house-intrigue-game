 /**
  * @file animation/layers/ReactiveLayer.ts
  * @description Social context-based reactive expressions and body language
  */
 
 import * as THREE from 'three';
 import { ReactiveExpressionType, RelationshipContext } from '../types';
 
 // Morph target configurations for each expression
 export const REACTIVE_EXPRESSIONS: Record<ReactiveExpressionType, Record<string, number>> = {
   curiosity: {
     browInnerUp: 0.5,
     browOuterUpLeft: 0.3,
     browOuterUpRight: 0.3,
     eyeWideLeft: 0.4,
     eyeWideRight: 0.4,
     mouthSmileLeft: 0.1,
     mouthSmileRight: 0.1,
   },
   jealousy: {
     browDownLeft: 0.4,
     browDownRight: 0.4,
     eyeSquintLeft: 0.5,
     eyeSquintRight: 0.5,
     mouthFrownLeft: 0.25,
     mouthFrownRight: 0.25,
     noseSneerLeft: 0.15,
     noseSneerRight: 0.15,
   },
   admiration: {
     mouthSmileLeft: 0.5,
     mouthSmileRight: 0.5,
     eyeSquintLeft: 0.2,
     eyeSquintRight: 0.2,
     cheekSquintLeft: 0.2,
     cheekSquintRight: 0.2,
     browInnerUp: 0.15,
   },
   confidence: {
     mouthSmileLeft: 0.3,
     mouthSmileRight: 0.3,
     eyeSquintLeft: 0.15,
     eyeSquintRight: 0.15,
     jawForward: 0.1,
     browOuterUpLeft: 0.1,
     browOuterUpRight: 0.1,
   },
   concern: {
     browInnerUp: 0.5,
     browDownLeft: 0.2,
     browDownRight: 0.2,
     mouthFrownLeft: 0.2,
     mouthFrownRight: 0.2,
     eyeSquintLeft: 0.1,
     eyeSquintRight: 0.1,
   },
   respect: {
     browInnerUp: 0.2,
     eyeWideLeft: 0.15,
     eyeWideRight: 0.15,
     mouthSmileLeft: 0.1,
     mouthSmileRight: 0.1,
   },
   surprise: {
     eyeWideLeft: 0.7,
     eyeWideRight: 0.7,
     browOuterUpLeft: 0.5,
     browOuterUpRight: 0.5,
     browInnerUp: 0.5,
     jawOpen: 0.3,
   },
   neutral: {},
 };
 
 /**
  * Determine expression based on social context
  */
 export const determineExpression = (context: RelationshipContext): ReactiveExpressionType => {
   if (!context.hasSelection) return 'neutral';
   if (context.isSelf) return 'confidence';
   if (context.isHoH) return 'respect';
   if (context.isNominee) return 'concern';
   
   // Based on relationship score
   if (context.score > 40) return 'admiration';
   if (context.score < -30) return 'jealousy';
   
   return 'curiosity';
 };
 
 export interface ReactiveState {
   currentExpression: ReactiveExpressionType;
   targetExpression: ReactiveExpressionType;
   morphValues: Record<string, number>;
   transitionProgress: number;
 }
 
 /**
  * Create initial reactive state
  */
 export const createReactiveState = (): ReactiveState => ({
   currentExpression: 'neutral',
   targetExpression: 'neutral',
   morphValues: {},
   transitionProgress: 1,
 });
 
 /**
  * Update reactive expressions based on context
  */
 export const updateReactiveExpressions = (
   state: ReactiveState,
   context: RelationshipContext,
   transitionSpeed: number = 0.08
 ): { morphs: Record<string, number>; state: ReactiveState } => {
   let newState = { ...state };
   
   // Determine target expression
   const targetExpression = determineExpression(context);
   
   // If expression changed, start transition
   if (targetExpression !== state.targetExpression) {
     newState.targetExpression = targetExpression;
     newState.transitionProgress = 0;
   }
   
   // Get target morphs
   const targetMorphs = REACTIVE_EXPRESSIONS[newState.targetExpression];
   
   // Collect all unique morph names
   const allMorphNames = new Set<string>();
   Object.keys(REACTIVE_EXPRESSIONS).forEach(expr => {
     Object.keys(REACTIVE_EXPRESSIONS[expr as ReactiveExpressionType]).forEach(name => {
       allMorphNames.add(name);
     });
   });
   
   // Smooth interpolation for each morph
   const newMorphValues: Record<string, number> = {};
   allMorphNames.forEach(morphName => {
     const targetValue = targetMorphs[morphName] ?? 0;
     const currentValue = state.morphValues[morphName] ?? 0;
     newMorphValues[morphName] = THREE.MathUtils.lerp(currentValue, targetValue, transitionSpeed);
   });
   
   newState.morphValues = newMorphValues;
   newState.currentExpression = newState.targetExpression;
   
   return { morphs: newMorphValues, state: newState };
 };
 
 /**
  * Get all morph names used by reactive expressions
  */
 export const getReactiveMorphNames = (): string[] => {
   const names = new Set<string>();
   Object.values(REACTIVE_EXPRESSIONS).forEach(morphs => {
     Object.keys(morphs).forEach(name => names.add(name));
   });
   return Array.from(names);
 };