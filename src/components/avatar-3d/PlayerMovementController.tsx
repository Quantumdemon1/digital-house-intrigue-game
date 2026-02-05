 /**
  * @file PlayerMovementController.tsx
  * @description Handles smooth position interpolation and walking animation for player avatar
  */
 
 import React, { useRef, useEffect, useCallback } from 'react';
 import { useFrame } from '@react-three/fiber';
 import * as THREE from 'three';
 
 // Easing function for smooth movement
 const easeInOutQuad = (t: number): number => 
   t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
 
 export interface MovementState {
   isMoving: boolean;
   startPosition: [number, number, number];
   targetPosition: [number, number, number];
   currentPosition: [number, number, number];
   targetRotationY: number;
   currentRotationY: number;
 }
 
 interface PlayerMovementControllerProps {
   startPosition: [number, number, number];
   targetPosition: [number, number, number];
   startRotationY: number;
   isMoving: boolean;
   onPositionUpdate: (position: [number, number, number], rotationY: number) => void;
   onMoveComplete: () => void;
   speed?: number; // Units per second (default: 2.5)
 }
 
 /**
  * Component that runs inside Canvas to handle frame-by-frame position interpolation
  */
 export const PlayerMovementController: React.FC<PlayerMovementControllerProps> = ({
   startPosition,
   targetPosition,
   startRotationY,
   isMoving,
   onPositionUpdate,
   onMoveComplete,
   speed = 2.5,
 }) => {
   const progress = useRef(0);
   const startPos = useRef<[number, number, number]>(startPosition);
   const targetRotationY = useRef(startRotationY);
   const currentRotationY = useRef(startRotationY);
   const hasStarted = useRef(false);
   
   // Reset when movement starts
   useEffect(() => {
     if (isMoving && !hasStarted.current) {
       hasStarted.current = true;
       progress.current = 0;
       startPos.current = startPosition;
       
       // Calculate target rotation to face destination
       const dx = targetPosition[0] - startPosition[0];
       const dz = targetPosition[2] - startPosition[2];
       if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
         // Calculate angle to face movement direction
         // atan2 gives angle from +X axis, we need to adjust for character facing -Z
         targetRotationY.current = Math.atan2(dx, dz);
       }
     } else if (!isMoving) {
       hasStarted.current = false;
     }
   }, [isMoving, startPosition, targetPosition]);
   
   useFrame((_, delta) => {
     if (!isMoving) return;
     
     // Calculate distance
     const dx = targetPosition[0] - startPos.current[0];
     const dz = targetPosition[2] - startPos.current[2];
     const distance = Math.sqrt(dx * dx + dz * dz);
     
     // Calculate duration based on distance
     const duration = Math.max(distance / speed, 0.5); // Minimum 0.5s
     
     // Advance progress
     progress.current = Math.min(progress.current + delta / duration, 1);
     
     // Apply easing
     const eased = easeInOutQuad(progress.current);
     
     // Interpolate position
     const newPos: [number, number, number] = [
       startPos.current[0] + dx * eased,
       startPos.current[1], // Keep Y constant
       startPos.current[2] + dz * eased,
     ];
     
     // Smoothly interpolate rotation (faster than position)
     const rotationLerp = Math.min(progress.current * 3, 1); // Rotate quickly at start
     const rotationEased = easeInOutQuad(rotationLerp);
     
     // Handle rotation wraparound
     let rotDiff = targetRotationY.current - currentRotationY.current;
     // Normalize to -PI to PI
     while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
     while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
     
     currentRotationY.current = currentRotationY.current + rotDiff * rotationEased;
     
     // Update parent
     onPositionUpdate(newPos, currentRotationY.current);
     
     // Check for completion
     if (progress.current >= 1) {
       onMoveComplete();
     }
   });
   
   return null;
 };
 
 export default PlayerMovementController;