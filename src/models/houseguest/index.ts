
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
  MentalState as HouseguestMentalState, 
  createDefaultMentalState,
  updateHouseguestMentalState,
  generateReflectionPrompt
} from './mental-state';

