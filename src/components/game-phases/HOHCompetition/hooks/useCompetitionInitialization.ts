
import { useEffect } from 'react';
import { CompetitionType } from '@/models/houseguest';
import { competitionTypes } from '../utils';

export const useCompetitionInitialization = (
  phase: string,
  isCompeting: boolean,
  winner: any | null,
  activeHouseguestsLength: number,
  startCompetition: (type: CompetitionType) => void,
  logger: any
) => {
  // Effect to automatically start competition
  useEffect(() => {
    // Only start if we're in the HoH phase and there's no competition in progress
    if (phase === 'HoH' && !isCompeting && !winner && activeHouseguestsLength > 0) {
      logger?.info("Setting up competition start timeout");
      
      const timer = setTimeout(() => {
        logger?.info("Starting competition after delay");
        const randomType = competitionTypes[Math.floor(Math.random() * competitionTypes.length)];
        logger?.info(`Selected competition type: ${randomType}`);
        startCompetition(randomType);
      }, 2000); // Increased from 1000 to 2000 for better visibility
      
      return () => clearTimeout(timer);
    }
  }, [phase, isCompeting, winner, activeHouseguestsLength, startCompetition, logger]);
};
