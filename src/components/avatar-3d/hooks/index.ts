 /**
  * @file hooks/index.ts
  * @description Export all avatar-related hooks
  */
 
 export { useIdlePose } from './useIdlePose';
 export { usePoseVariety, type PoseType } from './usePoseVariety';
 export { useLookAt, type LookAtConfig } from './useLookAt';
 export { useGestureAnimation, type GestureType, type UseGestureAnimationReturn } from './useGestureAnimation';
 export { useReactiveExpressions, type ReactiveExpressionType, type ReactiveExpressionsConfig } from './useReactiveExpressions';
 export { useEyeTracking, type EyeTrackingConfig } from './useEyeTracking';
 export { useEventLighting, usePulsingIntensity, interpolateColor, type LightingEvent, type EventLightingState, type LightingColors } from './useEventLighting';