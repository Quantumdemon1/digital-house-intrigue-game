
/**
 * @file models/houseguest/index.ts
 * @description Main export file for the houseguest model
 */

// Re-export all houseguest components
export * from './types';
export * from './model';
export * from './creation';
export * from './traits';
export * from './competition';
export { 
  createDefaultMentalState,
  updateHouseguestMentalState,
  generateReflectionPrompt
} from './mental-state';

// Re-export the MentalState as a type to avoid naming conflicts
export type { MentalState } from './mental-state';
