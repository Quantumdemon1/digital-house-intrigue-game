
import { useState, useEffect } from 'react';

export const VOTING_TIME_LIMIT = 30; // 30 seconds for voting

export function useVotingTimer(stage: string) {
  const [timeRemaining, setTimeRemaining] = useState(VOTING_TIME_LIMIT);
  const [votingStarted, setVotingStarted] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  
  // Reset timer when stage changes to voting
  useEffect(() => {
    if (stage === 'voting') {
      setVotingStarted(true);
      setTimeRemaining(VOTING_TIME_LIMIT);
      setTimerExpired(false);
      console.log("Voting stage started, timer reset to", VOTING_TIME_LIMIT);
    }
  }, [stage]);

  // Countdown timer for voting phase
  useEffect(() => {
    if (stage !== 'voting' || !votingStarted || timeRemaining <= 0) return;
    
    console.log("Eviction voting timer: ", timeRemaining);
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, votingStarted, stage]);

  return {
    timeRemaining,
    setTimeRemaining,
    votingStarted,
    setVotingStarted,
    timerExpired,
    setTimerExpired,
    VOTING_TIME_LIMIT
  };
}
