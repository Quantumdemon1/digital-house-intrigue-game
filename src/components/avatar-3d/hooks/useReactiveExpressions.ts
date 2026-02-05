 /**
  * @file hooks/useReactiveExpressions.ts
  * @description Hook for mood-reactive facial expressions based on social context
  */
 
 import { useRef, useEffect } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 // Reactive expression types
 export type ReactiveExpressionType = 
   | 'curiosity'
   | 'jealousy'
   | 'admiration'
   | 'confidence'
   | 'concern'
   | 'respect'
   | 'surprise'
   | 'neutral';
 
 // Morph target configurations for each expression
 const REACTIVE_EXPRESSIONS: Record<ReactiveExpressionType, Record<string, number>> = {
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
     mouthOpen: 0.2,
   },
   neutral: {},
 };
 
 export interface ReactiveExpressionsConfig {
   /** Relationship score with selected character (-100 to 100) */
   relationshipScore?: number;
   /** Whether the selected character is a nominee */
   selectedIsNominee?: boolean;
   /** Whether the selected character is HoH */
   selectedIsHoH?: boolean;
   /** Whether this character is selected */
   isSelf?: boolean;
   /** Whether someone is selected at all */
   hasSelection?: boolean;
   /** Transition speed (0-1, higher = faster) */
   transitionSpeed?: number;
   /** Whether the system is enabled */
   enabled?: boolean;
 }
 
 // Determine expression based on context
 const determineExpression = (config: ReactiveExpressionsConfig): ReactiveExpressionType => {
   const {
     relationshipScore = 0,
     selectedIsNominee = false,
     selectedIsHoH = false,
     isSelf = false,
     hasSelection = false,
   } = config;
   
   if (!hasSelection) return 'neutral';
   if (isSelf) return 'confidence';
   if (selectedIsHoH) return 'respect';
   if (selectedIsNominee) return 'concern';
   
   // Based on relationship
   if (relationshipScore > 40) return 'admiration';
   if (relationshipScore < -30) return 'jealousy';
   
   return 'curiosity';
 };
 
 /**
  * Hook for reactive facial expressions based on social context
  */
 export const useReactiveExpressions = (
   skinnedMeshes: THREE.SkinnedMesh[],
   config: ReactiveExpressionsConfig = {}
 ) => {
   const {
     transitionSpeed = 0.08,
     enabled = true,
   } = config;
   
   // Track current and target morph values for smooth transitions
   const currentValues = useRef<Map<string, number>>(new Map());
   const targetExpression = useRef<ReactiveExpressionType>('neutral');
   const lastConfig = useRef<ReactiveExpressionsConfig>({});
   
   // Update target expression when config changes
   useEffect(() => {
     if (!enabled) {
       targetExpression.current = 'neutral';
       return;
     }
     
     // Check if config changed
     const configChanged = 
       config.relationshipScore !== lastConfig.current.relationshipScore ||
       config.selectedIsNominee !== lastConfig.current.selectedIsNominee ||
       config.selectedIsHoH !== lastConfig.current.selectedIsHoH ||
       config.isSelf !== lastConfig.current.isSelf ||
       config.hasSelection !== lastConfig.current.hasSelection;
     
     if (configChanged) {
       targetExpression.current = determineExpression(config);
       lastConfig.current = { ...config };
     }
   }, [config, enabled]);
   
   // Per-frame smooth morph transitions
   useFrame(() => {
     if (skinnedMeshes.length === 0) return;
     
     const targetMorphs = REACTIVE_EXPRESSIONS[targetExpression.current];
     
     // Collect all unique morph names
     const allMorphNames = new Set<string>();
     Object.keys(REACTIVE_EXPRESSIONS).forEach(expr => {
       Object.keys(REACTIVE_EXPRESSIONS[expr as ReactiveExpressionType]).forEach(name => {
         allMorphNames.add(name);
       });
     });
     
     // Update morph targets on each mesh
     skinnedMeshes.forEach(mesh => {
       if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
       
       allMorphNames.forEach(morphName => {
         const index = mesh.morphTargetDictionary![morphName];
         if (index === undefined) return;
         
         const targetValue = targetMorphs[morphName] ?? 0;
         const currentValue = currentValues.current.get(morphName) ?? 0;
         
         // Smooth interpolation
         const newValue = THREE.MathUtils.lerp(currentValue, targetValue, transitionSpeed);
         
         // Only apply reactive expressions, don't override blink or base mood
         // Add to existing value rather than replace
         const existingValue = mesh.morphTargetInfluences[index] ?? 0;
         mesh.morphTargetInfluences[index] = Math.max(existingValue, newValue);
         
         currentValues.current.set(morphName, newValue);
       });
     });
   });
   
   return {
     currentExpression: targetExpression.current,
   };
 };
 
 export default useReactiveExpressions;