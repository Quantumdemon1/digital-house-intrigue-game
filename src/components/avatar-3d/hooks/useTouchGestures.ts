 /**
  * @file useTouchGestures.ts
  * @description Touch gesture recognition for 3D scene interactions
  */
 
 import { useRef, useCallback, useEffect } from 'react';
 
 // Gesture configuration
 const TAP_THRESHOLD_MS = 200;
 const DOUBLE_TAP_THRESHOLD_MS = 300;
 const LONG_PRESS_THRESHOLD_MS = 500;
 const MOVEMENT_THRESHOLD_PX = 10;
 const PINCH_SENSITIVITY = 0.015;
 
 export interface TouchGestureCallbacks {
   onTap?: (position: { x: number; y: number }) => void;
   onDoubleTap?: (position: { x: number; y: number }) => void;
   onLongPress?: (position: { x: number; y: number }) => void;
   onLongPressEnd?: () => void;
   onPinchZoom?: (scale: number, center: { x: number; y: number }) => void;
   onRotate?: (deltaX: number, deltaY: number) => void;
   onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', velocity: number) => void;
 }
 
 interface TouchState {
   // Single touch tracking
   tapStartTime: number;
   tapStartPosition: { x: number; y: number };
   lastTapTime: number;
   lastTapPosition: { x: number; y: number };
   
   // Movement tracking
   lastTouchX: number;
   lastTouchY: number;
   hasMoved: boolean;
   
   // Two-finger tracking
   initialPinchDistance: number | null;
   pinchCenter: { x: number; y: number } | null;
   
   // Long press
   longPressTimer: ReturnType<typeof setTimeout> | null;
   isLongPress: boolean;
   
   // Velocity tracking for swipes
   touchHistory: Array<{ x: number; y: number; time: number }>;
 }
 
 export interface UseTouchGesturesReturn {
   handlers: {
     onTouchStart: (e: React.TouchEvent) => void;
     onTouchMove: (e: React.TouchEvent) => void;
     onTouchEnd: (e: React.TouchEvent) => void;
   };
   isLongPressing: boolean;
 }
 
 const getPinchDistance = (touches: React.TouchList): number => {
   if (touches.length < 2) return 0;
   const dx = touches[0].clientX - touches[1].clientX;
   const dy = touches[0].clientY - touches[1].clientY;
   return Math.sqrt(dx * dx + dy * dy);
 };
 
 const getPinchCenter = (touches: React.TouchList): { x: number; y: number } => {
   if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY };
   return {
     x: (touches[0].clientX + touches[1].clientX) / 2,
     y: (touches[0].clientY + touches[1].clientY) / 2,
   };
 };
 
 const calculateVelocity = (
   history: Array<{ x: number; y: number; time: number }>
 ): { vx: number; vy: number } => {
   if (history.length < 2) return { vx: 0, vy: 0 };
   
   const recent = history.slice(-3); // Last 3 points
   const first = recent[0];
   const last = recent[recent.length - 1];
   const dt = (last.time - first.time) / 1000;
   
   if (dt === 0) return { vx: 0, vy: 0 };
   
   return {
     vx: (last.x - first.x) / dt,
     vy: (last.y - first.y) / dt,
   };
 };
 
 export const useTouchGestures = (
   callbacks: TouchGestureCallbacks,
   enabled: boolean = true
 ): UseTouchGesturesReturn => {
   const stateRef = useRef<TouchState>({
     tapStartTime: 0,
     tapStartPosition: { x: 0, y: 0 },
     lastTapTime: 0,
     lastTapPosition: { x: 0, y: 0 },
     lastTouchX: 0,
     lastTouchY: 0,
     hasMoved: false,
     initialPinchDistance: null,
     pinchCenter: null,
     longPressTimer: null,
     isLongPress: false,
     touchHistory: [],
   });
   
   // Cleanup long press timer on unmount
   useEffect(() => {
     return () => {
       if (stateRef.current.longPressTimer) {
         clearTimeout(stateRef.current.longPressTimer);
       }
     };
   }, []);
   
   const clearLongPressTimer = useCallback(() => {
     if (stateRef.current.longPressTimer) {
       clearTimeout(stateRef.current.longPressTimer);
       stateRef.current.longPressTimer = null;
     }
   }, []);
   
   const onTouchStart = useCallback((e: React.TouchEvent) => {
     if (!enabled) return;
     
     const state = stateRef.current;
     const touches = e.touches;
     
     if (touches.length === 1) {
       // Single touch
       const touch = touches[0];
       const now = Date.now();
       
       state.tapStartTime = now;
       state.tapStartPosition = { x: touch.clientX, y: touch.clientY };
       state.lastTouchX = touch.clientX;
       state.lastTouchY = touch.clientY;
       state.hasMoved = false;
       state.touchHistory = [{ x: touch.clientX, y: touch.clientY, time: now }];
       
       // Start long press timer
       clearLongPressTimer();
       state.longPressTimer = setTimeout(() => {
         state.isLongPress = true;
         callbacks.onLongPress?.({ x: touch.clientX, y: touch.clientY });
       }, LONG_PRESS_THRESHOLD_MS);
       
     } else if (touches.length === 2) {
       // Two-finger touch - cancel tap/long-press
       clearLongPressTimer();
       state.isLongPress = false;
       
       // Initialize pinch tracking
       state.initialPinchDistance = getPinchDistance(touches);
       state.pinchCenter = getPinchCenter(touches);
     }
   }, [enabled, callbacks, clearLongPressTimer]);
   
   const onTouchMove = useCallback((e: React.TouchEvent) => {
     if (!enabled) return;
     
     const state = stateRef.current;
     const touches = e.touches;
     
     if (touches.length === 1) {
       const touch = touches[0];
       const dx = touch.clientX - state.tapStartPosition.x;
       const dy = touch.clientY - state.tapStartPosition.y;
       const distance = Math.sqrt(dx * dx + dy * dy);
       
       // Track movement history for velocity
       state.touchHistory.push({ x: touch.clientX, y: touch.clientY, time: Date.now() });
       if (state.touchHistory.length > 10) state.touchHistory.shift();
       
       // Cancel tap if moved too far
       if (distance > MOVEMENT_THRESHOLD_PX) {
         state.hasMoved = true;
         clearLongPressTimer();
         
         // Report rotation delta (camera rotation)
         const deltaX = touch.clientX - state.lastTouchX;
         const deltaY = touch.clientY - state.lastTouchY;
         callbacks.onRotate?.(deltaX, deltaY);
       }
       
       state.lastTouchX = touch.clientX;
       state.lastTouchY = touch.clientY;
       
     } else if (touches.length === 2 && state.initialPinchDistance !== null) {
       // Pinch zoom
       const currentDistance = getPinchDistance(touches);
       const scale = currentDistance / state.initialPinchDistance;
       const center = getPinchCenter(touches);
       
       callbacks.onPinchZoom?.(scale, center);
       
       // Update for continuous pinch
       state.initialPinchDistance = currentDistance;
     }
   }, [enabled, callbacks, clearLongPressTimer]);
   
   const onTouchEnd = useCallback((e: React.TouchEvent) => {
     if (!enabled) return;
     
     const state = stateRef.current;
     clearLongPressTimer();
     
     // If we were long pressing, notify end
     if (state.isLongPress) {
       callbacks.onLongPressEnd?.();
       state.isLongPress = false;
       return;
     }
     
     // Reset pinch state
     if (e.touches.length === 0) {
       state.initialPinchDistance = null;
       state.pinchCenter = null;
     }
     
     // Check for swipe
     if (state.hasMoved && state.touchHistory.length >= 2) {
       const velocity = calculateVelocity(state.touchHistory);
       const speed = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
       
       if (speed > 500) { // px/s threshold for swipe
         const absX = Math.abs(velocity.vx);
         const absY = Math.abs(velocity.vy);
         
         if (absX > absY) {
           callbacks.onSwipe?.(velocity.vx > 0 ? 'right' : 'left', absX);
         } else {
           callbacks.onSwipe?.(velocity.vy > 0 ? 'down' : 'up', absY);
         }
       }
     }
     
     // Check for tap (not moved, quick touch)
     if (!state.hasMoved) {
       const now = Date.now();
       const tapDuration = now - state.tapStartTime;
       
       if (tapDuration < TAP_THRESHOLD_MS) {
         const position = state.tapStartPosition;
         
         // Check for double-tap
         const timeSinceLastTap = now - state.lastTapTime;
         const distanceFromLastTap = Math.sqrt(
           Math.pow(position.x - state.lastTapPosition.x, 2) +
           Math.pow(position.y - state.lastTapPosition.y, 2)
         );
         
         if (timeSinceLastTap < DOUBLE_TAP_THRESHOLD_MS && distanceFromLastTap < 30) {
           callbacks.onDoubleTap?.(position);
           state.lastTapTime = 0; // Reset to prevent triple-tap
         } else {
           callbacks.onTap?.(position);
           state.lastTapTime = now;
           state.lastTapPosition = position;
         }
       }
     }
     
     state.touchHistory = [];
   }, [enabled, callbacks, clearLongPressTimer]);
   
   return {
     handlers: {
       onTouchStart,
       onTouchMove,
       onTouchEnd,
     },
     isLongPressing: stateRef.current.isLongPress,
   };
 };
 
 export default useTouchGestures;