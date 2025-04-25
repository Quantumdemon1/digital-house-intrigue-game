
/**
 * @file animations.ts
 * @description Animation utilities for consistent motion throughout the application
 */

// These are now Tailwind animation class names that can be used in className
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  slideInRight: 'animate-slide-in-right',
  slideOutRight: 'animate-slide-out-right',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  celebrateWinner: 'animate-celebrate-winner',
  competitionProgress: 'animate-competition-progress',
  phaseTransition: 'animate-phase-transition'
};

// Utility function to apply animation classes
export const applyAnimation = (animationClass: string, duration = '0.3s', timing = 'ease') => {
  return `${animationClass} duration-300 ease-in-out`;
};

// Utility function to apply transitions
export const applyTransition = (properties = 'all', duration = '0.3s', timing = 'ease') => {
  return `transition-${properties} duration-300 ease-in-out`;
};

// Export individual animations for backward compatibility
export const { 
  fadeIn, 
  fadeOut, 
  scaleIn, 
  scaleOut, 
  slideInRight, 
  slideOutRight, 
  spin, 
  pulse, 
  celebrateWinner, 
  competitionProgress, 
  phaseTransition 
} = animations;
