
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Crown, Award, ChevronRight, Timer, Swords, Brain, Users, CheckCircle2 } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { GameCard, GameCardHeader, GameCardContent, GameCardTitle, GameCardDescription } from '@/components/ui/game-card';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { runEnduranceCompetition, runCompetition } from '@/systems/competition/competition-runner';
import { FINAL_HOH_DESCRIPTIONS } from '@/models/competition';

type FinalHoHPart = 'part1' | 'part2' | 'part3' | 'selection';

interface PartStatus {
  completed: boolean;
  winnerId: string | null;
  winnerName: string | null;
}

const FinalHoHPhase: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const [currentPart, setCurrentPart] = useState<FinalHoHPart>('part1');
  const [isCompeting, setIsCompeting] = useState(false);
  const [competitionProgress, setCompetitionProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Houseguest | null>(null);
  const competitionRunningRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track part completion
  const [partStatus, setPartStatus] = useState<Record<'part1' | 'part2' | 'part3', PartStatus>>({
    part1: { completed: false, winnerId: null, winnerName: null },
    part2: { completed: false, winnerId: null, winnerName: null },
    part3: { completed: false, winnerId: null, winnerName: null }
  });
  
  // Get the final 3 houseguests - IMPORTANT: Use gameState directly to ensure eliminated players are excluded
  const finalThree = gameState.houseguests.filter(h => h.status === 'Active');
  
  // Guard: Redirect if not exactly 3 houseguests
  useEffect(() => {
    if (finalThree.length !== 3) {
      if (finalThree.length > 3) {
        console.log(`FinalHoHPhase: ${finalThree.length} active houseguests, redirecting to normal HoH`);
        dispatch({ type: 'SET_PHASE', payload: 'HoH' });
      } else if (finalThree.length === 2) {
        console.log(`FinalHoHPhase: Only 2 active houseguests, redirecting to JuryQuestioning`);
        dispatch({ type: 'SET_PHASE', payload: 'JuryQuestioning' });
      }
    }
  }, [finalThree.length, dispatch]);
  
  // Get winners from game state on mount
  useEffect(() => {
    const winners = gameState.finalHoHWinners;
    if (winners) {
      const newStatus = { ...partStatus };
      
      if (winners.part1) {
        const winner = finalThree.find(h => h.id === winners.part1);
        newStatus.part1 = { completed: true, winnerId: winners.part1, winnerName: winner?.name || null };
      }
      if (winners.part2) {
        const winner = finalThree.find(h => h.id === winners.part2);
        newStatus.part2 = { completed: true, winnerId: winners.part2, winnerName: winner?.name || null };
      }
      if (winners.part3) {
        const winner = finalThree.find(h => h.id === winners.part3);
        newStatus.part3 = { completed: true, winnerId: winners.part3, winnerName: winner?.name || null };
        setCurrentPart('selection');
      }
      
      setPartStatus(newStatus);
      
      // Determine current part
      if (winners.part3) {
        setCurrentPart('selection');
      } else if (winners.part2) {
        setCurrentPart('part3');
      } else if (winners.part1) {
        setCurrentPart('part2');
      }
    }
  }, []);
  
  // Spectator mode: auto-start competitions
  useEffect(() => {
    if (!gameState.isSpectatorMode) return;
    
    const currentPartKey = currentPart as 'part1' | 'part2' | 'part3';
    if (currentPart !== 'selection' && !isCompeting && !showResults && !partStatus[currentPartKey]?.completed) {
      const timer = setTimeout(() => {
        startCompetition(currentPartKey);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isSpectatorMode, currentPart, isCompeting, showResults, partStatus]);
  
  // Spectator mode: auto-continue after results
  useEffect(() => {
    if (!gameState.isSpectatorMode || !showResults) return;
    
    const timer = setTimeout(() => {
      continueToNextPart();
    }, 3000);
    return () => clearTimeout(timer);
  }, [gameState.isSpectatorMode, showResults]);
  
  // Get the final HoH - could be an ID or object depending on how SET_HOH was dispatched
  const finalHoH = (() => {
    if (!gameState.hohWinner) return null;
    // If hohWinner is a string (ID), look up the houseguest
    if (typeof gameState.hohWinner === 'string') {
      return gameState.houseguests.find(hg => hg.id === gameState.hohWinner);
    }
    // If it's already an object, use it directly but verify it exists in houseguests
    const hohId = (gameState.hohWinner as Houseguest)?.id;
    return hohId ? gameState.houseguests.find(hg => hg.id === hohId) : null;
  })();
  
  // Spectator mode: auto-select finalist (AI decision)
  useEffect(() => {
    if (!gameState.isSpectatorMode || currentPart !== 'selection' || !finalHoH) return;
    
    const timer = setTimeout(() => {
      // Filter again to ensure we only pick from truly active houseguests
      const activeOthers = gameState.houseguests.filter(
        h => h.status === 'Active' && h.id !== finalHoH.id
      );
      const selectedFinalist = activeOthers[Math.floor(Math.random() * activeOthers.length)];
      if (selectedFinalist) {
        chooseFinalist(selectedFinalist);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [gameState.isSpectatorMode, currentPart, finalHoH, gameState.houseguests]);
  
  // Get eligible participants for each part - always filter for Active status
  const getParticipants = (part: 'part1' | 'part2' | 'part3'): Houseguest[] => {
    // Always use fresh filter to ensure eliminated players are excluded
    const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
    
    switch (part) {
      case 'part1':
        return activeHouseguests;
      case 'part2':
        // Part 2: The two losers from Part 1
        const part1Winner = partStatus.part1.winnerId;
        return activeHouseguests.filter(h => h.id !== part1Winner);
      case 'part3':
        // Part 3: Winners of Part 1 and Part 2
        const p1Winner = activeHouseguests.find(h => h.id === partStatus.part1.winnerId);
        const p2Winner = activeHouseguests.find(h => h.id === partStatus.part2.winnerId);
        return [p1Winner, p2Winner].filter(Boolean) as Houseguest[];
      default:
        return [];
    }
  };
  
  // Run competition
  const startCompetition = useCallback(async (part: 'part1' | 'part2' | 'part3') => {
    // Prevent double-execution
    if (competitionRunningRef.current) {
      console.log('Competition already running, ignoring start request');
      return;
    }
    
    competitionRunningRef.current = true;
    setIsCompeting(true);
    setShowResults(false);
    setCompetitionProgress(0);
    
    const participants = getParticipants(part);
    
    if (participants.length < 2) {
      console.error('Not enough participants for competition:', participants);
      competitionRunningRef.current = false;
      setIsCompeting(false);
      return;
    }
    
    console.log(`Starting Final HoH Part ${part} with participants:`, participants.map(p => p.name));
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Animate progress
    const duration = part === 'part1' ? 5000 : 3000;
    const increment = 100 / (duration / 100);
    
    progressIntervalRef.current = setInterval(() => {
      setCompetitionProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return 100;
        }
        return next;
      });
    }, 100);
    
    try {
      // Run the actual competition
      const competitionType = part === 'part1' ? 'FinalHoH1' : part === 'part2' ? 'FinalHoH2' : 'FinalHoH3';
      
      let result;
      if (part === 'part1') {
        // Endurance competition
        result = runEnduranceCompetition({
          type: competitionType,
          week: gameState.week,
          participants
        });
      } else {
        result = runCompetition({
          type: competitionType,
          week: gameState.week,
          participants
        });
      }
      
      console.log(`Competition result:`, result);
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // Ensure progress is at 100%
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setCompetitionProgress(100);
      
      const winner = participants.find(p => p.id === result.winnerId);
      console.log(`Winner found:`, winner?.name);
      
      setCurrentWinner(winner || null);
      setShowResults(true);
      setIsCompeting(false);
      competitionRunningRef.current = false;
      
      if (winner) {
        // Update part status
        setPartStatus(prev => ({
          ...prev,
          [part]: { completed: true, winnerId: winner.id, winnerName: winner.name }
        }));
        
        // Update game state
        dispatch({
          type: 'PLAYER_ACTION',
          payload: {
            actionId: `select_${part}_winner`,
            params: { winnerId: winner.id }
          }
        });
        
        // Log the event
        dispatch({
          type: 'LOG_EVENT',
          payload: {
            week: gameState.week,
            phase: 'FinalHoH',
            type: 'COMPETITION',
            description: `${winner.name} won Part ${part.slice(-1)} of the Final HoH competition!`,
            involvedHouseguests: [winner.id],
            data: {
              competitionName: result.name,
              category: result.category,
              results: result.results
            }
          }
        });
        
        // If Part 3 winner, set them as HoH
        if (part === 'part3') {
          dispatch({
            type: 'SET_HOH',
            payload: winner
          });
        }
      }
    } catch (error) {
      console.error('Error running competition:', error);
      setIsCompeting(false);
      competitionRunningRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  }, [dispatch, finalThree, gameState.week, partStatus]);
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Continue to next part
  const continueToNextPart = () => {
    setShowResults(false);
    setCurrentWinner(null);
    
    if (currentPart === 'part1') {
      setCurrentPart('part2');
    } else if (currentPart === 'part2') {
      setCurrentPart('part3');
    } else if (currentPart === 'part3') {
      setCurrentPart('selection');
    }
  };
  
  // Choose finalist for Final 2
  const chooseFinalist = (finalist: Houseguest) => {
    if (!finalHoH) return;
    
    // Validate that finalist is still active
    const activeFinalist = gameState.houseguests.find(
      h => h.id === finalist.id && h.status === 'Active'
    );
    if (!activeFinalist) {
      console.error('Attempted to select eliminated houseguest as finalist:', finalist.name);
      return;
    }
    
    // Use fresh active filter to find the evicted houseguest
    const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
    const evicted = activeHouseguests.find(hg => hg.id !== finalHoH.id && hg.id !== finalist.id);
    
    // Set final two
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'set_final_two',
        params: { finalist1Id: finalHoH.id, finalist2Id: finalist.id }
      }
    });
    
    // Log selection
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: 'FinalHoH',
        type: 'FINALIST_SELECTION',
        description: `${finalHoH.name} chose ${finalist.name} to join them in the Final 2.`,
        involvedHouseguests: [finalHoH.id, finalist.id]
      }
    });
    
    // Evict and add to jury
    if (evicted) {
      dispatch({
        type: 'EVICT_HOUSEGUEST',
        payload: { evictedId: evicted.id, toJury: true }
      });
      
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'FinalHoH',
          type: 'EVICTION',
          description: `${evicted.name} was evicted and becomes the final member of the jury.`,
          involvedHouseguests: [evicted.id]
        }
      });
    }
    
    // Move to jury questioning
    dispatch({
      type: 'SET_PHASE',
      payload: 'JuryQuestioning'
    });
  };
  
  const getPartIcon = (part: 'part1' | 'part2' | 'part3') => {
    switch (part) {
      case 'part1': return Timer;
      case 'part2': return Swords;
      case 'part3': return Brain;
    }
  };
  
  const getPartLabel = (part: 'part1' | 'part2' | 'part3') => {
    switch (part) {
      case 'part1': return 'Endurance';
      case 'part2': return 'Skill';
      case 'part3': return 'Questions';
    }
  };
  
  // Render finalist selection stage
  if (currentPart === 'selection') {
    // Must have a final HoH to proceed - if not, show loading/error state
    if (!finalHoH) {
      return (
        <GameCard variant="gold">
          <GameCardHeader icon={Crown} variant="gold">
            <GameCardTitle>Final Decision</GameCardTitle>
            <GameCardDescription>Week {gameState.week} - Waiting for Final HoH...</GameCardDescription>
          </GameCardHeader>
          <GameCardContent className="p-8 text-center">
            <Crown className="h-12 w-12 mx-auto mb-4 text-bb-gold animate-pulse" />
            <p className="text-muted-foreground">Determining Final Head of Household...</p>
          </GameCardContent>
        </GameCard>
      );
    }
    
    const otherFinalists = finalThree.filter(h => h.id !== finalHoH.id);
    
    return (
      <GameCard variant="gold">
        <GameCardHeader icon={Crown} variant="gold">
          <GameCardTitle>Final Decision</GameCardTitle>
          <GameCardDescription>Week {gameState.week} - Choose Your Final 2</GameCardDescription>
        </GameCardHeader>
        <GameCardContent className="space-y-6">
          {/* Final HoH Display */}
          <div className="text-center p-6 bg-gradient-to-r from-bb-gold/10 to-bb-gold/5 rounded-lg border border-bb-gold/20">
            <div className="flex items-center justify-center gap-2 text-bb-gold mb-3">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Final Head of Household</span>
            </div>
            <StatusAvatar
              name={finalHoH.name}
              imageUrl={finalHoH.avatarUrl}
              status="hoh"
              size="lg"
              className="mx-auto mb-2"
            />
            <h3 className="text-xl font-bold">{finalHoH.name}</h3>
            {finalHoH.isPlayer && <Badge className="mt-2" variant="secondary">You</Badge>}
          </div>
          
          {/* Choice Description */}
          <div className="text-center">
            <h4 className="font-semibold text-lg mb-2">Choose Your Final 2 Partner</h4>
            <p className="text-muted-foreground text-sm">
              As the Final HoH, you must choose which houseguest will join you in the Final 2.
              The other houseguest will become the final member of the jury.
            </p>
          </div>
          
          {/* Finalist Options */}
          <div className="grid grid-cols-2 gap-6">
            {otherFinalists.map(finalist => (
              <div 
                key={finalist.id} 
                className="flex flex-col items-center p-6 bg-card rounded-lg border-2 border-border hover:border-bb-gold/50 transition-colors"
              >
                <StatusAvatar
                  name={finalist.name}
                  imageUrl={finalist.avatarUrl}
                  size="lg"
                  className="mb-3"
                />
                <p className="font-semibold text-lg">{finalist.name}</p>
                {finalist.isPlayer && <Badge className="mt-1" variant="outline">You</Badge>}
                
                <Button
                  className="mt-4 w-full bg-gradient-to-r from-bb-gold to-amber-500 text-black hover:from-amber-500 hover:to-bb-gold"
                  onClick={() => chooseFinalist(finalist)}
                >
                  Take to Final 2
                </Button>
              </div>
            ))}
          </div>
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Render competition phase
  const currentPartKey = currentPart as 'part1' | 'part2' | 'part3';
  const partInfo = FINAL_HOH_DESCRIPTIONS[currentPartKey];
  const PartIcon = getPartIcon(currentPartKey);
  const participants = getParticipants(currentPartKey);
  
  return (
    <GameCard variant="gold">
      <GameCardHeader icon={Crown} variant="gold">
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Final HoH Competition</GameCardTitle>
            <GameCardDescription>Week {gameState.week} - The Final Three</GameCardDescription>
          </div>
          <Badge variant="outline" className="bg-bb-gold/10 text-bb-gold border-bb-gold/30">
            3-Part Competition
          </Badge>
        </div>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Part Navigation */}
        <div className="grid grid-cols-3 gap-2">
          {(['part1', 'part2', 'part3'] as const).map((part) => {
            const Icon = getPartIcon(part);
            const isActive = currentPart === part;
            const isCompleted = partStatus[part].completed;
            const isLocked = !isCompleted && part !== currentPart;
            
            return (
              <button
                key={part}
                disabled={isLocked}
                onClick={() => !isLocked && setCurrentPart(part)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                  isActive && "border-bb-gold bg-bb-gold/10",
                  isCompleted && !isActive && "border-bb-green/50 bg-bb-green/5",
                  isLocked && "border-border bg-muted/30 opacity-50 cursor-not-allowed",
                  !isActive && !isCompleted && !isLocked && "border-border hover:border-bb-gold/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                  isActive && "bg-bb-gold text-black",
                  isCompleted && !isActive && "bg-bb-green text-white",
                  !isActive && !isCompleted && "bg-muted"
                )}>
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className="text-xs font-medium">Part {part.slice(-1)}</span>
                <span className="text-xs text-muted-foreground">{getPartLabel(part)}</span>
                {isCompleted && partStatus[part].winnerName && (
                  <span className="text-xs text-bb-green mt-1">
                    {partStatus[part].winnerName}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Current Part Content */}
        <div className="p-6 bg-gradient-to-b from-card to-muted/20 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-bb-gold/20 flex items-center justify-center">
              <PartIcon className="h-6 w-6 text-bb-gold" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{partInfo.name}</h3>
              <p className="text-sm text-muted-foreground">Part {currentPartKey.slice(-1)} of 3</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">{partInfo.description}</p>
          
          {/* Participants */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Competitors
            </h4>
            <div className="flex justify-center gap-6">
              {participants.map(hg => (
                <div key={hg.id} className="flex flex-col items-center">
                  <StatusAvatar
                    name={hg.name}
                    imageUrl={hg.avatarUrl}
                    size="md"
                    className="mb-2"
                  />
                  <span className="text-sm font-medium">{hg.name}</span>
                  {hg.isPlayer && <Badge variant="outline" className="text-xs mt-1">You</Badge>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Competition State */}
          {isCompeting ? (
            <div className="space-y-4">
              <div className="text-center">
                <Award className="h-12 w-12 mx-auto mb-3 text-bb-gold animate-pulse" />
                <p className="font-medium">Competition in progress...</p>
                <p className="text-sm text-muted-foreground">
                  {currentPartKey === 'part1' ? 'Testing endurance...' : 'Calculating results...'}
                </p>
              </div>
              <Progress value={competitionProgress} className="h-2" />
            </div>
          ) : showResults && currentWinner ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-bb-green/10 border border-bb-green/30 rounded-lg">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-bb-green" />
                <h4 className="font-bold text-lg text-bb-green">{currentWinner.name} Wins!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentPartKey === 'part1' && 'They advance directly to Part 3!'}
                  {currentPartKey === 'part2' && `They will face ${partStatus.part1.winnerName} in Part 3!`}
                  {currentPartKey === 'part3' && 'They are now the Final Head of Household!'}
                </p>
              </div>
              
              <Button
                onClick={continueToNextPart}
                className="bg-gradient-to-r from-bb-gold to-amber-500 text-black hover:from-amber-500 hover:to-bb-gold"
              >
                {currentPartKey === 'part3' ? 'Continue to Final Decision' : `Continue to Part ${parseInt(currentPartKey.slice(-1)) + 1}`}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => startCompetition(currentPartKey)}
              disabled={isCompeting || partStatus[currentPartKey].completed}
              className="w-full bg-gradient-to-r from-bb-gold to-amber-500 text-black hover:from-amber-500 hover:to-bb-gold"
            >
              Start Part {currentPartKey.slice(-1)}
            </Button>
          )}
        </div>
      </GameCardContent>
    </GameCard>
  );
};

export default FinalHoHPhase;
