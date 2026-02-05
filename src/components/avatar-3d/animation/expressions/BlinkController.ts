 /**
  * @file animation/expressions/BlinkController.ts
  * @description Natural blink patterns with variation
  */
 
 import * as THREE from 'three';
 
 export interface BlinkConfig {
   baseRate: number;        // Blinks per minute (15-20 typical)
   rateVariation: number;   // Randomness in rate (0-0.3)
   duration: number;        // Blink duration in seconds (0.1-0.2)
   doubleBlinkChance: number;  // Chance of double blink (0-0.1)
 }
 
 export const DEFAULT_BLINK_CONFIG: BlinkConfig = {
   baseRate: 17,
   rateVariation: 0.2,
   duration: 0.15,
   doubleBlinkChance: 0.05,
 };
 
 export interface BlinkState {
   lastBlinkTime: number;
   nextBlinkTime: number;
   isBlinking: boolean;
   blinkStartTime: number;
   isDoubleBlink: boolean;
   doubleBlinkPhase: number;  // 0 = first blink, 1 = second blink
 }
 
 /**
  * Create initial blink state
  */
 export const createBlinkState = (currentTime: number): BlinkState => ({
   lastBlinkTime: currentTime,
   nextBlinkTime: currentTime + getNextBlinkDelay(DEFAULT_BLINK_CONFIG),
   isBlinking: false,
   blinkStartTime: 0,
   isDoubleBlink: false,
   doubleBlinkPhase: 0,
 });
 
 /**
  * Calculate delay until next blink
  */
 const getNextBlinkDelay = (config: BlinkConfig): number => {
   const baseDelay = 60 / config.baseRate;  // Average seconds between blinks
   const variation = (Math.random() - 0.5) * 2 * config.rateVariation * baseDelay;
   return baseDelay + variation;
 };
 
 /**
  * Update blink state and get morph value
  */
 export const updateBlink = (
   state: BlinkState,
   config: BlinkConfig,
   currentTime: number
 ): { value: number; state: BlinkState } => {
   let newState = { ...state };
   
   // Check if it's time to start a new blink
   if (!state.isBlinking && currentTime >= state.nextBlinkTime) {
     newState.isBlinking = true;
     newState.blinkStartTime = currentTime;
     newState.isDoubleBlink = Math.random() < config.doubleBlinkChance;
     newState.doubleBlinkPhase = 0;
   }
   
   // Calculate blink value
   let blinkValue = 0;
   
   if (newState.isBlinking) {
     const blinkProgress = (currentTime - newState.blinkStartTime) / config.duration;
     
     if (blinkProgress < 1) {
       // Smooth blink curve: quick close, slow open
       if (blinkProgress < 0.3) {
         // Quick close (0-30%)
         blinkValue = blinkProgress / 0.3;
       } else if (blinkProgress < 0.5) {
         // Hold closed (30-50%)
         blinkValue = 1;
       } else {
         // Slow open (50-100%)
         blinkValue = 1 - ((blinkProgress - 0.5) / 0.5);
       }
     } else {
       // Blink complete
       if (newState.isDoubleBlink && newState.doubleBlinkPhase === 0) {
         // Start second blink
         newState.doubleBlinkPhase = 1;
         newState.blinkStartTime = currentTime + 0.1;  // Small pause
       } else {
         // Fully complete
         newState.isBlinking = false;
         newState.lastBlinkTime = currentTime;
         newState.nextBlinkTime = currentTime + getNextBlinkDelay(config);
       }
     }
   }
   
   return { value: blinkValue, state: newState };
 };
 
 /**
  * Get blink morph targets
  */
 export const getBlinkMorphs = (blinkValue: number): Record<string, number> => ({
   eyeBlinkLeft: blinkValue,
   eyeBlinkRight: blinkValue,
 });
 
 /**
  * Force a blink (e.g., in response to bright light or surprise)
  */
 export const triggerBlink = (state: BlinkState, currentTime: number): BlinkState => ({
   ...state,
   isBlinking: true,
   blinkStartTime: currentTime,
   isDoubleBlink: false,
   doubleBlinkPhase: 0,
 });