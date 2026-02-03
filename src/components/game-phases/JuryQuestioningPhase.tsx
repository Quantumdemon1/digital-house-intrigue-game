
import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { MessageSquare, ChevronRight, HelpCircle, CheckCircle2, SkipForward } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameCard, GameCardHeader, GameCardContent, GameCardTitle, GameCardDescription } from '@/components/ui/game-card';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { cn } from '@/lib/utils';

// Jury questions categorized by tone
const JURY_QUESTIONS = {
  neutral: [
    "What was your biggest move in the game?",
    "Why do you deserve to win over your opponent?",
    "Who was the most influential player on your game?",
    "What would you have done differently?",
    "Describe your game in three words.",
    "How did you balance competition wins with social game?"
  ],
  bitter: [
    "Why should I vote for you after you betrayed our alliance?",
    "Do you feel any remorse for how you played?",
    "How do you justify the lies you told in this game?",
    "Did you ever consider how your actions affected others?",
    "What makes you think you deserve my vote after backstabbing me?"
  ],
  supportive: [
    "Walk us through your strategic masterplan.",
    "How did you manage to stay so calm under pressure?",
    "What advice would you give to future players?",
    "When did you know you could win this game?",
    "Tell us about your proudest moment in the house."
  ]
};

const JuryQuestioningPhase: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const [currentJurorIndex, setCurrentJurorIndex] = useState(0);
  const [isAsking, setIsAsking] = useState(false);
  const [questionsComplete, setQuestionsComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answeredBy, setAnsweredBy] = useState<Set<string>>(new Set());
  const [questionType, setQuestionType] = useState<'neutral' | 'bitter' | 'supportive'>('neutral');
  
  // Get the final 2 houseguests
  const finalists = gameState.finalTwo || [];
  
  // Get all jury members
  const jurors = gameState.juryMembers
    .map(id => gameState.houseguests.find(hg => hg.id === id))
    .filter(Boolean) as Houseguest[];
  
  const currentJuror = jurors[currentJurorIndex];
  const progress = ((currentJurorIndex) / jurors.length) * 100;

  // Listen for fast-forward events
  useEffect(() => {
    const handleFastForward = () => {
      skipToEnd();
    };
    
    document.addEventListener('game:fastForward', handleFastForward);
    return () => document.removeEventListener('game:fastForward', handleFastForward);
  }, []);

  // Skip all questioning
  const skipToEnd = useCallback(() => {
    setQuestionsComplete(true);
    setIsAsking(false);
    
    // Log event
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: gameState.week,
        phase: 'JuryQuestioning',
        type: 'JURY_QUESTIONING',
        description: `The jury questioned ${finalists.map(f => f.name).join(' and ')}.`,
        involvedHouseguests: [...finalists.map(f => f.id), ...jurors.map(j => j.id)]
      }
    });
  }, [dispatch, finalists, gameState.week, jurors]);
  
  // Determine question type based on relationship
  const getQuestionType = (juror: Houseguest): 'neutral' | 'bitter' | 'supportive' => {
    // For now, randomize with weighted probability
    // In a full implementation, this would check relationship scores
    const roll = Math.random();
    if (roll < 0.2) return 'bitter';
    if (roll < 0.4) return 'supportive';
    return 'neutral';
  };
  
  // Start questioning for current juror
  const startQuestioning = () => {
    if (!currentJuror) return;
    
    setIsAsking(true);
    
    // Determine question type based on juror's relationship
    const qType = getQuestionType(currentJuror);
    setQuestionType(qType);
    
    const questions = JURY_QUESTIONS[qType];
    const question = questions[currentJurorIndex % questions.length];
    setCurrentQuestion(question);
    
    // Simulate answer time for each finalist
    setTimeout(() => {
      // First finalist answers
      setAnsweredBy(prev => new Set([...prev, finalists[0]?.id]));
      
      setTimeout(() => {
        // Second finalist answers
        setAnsweredBy(prev => new Set([...prev, finalists[1]?.id]));
        
        setTimeout(() => {
          // Move to next juror
          setIsAsking(false);
          setAnsweredBy(new Set());
          
          if (currentJurorIndex < jurors.length - 1) {
            setCurrentJurorIndex(prev => prev + 1);
          } else {
            setQuestionsComplete(true);
            
            // Log event
            dispatch({
              type: 'LOG_EVENT',
              payload: {
                week: gameState.week,
                phase: 'JuryQuestioning',
                type: 'JURY_QUESTIONING',
                description: `The jury questioned ${finalists.map(f => f.name).join(' and ')}.`,
                involvedHouseguests: [...finalists.map(f => f.id), ...jurors.map(j => j.id)]
              }
            });
          }
        }, 2000);
      }, 2000);
    }, 1500);
  };
  
  // Continue to finale
  const continueToFinale = () => {
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'complete_questioning',
        params: {}
      }
    });
    
    dispatch({
      type: 'SET_PHASE',
      payload: 'Finale'
    });
  };

  // Get badge variant for question type
  const getQuestionBadge = () => {
    switch (questionType) {
      case 'bitter':
        return <Badge variant="destructive" className="text-xs">Tough Question</Badge>;
      case 'supportive':
        return <Badge variant="outline" className="text-xs bg-bb-green/10 text-bb-green border-bb-green/30">Friendly</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Neutral</Badge>;
    }
  };
  
  return (
    <GameCard variant="default">
      <GameCardHeader icon={MessageSquare} variant="default">
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Jury Questioning</GameCardTitle>
            <GameCardDescription>Week {gameState.week} - The Final 2 Face the Jury</GameCardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10">
              {jurors.length} Jury Members
            </Badge>
            {!questionsComplete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={skipToEnd}
                className="gap-1"
              >
                <SkipForward className="h-4 w-4" />
                Skip All
              </Button>
            )}
          </div>
        </div>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Questioning Progress</span>
            <span className="font-medium">{currentJurorIndex}/{jurors.length} Complete</span>
          </div>
          <Progress value={questionsComplete ? 100 : progress} className="h-2" />
        </div>
        
        {/* Final 2 Display */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
          <h4 className="text-center text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">
            The Final Two
          </h4>
          <div className="flex justify-center items-center gap-8">
            {finalists.map((finalist, index) => (
              <React.Fragment key={finalist.id}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <StatusAvatar
                      name={finalist.name}
                      imageUrl={finalist.avatarUrl}
                      size="lg"
                      className={cn(
                        "transition-all",
                        isAsking && answeredBy.has(finalist.id) && "ring-4 ring-bb-green/50"
                      )}
                    />
                    {isAsking && answeredBy.has(finalist.id) && (
                      <CheckCircle2 className="absolute -bottom-1 -right-1 h-5 w-5 text-bb-green bg-background rounded-full" />
                    )}
                  </div>
                  <p className="font-semibold mt-2">{finalist.name}</p>
                  {finalist.isPlayer && <Badge className="mt-1" variant="secondary">You</Badge>}
                </div>
                {index === 0 && (
                  <div className="text-2xl font-bold text-muted-foreground/50">VS</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Question Display */}
        {isAsking && currentQuestion && (
          <div className="p-4 bg-muted/50 rounded-lg border animate-fade-in">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm text-muted-foreground">
                    {currentJuror?.name} asks:
                  </p>
                  {getQuestionBadge()}
                </div>
                <p className="text-lg font-medium italic">"{currentQuestion}"</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Jury Grid */}
        {!questionsComplete && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Jury Members
            </h4>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {jurors.map((juror, index) => {
                const isComplete = index < currentJurorIndex;
                const isCurrent = index === currentJurorIndex;
                
                return (
                  <div 
                    key={juror.id}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg border transition-all",
                      isComplete && "bg-bb-green/5 border-bb-green/30",
                      isCurrent && isAsking && "bg-primary/10 border-primary animate-pulse",
                      isCurrent && !isAsking && "bg-primary/5 border-primary/50",
                      !isComplete && !isCurrent && "bg-muted/30 border-border opacity-50"
                    )}
                  >
                    <StatusAvatar
                      name={juror.name}
                      imageUrl={juror.avatarUrl}
                      size="sm"
                      className="mb-1"
                    />
                    <span className="text-xs font-medium truncate w-full text-center">{juror.name}</span>
                    <span className={cn(
                      "text-xs mt-1",
                      isComplete && "text-bb-green",
                      isCurrent && "text-primary",
                      !isComplete && !isCurrent && "text-muted-foreground"
                    )}>
                      {isComplete && "Done"}
                      {isCurrent && isAsking && "Asking..."}
                      {isCurrent && !isAsking && "Ready"}
                      {!isComplete && !isCurrent && "Waiting"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="text-center pt-4">
          {questionsComplete ? (
            <div className="space-y-4">
              <div className="p-4 bg-bb-green/10 border border-bb-green/30 rounded-lg">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-bb-green" />
                <h3 className="font-bold text-bb-green">Questioning Complete</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All jury members have asked their questions.
                </p>
              </div>
              
              <Button
                onClick={continueToFinale}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                Continue to Final Vote <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={startQuestioning}
              disabled={isAsking}
              size="lg"
              className="min-w-[200px]"
            >
              {isAsking ? (
                <>Answering Question...</>
              ) : currentJurorIndex === 0 ? (
                <>Start Jury Questioning</>
              ) : (
                <>Next Juror Question</>
              )}
            </Button>
          )}
        </div>
      </GameCardContent>
    </GameCard>
  );
};

export default JuryQuestioningPhase;
