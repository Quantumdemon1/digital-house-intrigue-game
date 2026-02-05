 /**
  * @file animation/utils/springPhysics.ts
  * @description Spring physics for smooth, natural motion with overshoot
  */
 
 import { SpringConfig, SpringState } from '../types';
 
 /**
  * Default spring configurations for different body parts
  */
 export const SPRING_CONFIGS: Record<string, SpringConfig> = {
   head: { stiffness: 0.25, damping: 0.75, mass: 0.4 },
   neck: { stiffness: 0.3, damping: 0.7, mass: 0.3 },
   spine: { stiffness: 0.4, damping: 0.8, mass: 0.6 },
   arm: { stiffness: 0.2, damping: 0.65, mass: 0.35 },
   forearm: { stiffness: 0.25, damping: 0.6, mass: 0.25 },
   hand: { stiffness: 0.15, damping: 0.55, mass: 0.15 },
   hips: { stiffness: 0.5, damping: 0.85, mass: 0.8 },
 };
 
 /**
  * Create initial spring state
  */
 export const createSpringState = (initialValue: number = 0): SpringState => ({
   position: initialValue,
   velocity: 0,
   target: initialValue,
 });
 
 /**
  * Update spring state using damped harmonic oscillator
  * Uses semi-implicit Euler integration for stability
  */
 export const updateSpring = (
   state: SpringState,
   config: SpringConfig,
   deltaTime: number
 ): SpringState => {
   const { stiffness, damping, mass } = config;
   
   // Spring force: F = -k * (x - target)
   // Damping force: F = -c * v
   const displacement = state.position - state.target;
   const springForce = -stiffness * displacement;
   const dampingForce = -damping * state.velocity;
   
   // Acceleration: a = F / m
   const acceleration = (springForce + dampingForce) / mass;
   
   // Semi-implicit Euler: update velocity first, then position
   const newVelocity = state.velocity + acceleration * deltaTime;
   const newPosition = state.position + newVelocity * deltaTime;
   
   return {
     position: newPosition,
     velocity: newVelocity,
     target: state.target,
   };
 };
 
 /**
  * Set spring target
  */
 export const setSpringTarget = (state: SpringState, target: number): SpringState => ({
   ...state,
   target,
 });
 
 /**
  * Check if spring is at rest (within threshold)
  */
 export const isSpringAtRest = (
   state: SpringState,
   positionThreshold: number = 0.001,
   velocityThreshold: number = 0.001
 ): boolean => {
   return (
     Math.abs(state.position - state.target) < positionThreshold &&
     Math.abs(state.velocity) < velocityThreshold
   );
 };
 
 /**
  * Snap spring to target if close enough
  */
 export const snapSpringIfClose = (
   state: SpringState,
   threshold: number = 0.001
 ): SpringState => {
   if (isSpringAtRest(state, threshold)) {
     return {
       position: state.target,
       velocity: 0,
       target: state.target,
     };
   }
   return state;
 };
 
 /**
  * 3D spring state for rotations
  */
 export interface Spring3DState {
   x: SpringState;
   y: SpringState;
   z: SpringState;
 }
 
 /**
  * Create 3D spring state
  */
 export const createSpring3D = (
   initial: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
 ): Spring3DState => ({
   x: createSpringState(initial.x),
   y: createSpringState(initial.y),
   z: createSpringState(initial.z),
 });
 
 /**
  * Update 3D spring
  */
 export const updateSpring3D = (
   state: Spring3DState,
   config: SpringConfig,
   deltaTime: number
 ): Spring3DState => ({
   x: updateSpring(state.x, config, deltaTime),
   y: updateSpring(state.y, config, deltaTime),
   z: updateSpring(state.z, config, deltaTime),
 });
 
 /**
  * Set 3D spring target
  */
 export const setSpring3DTarget = (
   state: Spring3DState,
   target: { x: number; y: number; z: number }
 ): Spring3DState => ({
   x: setSpringTarget(state.x, target.x),
   y: setSpringTarget(state.y, target.y),
   z: setSpringTarget(state.z, target.z),
 });
 
 /**
  * Get current position from 3D spring
  */
 export const getSpring3DPosition = (
   state: Spring3DState
 ): { x: number; y: number; z: number } => ({
   x: state.x.position,
   y: state.y.position,
   z: state.z.position,
 });