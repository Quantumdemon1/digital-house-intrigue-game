
/**
 * @file animations.ts
 * @description Animation utilities for consistent motion throughout the application
 */

// These are now Tailwind animation definitions that can be used in className
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

// Utility function to apply custom animations
export const applyAnimation = (animationClass: string, duration = '0.3s', timing = 'ease') => {
  return `${animationClass} duration-300 ease-in-out`;
};

export const applyTransition = (properties = 'all', duration = '0.3s', timing = 'ease') => {
  return `transition-${properties} duration-300 ease-in-out`;
};
