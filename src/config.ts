
/**
 * @file config.ts
 * @description Configuration settings for the Big Brother game
 */

export const config = {
  // Game settings
  HOUSEGUEST_COUNT: 16,
  JURY_START_WEEK: 5,
  FINAL_STAGE_SIZE: 3,
  
  // Relationship settings
  INITIAL_RELATIONSHIP: 0,
  
  // Save game version
  SAVE_GAME_VERSION: "1.0.0",
  
  // Game balance settings
  DEFAULT_COMPETITION_ADVANTAGE_MULTIPLIER: 1.0,
  DEFAULT_SOCIAL_STAT_INFLUENCE: 0.1,
  
  // UI settings
  TRANSITION_DELAY: 1000, // ms
  
  // Development flags
  DEBUG_MODE: true,
  SKIP_ANIMATIONS: false,
};
