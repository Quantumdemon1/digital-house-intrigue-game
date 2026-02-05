 /**
  * @file useAvatarMovement.ts
  * @description Hook to manage avatar movement state and walking animation
  */
 
 import { useState, useRef, useCallback, useEffect } from 'react';
 import { GestureType } from '../animation/types';
 
 export interface AvatarMovementState {
   isMoving: boolean;
   startPosition: [number, number, number];
   targetPosition: [number, number, number];
   currentPosition: [number, number, number];
   startRotationY: number;
   currentRotationY: number;
 }
 
 interface UseAvatarMovementConfig {
   initialPosition: [number, number, number];
   initialRotationY?: number;
   onMoveComplete?: () => void;
 }
 
 export interface UseAvatarMovementReturn {
   /** Current interpolated position */
   currentPosition: [number, number, number];
   /** Current rotation Y value */
   currentRotationY: number;
   /** Whether avatar is currently moving */
   isMoving: boolean;
   /** Start position for interpolation */
   startPosition: [number, number, number];
   /** Target position for interpolation */
   targetPosition: [number, number, number];
   /** Gesture to play while moving */
   movementGesture: GestureType | null;
   /** Trigger to retrigger walk animation during long movements */
   walkTrigger: number;
   /** Start moving to a new position */
   startMovement: (target: [number, number, number]) => void;
   /** Update current position (called by movement controller) */
   updatePosition: (position: [number, number, number], rotationY: number) => void;
   /** Called when movement completes */
   completeMovement: () => void;
 }
 
 /**
  * Hook to manage avatar movement state including position interpolation and walk gesture
  */
 export const useAvatarMovement = ({
   initialPosition,
   initialRotationY = 0,
   onMoveComplete,
 }: UseAvatarMovementConfig): UseAvatarMovementReturn => {
   const [isMoving, setIsMoving] = useState(false);
   const [currentPosition, setCurrentPosition] = useState<[number, number, number]>(initialPosition);
   const [startPosition, setStartPosition] = useState<[number, number, number]>(initialPosition);
   const [targetPosition, setTargetPosition] = useState<[number, number, number]>(initialPosition);
   const [currentRotationY, setCurrentRotationY] = useState(initialRotationY);
   const [walkTrigger, setWalkTrigger] = useState(0);
   
   // Track walk animation cycles to retrigger during long movements
   const walkCycleTimer = useRef<NodeJS.Timeout | null>(null);
   
   // Clear timer on unmount
   useEffect(() => {
     return () => {
       if (walkCycleTimer.current) {
         clearTimeout(walkCycleTimer.current);
       }
     };
   }, []);
   
   // Retrigger walk animation periodically during movement
   useEffect(() => {
     if (isMoving) {
       // Retrigger walk every 0.7s (slightly less than walk duration) for seamless looping
       const triggerWalk = () => {
         setWalkTrigger(prev => prev + 1);
         walkCycleTimer.current = setTimeout(triggerWalk, 700);
       };
       triggerWalk();
     } else {
       if (walkCycleTimer.current) {
         clearTimeout(walkCycleTimer.current);
         walkCycleTimer.current = null;
       }
     }
   }, [isMoving]);
   
   const startMovement = useCallback((target: [number, number, number]) => {
     setStartPosition(currentPosition);
     setTargetPosition(target);
     setIsMoving(true);
     setWalkTrigger(prev => prev + 1);
   }, [currentPosition]);
   
   const updatePosition = useCallback((position: [number, number, number], rotationY: number) => {
     setCurrentPosition(position);
     setCurrentRotationY(rotationY);
   }, []);
   
   const completeMovement = useCallback(() => {
     setIsMoving(false);
     setCurrentPosition(targetPosition);
     onMoveComplete?.();
   }, [targetPosition, onMoveComplete]);
   
   // Determine gesture - walk while moving, null when stopped
   const movementGesture: GestureType | null = isMoving ? 'walk' : null;
   
   return {
     currentPosition,
     currentRotationY,
     isMoving,
     startPosition,
     targetPosition,
     movementGesture,
     walkTrigger,
     startMovement,
     updatePosition,
     completeMovement,
   };
 };
 
 export default useAvatarMovement;