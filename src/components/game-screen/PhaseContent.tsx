
import React from 'react';
import { GamePhase } from '@/models/game-state';
import HOHCompetition from '../game-phases/HOHCompetition';
import NominationPhase from '../game-phases/NominationPhase';
import POVCompetition from '../game-phases/POVCompetition';
import POVMeeting from '../game-phases/POVMeeting';
import EvictionPhase from '../game-phases/EvictionPhase';
import FinalePhase from '../game-phases/FinalePhase';
import GameOverPhase from '../game-phases/GameOverPhase';
import SocialInteractionPhase from '../game-phases/SocialInteractionPhase';

interface PhaseContentProps {
  phase: GamePhase;
}

const PhaseContent: React.FC<PhaseContentProps> = ({ phase }) => {
  // Render the appropriate phase component based on the current game phase
  switch (phase) {
    case 'HoH':
      return <HOHCompetition />;
    case 'Nomination':
      return <NominationPhase />;
    case 'PoV':
      return <POVCompetition />;
    case 'PoVMeeting':
      return <POVMeeting />;
    case 'Eviction':
      return <EvictionPhase />;
    case 'SocialInteraction':
      return <SocialInteractionPhase />;
    case 'Finale':
      return <FinalePhase />;
    case 'GameOver':
      return <GameOverPhase />;
    default:
      return null;
  }
};

export default PhaseContent;
