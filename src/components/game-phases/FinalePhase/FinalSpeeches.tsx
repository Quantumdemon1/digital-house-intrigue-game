
import React, { useState, useEffect } from 'react';
import { Mic, SkipForward, Timer, ArrowRight, User } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FinalSpeechesProps {
  finalists: Houseguest[];
  jury: Houseguest[];
  onComplete: () => void;
}

const SPEECH_DURATION = 60; // 60 seconds per speech

const FinalSpeeches: React.FC<FinalSpeechesProps> = ({
  finalists,
  jury,
  onComplete
}) => {
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(SPEECH_DURATION);
  const [speeches, setSpeeches] = useState<Record<string, string>>({});
  const [playerSpeech, setPlayerSpeech] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  
  const currentSpeaker = finalists[currentSpeakerIndex];
  const isPlayerTurn = currentSpeaker?.isPlayer;
  const isComplete = currentSpeakerIndex >= finalists.length;
  
  // Generate AI speech for non-player finalists
  const generateAISpeech = (finalist: Houseguest): string => {
    const strategies = [
      `Throughout this game, I've played with integrity and made strategic moves when necessary. I've built genuine relationships and fought hard to be here.`,
      `I came into this house with a strategy, and I stuck to it. Every alliance I made, every decision I took was calculated to get me to this point.`,
      `I may not have won every competition, but I've been a loyal ally and I've never thrown anyone under the bus without good reason.`,
      `This game tested me in ways I never expected. I've grown so much, and I truly believe I've earned my spot in these final chairs.`
    ];
    return strategies[Math.floor(Math.random() * strategies.length)];
  };
  
  // Timer countdown
  useEffect(() => {
    if (isComplete || !isPlaying) return;
    if (isPlayerTurn) return; // Pause for player input
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextSpeaker();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentSpeakerIndex, isPlaying, isPlayerTurn, isComplete]);
  
  // Auto-generate AI speech when AI speaker starts
  useEffect(() => {
    if (!currentSpeaker || isPlayerTurn || isComplete) return;
    
    if (!speeches[currentSpeaker.id]) {
      setSpeeches(prev => ({
        ...prev,
        [currentSpeaker.id]: generateAISpeech(currentSpeaker)
      }));
    }
  }, [currentSpeakerIndex]);
  
  const handleNextSpeaker = () => {
    if (currentSpeakerIndex < finalists.length - 1) {
      setCurrentSpeakerIndex(prev => prev + 1);
      setTimeRemaining(SPEECH_DURATION);
    } else {
      onComplete();
    }
  };
  
  const handlePlayerSubmit = () => {
    if (!currentSpeaker) return;
    
    setSpeeches(prev => ({
      ...prev,
      [currentSpeaker.id]: playerSpeech || "I'm grateful to be here and I hope you'll vote for me to win."
    }));
    handleNextSpeaker();
  };
  
  const handleSkipCurrent = () => {
    handleNextSpeaker();
  };
  
  const handleSkipAll = () => {
    // Generate speeches for remaining finalists
    finalists.slice(currentSpeakerIndex).forEach(finalist => {
      if (!speeches[finalist.id]) {
        setSpeeches(prev => ({
          ...prev,
          [finalist.id]: finalist.isPlayer 
            ? "I'm grateful to be here." 
            : generateAISpeech(finalist)
        }));
      }
    });
    onComplete();
  };
  
  if (isComplete) {
    return null;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-bb-gold/30 to-amber-500/20">
          <Mic className="h-8 w-8 text-bb-gold" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground">
          Final Speeches
        </h3>
        <p className="text-muted-foreground">
          Each finalist addresses the jury one last time
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="flex justify-center gap-2">
        {finalists.map((finalist, index) => (
          <div 
            key={finalist.id}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              index < currentSpeakerIndex && "bg-bb-green",
              index === currentSpeakerIndex && "bg-bb-gold animate-pulse",
              index > currentSpeakerIndex && "bg-muted"
            )}
          />
        ))}
      </div>
      
      {/* Timer (for AI speakers) */}
      {!isPlayerTurn && (
        <div className="flex justify-center items-center gap-2 text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span className="font-mono">{timeRemaining}s</span>
          <Progress 
            value={(timeRemaining / SPEECH_DURATION) * 100} 
            className="w-32 h-2"
          />
        </div>
      )}
      
      {/* Current Speaker */}
      <div className="max-w-lg mx-auto p-6 rounded-xl bg-gradient-to-b from-bb-gold/10 to-card border border-bb-gold/30">
        <div className="flex flex-col items-center gap-4">
          <StatusAvatar
            name={currentSpeaker?.name || ''}
            imageUrl={currentSpeaker?.imageUrl}
            size="lg"
            isPlayer={currentSpeaker?.isPlayer}
          />
          <div className="text-center">
            <h4 className="text-lg font-bold text-foreground">
              {currentSpeaker?.name}
              {isPlayerTurn && <span className="text-bb-blue ml-2">(You)</span>}
            </h4>
            <p className="text-sm text-muted-foreground">{currentSpeaker?.occupation}</p>
          </div>
        </div>
        
        {/* Speech Content */}
        <div className="mt-6">
          {isPlayerTurn ? (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">
                Your final speech to the jury:
              </label>
              <Textarea
                value={playerSpeech}
                onChange={(e) => setPlayerSpeech(e.target.value)}
                placeholder="Tell the jury why you deserve to win Big Brother..."
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {playerSpeech.length}/500 characters
              </p>
              <Button 
                onClick={handlePlayerSubmit}
                className="w-full bg-bb-gold hover:bg-bb-gold/90 text-white"
              >
                Deliver Speech
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 italic text-foreground">
                "{speeches[currentSpeaker?.id] || '...'}"
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Jury watching */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <User className="h-4 w-4" />
          Jury listening
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {jury.map(juror => (
            <StatusAvatar
              key={juror.id}
              name={juror.name}
              imageUrl={juror.imageUrl}
              size="sm"
            />
          ))}
        </div>
      </div>
      
      {/* Skip buttons */}
      <div className="flex justify-center gap-3">
        {!isPlayerTurn && (
          <Button 
            variant="ghost" 
            onClick={handleSkipCurrent}
            className="text-muted-foreground"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip Speech
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={handleSkipAll}
          className="text-muted-foreground"
        >
          Skip All Speeches
        </Button>
      </div>
    </div>
  );
};

export default FinalSpeeches;
