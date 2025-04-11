
import { useCallback } from 'react';
import { Houseguest } from '@/models/houseguest';

interface TimeExpirationHandlerProps {
  stage: string;
  timerExpired: boolean;
  nonNominees: Houseguest[];
  nominees: Houseguest[];
  votes: Record<string, string>;
  handleRandomVotes: (missingVoters: Houseguest[], nominees: Houseguest[]) => Record<string, string>;
  progressToResults: () => void;
}

export function useTimeExpirationHandler({
  stage,
  timerExpired,
  nonNominees,
  nominees,
  votes,
  handleRandomVotes,
  progressToResults
}: TimeExpirationHandlerProps) {
  
  // Time expiration handler
  const handleTimeExpired = useCallback(() => {
    if (stage !== 'voting' || timerExpired) return;
    
    console.log("Handling time expired for eviction voting");
    
    const missingVoters = nonNominees.filter(voter => !votes[voter.id]);
    
    // Cast random votes for anyone who hasn't voted
    if (missingVoters.length > 0) {
      handleRandomVotes(missingVoters, nominees);

      // Move to results after a delay
      setTimeout(() => {
        progressToResults();
      }, 2000);
    }
  }, [stage, timerExpired, nonNominees, nominees, votes, handleRandomVotes, progressToResults]);

  return {
    handleTimeExpired
  };
}
