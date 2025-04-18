
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
  RELATIONSHIP_MIN: -100,
  RELATIONSHIP_MAX: 100,
  NOMINATION_PENALTY_NOMINEE: -20,
  NOMINATION_PENALTY_HOH: -10,
  VETO_SAVE_BONUS_SAVED: 20,
  VETO_SAVE_BONUS_HOLDER: 10,
  VOTE_AGAINST_PENALTY: -15,
  COMP_WIN_PERCEPTION_BOOST: 5,
  COMP_LOSS_PENALTY_COMPETITIVE: -5,
  ALLIANCE_FORMATION_BOOST: 15,
  
  // New advanced relationship settings
  BACKSTAB_PENALTY: -30,         // Penalty for betraying an ally
  SAVED_ALLY_BONUS: 25,          // Bonus for saving an ally with veto
  RELATIONSHIP_DECAY_RATE: 0.05, // 5% decay toward neutral (0) per week if no interaction
  RECIPROCITY_FACTOR: 0.3,       // How much unbalanced relationships affect actions (0-1)
  GROUP_DYNAMICS_WEIGHT: 0.2,    // How much allies-of-allies/enemies-of-allies affects score
  MEMORY_RETENTION_WEEKS: 3,     // How many weeks significant events remain at full strength
  
  // AI personality settings
  REFLECTION_INTERVAL: 1,        // Number of weeks between AI reflections
  STRESS_IMPACT_FACTOR: 0.7,     // How much stress affects decision making (0-1)
  MOOD_IMPACT_FACTOR: 0.5,       // How much mood affects decision making (0-1)
  RANDOM_THOUGHT_CHANCE: 0.3,    // Chance of generating random thoughts/observations
  PERSONALITY_WEIGHT: 0.8,       // How much personality traits influence decisions
  
  // Competition settings
  DEFAULT_COMP_DIFFICULTY: 5,
  DEFAULT_COMPETITION_ADVANTAGE_MULTIPLIER: 1.0,
  DEFAULT_SOCIAL_STAT_INFLUENCE: 0.1,
  
  // AI integration settings
  AI_REQUEST_INTERVAL: 1000, // ms between API calls
  GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  GEMINI_TEMPERATURE: 0.7,
  GEMINI_MAX_OUTPUT_TOKENS: 1024,
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || 'test-key-for-fallback-testing', // Added fallback for testing
  
  // TESTING FLAG - Set to true to force fallback mode
  FORCE_FALLBACK_MODE: true,
  
  // Save game version
  SAVE_GAME_VERSION: "1.0.0",
  
  // UI settings
  TRANSITION_DELAY: 1000, // ms
  
  // Development flags
  DEBUG_MODE: true,
  SKIP_ANIMATIONS: false,
};
