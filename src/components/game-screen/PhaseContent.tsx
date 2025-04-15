
import React from 'react';
import { GamePhase } from '@/models/game-state';
import HOHCompetition from '../game-phases/HOHCompetition';
import NominationPhase from '../game-phases/NominationPhase';
import POVCompetition from '../game-phases/POVCompetition';
import POVMeeting from '../game-phases/POVMeeting';
import EvictionPhase from '../game-phases/EvictionPhase';
import FinalePhase from '../game-phases/FinalePhase';
import GameOverPhase from '../game-phases/GameOverPhase';
import SocialInteractionPhase from '../game-phases/social-interaction';
import POVPlayerSelection from '../game-phases/POVPlayerSelection';
import FinalHoHPhase from '../game-phases/FinalHoHPhase';
import JuryQuestioningPhase from '../game-phases/JuryQuestioningPhase';

interface PhaseContentProps {
  phase: GamePhase;
}

const PhaseContent: React.FC<PhaseContentProps> = ({ phase }) => {
  // Normalize phase name for consistent handling of various aliases
  const normalizedPhase = getNormalizedPhase(phase);
  
  // Render the appropriate phase component based on the current game phase
  switch (normalizedPhase) {
    case 'HoH':
      return <HOHCompetition />;
    case 'Nomination':
      return <NominationPhase />;
    case 'PoVPlayerSelection':
      return <POVPlayerSelection />;
    case 'PoV':
      return <POVCompetition />;
    case 'PoVMeeting':
      return <POVMeeting />;
    case 'Eviction':
      return <EvictionPhase />;
    case 'SocialInteraction':
      return <SocialInteractionPhase />;
    case 'FinalHoH':
      return <FinalHoHPhase />;
    case 'JuryQuestioning':
      return <JuryQuestioningPhase />;
    case 'Finale':
      return <FinalePhase />;
    case 'GameOver':
      return <GameOverPhase />;
    default:
      console.warn(`Unknown phase: ${phase}`);
      return null;
  }
};

// Helper function to normalize phase names 
const getNormalizedPhase = (phase: GamePhase): string => {
  // Map all possible phase names to their canonical versions
  switch (phase) {
    case 'HOH Competition':
    case 'HoH':
    case 'Setup':
      return 'HoH';
    
    case 'POV Player Selection':
    case 'PoVPlayerSelection':
      return 'PoVPlayerSelection';
      
    case 'POV Competition':
    case 'PoV':  
      return 'PoV';
      
    case 'POV Meeting':
    case 'PoVMeeting':
      return 'PoVMeeting';
      
    case 'Final HOH Part1':
    case 'Final HOH Part2':
    case 'Final HOH Part3':
    case 'FinalHoH':
      return 'FinalHoH';
      
    case 'Jury Questioning':
    case 'JuryQuestioning':
      return 'JuryQuestioning';
      
    // Use as-is for other phases
    default:
      return phase;
  }
};

export default PhaseContent;
