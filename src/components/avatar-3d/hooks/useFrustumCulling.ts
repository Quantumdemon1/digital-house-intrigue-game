 /**
  * @file hooks/useFrustumCulling.ts
  * @description Frustum culling hook for performance optimization - skip updates for off-screen objects
  */
 
 import { useRef, useState, useCallback } from 'react';
 import { useFrame, useThree } from '@react-three/fiber';
 import * as THREE from 'three';
 
 interface FrustumCullingOptions {
   /** Bounding radius for the object (default: 1.5 for characters) */
   boundingRadius?: number;
   /** How often to check frustum (in frames, default: 6 = ~10Hz at 60fps) */
   checkInterval?: number;
   /** Extra margin beyond frustum (default: 2 units) */
   margin?: number;
 }
 
 interface FrustumCullingResult {
   isVisible: boolean;
   distanceToCamera: number;
   /** LOD level based on distance (0 = closest, 2 = farthest) */
   lodLevel: number;
 }
 
 // Reusable objects to avoid GC pressure
 const _frustum = new THREE.Frustum();
 const _matrix = new THREE.Matrix4();
 const _position = new THREE.Vector3();
 
 // LOD distance thresholds
 const LOD_THRESHOLDS = {
   high: 8,    // 0-8m: full quality
   medium: 16, // 8-16m: medium quality
   low: 30     // 16-30m: low quality, beyond = very low
 };
 
 /**
  * Hook for frustum culling and distance-based LOD
  * Returns visibility state and distance-based quality level
  */
 export const useFrustumCulling = (
   worldPosition: [number, number, number],
   options: FrustumCullingOptions = {}
 ): FrustumCullingResult => {
   const { 
     boundingRadius = 1.5, 
     checkInterval = 6,
     margin = 2 
   } = options;
   
   const { camera } = useThree();
   const frameCounter = useRef(0);
   
   // State for visibility and distance
   const [result, setResult] = useState<FrustumCullingResult>({
     isVisible: true,
     distanceToCamera: 0,
     lodLevel: 0
   });
   
   useFrame(() => {
     frameCounter.current++;
     
     // Only check every N frames for performance
     if (frameCounter.current % checkInterval !== 0) return;
     
     // Update frustum from camera
     _matrix.multiplyMatrices(
       camera.projectionMatrix,
       camera.matrixWorldInverse
     );
     _frustum.setFromProjectionMatrix(_matrix);
     
     // Set position
     _position.set(worldPosition[0], worldPosition[1] + 1, worldPosition[2]);
     
     // Calculate distance
     const distance = camera.position.distanceTo(_position);
     
     // Expanded frustum check with margin
     const isInFrustum = _frustum.containsPoint(_position) || distance < boundingRadius + margin;
     
     // Calculate LOD level
     let lodLevel = 0;
     if (distance > LOD_THRESHOLDS.low) {
       lodLevel = 3;
     } else if (distance > LOD_THRESHOLDS.medium) {
       lodLevel = 2;
     } else if (distance > LOD_THRESHOLDS.high) {
       lodLevel = 1;
     }
     
     // Only update state if changed
     if (
       result.isVisible !== isInFrustum ||
       result.lodLevel !== lodLevel ||
       Math.abs(result.distanceToCamera - distance) > 1
     ) {
       setResult({
         isVisible: isInFrustum,
         distanceToCamera: distance,
         lodLevel
       });
     }
   });
   
   return result;
 };
 
 /**
  * Get animation throttle factor based on LOD level
  * Returns how many frames to skip (0 = every frame, 2 = every 3rd frame, etc.)
  */
 export const getAnimationThrottle = (lodLevel: number): number => {
   switch (lodLevel) {
     case 0: return 0;  // Full speed
     case 1: return 1;  // Every other frame
     case 2: return 2;  // Every 3rd frame
     case 3: return 4;  // Every 5th frame
     default: return 0;
   }
 };
 
 /**
  * Should skip animation update this frame based on throttle
  */
 export const shouldSkipFrame = (
   frameCount: number, 
   throttle: number
 ): boolean => {
   if (throttle === 0) return false;
   return frameCount % (throttle + 1) !== 0;
 };
 
 export default useFrustumCulling;