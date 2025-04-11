
/**
 * @file models/houseguest/mental-state.ts
 * @description Functions for managing houseguest mental state and reflections
 */

import { Houseguest } from './model';
import { MoodType, StressLevelType } from './types';

/**
 * Generate a reflection prompt for AI
 */
export function generateReflectionPrompt(
  houseguest: Houseguest,
  game: any // Game state reference
): string {
  // Get alliances that the houseguest is part of - safe check if allianceSystem exists
  const alliances = game.allianceSystem ? 
    game.allianceSystem.getAllAlliances().filter(alliance => 
      alliance.members.includes(houseguest.id)
    ) : [];
  
  // Generate base prompt
  let prompt = `You are ${houseguest.name}, a ${houseguest.age}-year-old ${houseguest.occupation} from ${houseguest.hometown}. `;
  
  // Add personality traits
  prompt += `Your personality traits are: ${houseguest.traits.join(', ')}. `;
  
  // Add alliance information
  if (alliances.length > 0) {
    prompt += `You are in ${alliances.length} alliance(s): ${alliances.map(a => a.name).join(', ')}. `;
  } else {
    prompt += `You are not currently in any alliances. `;
  }
  
  // Add current game status
  prompt += `It is currently week ${game.week}, and ${game.phase}. `;
  
  // Add mental state
  prompt += `You are feeling ${houseguest.mood || 'Neutral'} and your stress level is ${houseguest.stressLevel || 'Normal'}. `;
  
  // Add any internal thoughts if available
  if (houseguest.internalThoughts && houseguest.internalThoughts.length > 0) {
    prompt += `One of your recent thoughts was: "${houseguest.internalThoughts[houseguest.internalThoughts.length - 1]}". `;
  }
  
  // Add reflection request
  prompt += `Based on your personality and game position, what are your thoughts about this situation? Provide your response as structured JSON with the following format: 
  {
    "reflection": "Your internal monologue and thoughts about the current game situation",
    "goals": ["Goal 1", "Goal 2", "Goal 3"],
    "strategy": "Your strategy moving forward in the game"
  }`;
  
  return prompt;
}

/**
 * Updates a houseguest's mental state based on game events
 */
export function updateHouseguestMentalState(
  houseguest: Houseguest,
  event: 'nominated' | 'saved' | 'competition_win' | 'competition_loss' | 'ally_evicted' | 
        'enemy_evicted' | 'betrayed' | 'positive_interaction' | 'negative_interaction'
): void {
  // Initialize mood and stress level if they don't exist
  if (!houseguest.mood) houseguest.mood = 'Neutral';
  if (!houseguest.stressLevel) houseguest.stressLevel = 'Normal';
  
  const moodLevels: MoodType[] = ['Angry', 'Upset', 'Neutral', 'Content', 'Happy'];
  const stressLevels: StressLevelType[] = ['Relaxed', 'Normal', 'Tense', 'Stressed', 'Overwhelmed'];
  
  // Get current indices
  let moodIndex = moodLevels.indexOf(houseguest.mood);
  let stressIndex = stressLevels.indexOf(houseguest.stressLevel);
  
  // Update based on event
  switch(event) {
    case 'nominated':
      moodIndex = Math.max(0, moodIndex - 2); // Much worse mood
      stressIndex = Math.min(stressLevels.length - 1, stressIndex + 2); // Much more stress
      break;
    case 'saved':
      moodIndex = Math.min(moodLevels.length - 1, moodIndex + 2); // Much better mood
      stressIndex = Math.max(0, stressIndex - 2); // Much less stress
      break;
    case 'competition_win':
      moodIndex = Math.min(moodLevels.length - 1, moodIndex + 1); // Better mood
      // Stress can go either way depending on the competition
      if (Math.random() > 0.5) {
        stressIndex = Math.max(0, stressIndex - 1); // Less stress
      }
      break;
    case 'competition_loss':
      moodIndex = Math.max(0, moodIndex - 1); // Worse mood
      // Stress often increases after a loss
      stressIndex = Math.min(stressLevels.length - 1, stressIndex + 1);
      break;
    case 'ally_evicted':
      moodIndex = Math.max(0, moodIndex - 1); // Worse mood
      stressIndex = Math.min(stressLevels.length - 1, stressIndex + 1); // More stress
      break;
    case 'enemy_evicted':
      moodIndex = Math.min(moodLevels.length - 1, moodIndex + 1); // Better mood
      stressIndex = Math.max(0, stressIndex - 1); // Less stress
      break;
    case 'betrayed':
      moodIndex = Math.max(0, moodIndex - 2); // Much worse mood
      stressIndex = Math.min(stressLevels.length - 1, stressIndex + 1); // More stress
      break;
    case 'positive_interaction':
      moodIndex = Math.min(moodLevels.length - 1, moodIndex + 1); // Better mood
      if (houseguest.stressLevel !== 'Relaxed') {
        stressIndex = Math.max(0, stressIndex - 1); // Slightly less stress
      }
      break;
    case 'negative_interaction':
      moodIndex = Math.max(0, moodIndex - 1); // Worse mood
      if (houseguest.stressLevel !== 'Overwhelmed') {
        stressIndex = Math.min(stressLevels.length - 1, stressIndex + 1); // Slightly more stress
      }
      break;
  }
  
  // Update houseguest mood and stress
  houseguest.mood = moodLevels[moodIndex];
  houseguest.stressLevel = stressLevels[stressIndex];
  
  // Add to internal thoughts based on the event
  if (!houseguest.internalThoughts) {
    houseguest.internalThoughts = [];
  }
  
  // Generate a thought based on the event
  let thought = "";
  switch(event) {
    case 'nominated':
      thought = "I've been nominated. I need to win the veto or campaign hard to stay in the game.";
      break;
    case 'saved':
      thought = "I was saved from the block! I'm so relieved, but I need to be careful going forward.";
      break;
    case 'competition_win':
      thought = "Winning this competition feels great. I need to use this power wisely.";
      break;
    case 'competition_loss':
      thought = "I lost the competition. I need to rely on my social game now.";
      break;
    case 'ally_evicted':
      thought = "Losing an ally is tough. I need to reposition myself in the house.";
      break;
    case 'enemy_evicted':
      thought = "Good riddance! One less person coming after me in the game.";
      break;
    case 'betrayed':
      thought = "I trusted them and they stabbed me in the back. I won't forget this.";
      break;
    case 'positive_interaction':
      thought = "That conversation went well. I might have a new potential ally.";
      break;
    case 'negative_interaction':
      thought = "That didn't go as planned. I need to be careful around them.";
      break;
  }
  
  // Add the thought to internal thoughts
  houseguest.internalThoughts.push(thought);
  
  // Cap internal thoughts at 10 entries
  if (houseguest.internalThoughts.length > 10) {
    houseguest.internalThoughts = houseguest.internalThoughts.slice(-10);
  }
}
