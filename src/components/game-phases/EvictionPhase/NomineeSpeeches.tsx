
import React, { useState, useEffect, useCallback } from 'react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Mic, SkipForward, Timer, ChevronRight, Volume2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

interface NomineeSpeechesProps {
  nominees: Houseguest[];
  onComplete: () => void;
}

const SPEECH_DURATION = 30; // 30 seconds per nominee

const NomineeSpeeches: React.FC<NomineeSpeechesProps> = ({
  nominees,
  onComplete
}) => {
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(SPEECH_DURATION);
  const [isPlayerSpeech, setIsPlayerSpeech] = useState(false);
  const [playerSpeech, setPlayerSpeech] = useState('');
  const [speechSubmitted, setPlayerSpeechSubmitted] = useState(false);
  const [aiSpeech, setAiSpeech] = useState('');
  const [speechRevealed, setSpeechRevealed] = useState(false);

  const currentSpeaker = nominees[currentSpeakerIndex];

  // Generate AI speech for non-player nominees
  const generateAISpeech = useCallback((houseguest: Houseguest): string => {
    const speeches = [
      `I know some of you have doubts about me, but I've played this game with integrity. I've been loyal to those who were loyal to me. Please, give me another week to prove I belong here.`,
      `This game is about strategy and survival. I've fought hard to be here, and I'm asking for your vote to stay. Keep me, and I'll have your back moving forward.`,
      `I may not be perfect, but I've been real with all of you. I haven't lied or backstabbed anyone. I deserve to stay in this house.`,
      `Look at my game. I've competed hard, I've been a good ally, and I've never thrown anyone under the bus. That's why you should keep me.`,
      `I'm asking each of you to think about who you can trust. I've proven myself as someone who keeps their word. Don't send me home tonight.`,
      `The person sitting next to me has played a different game than me. Consider who has been more honest, more loyal, and vote accordingly.`
    ];
    
    // Pick a random speech or generate based on personality
    const randomIndex = Math.floor(Math.random() * speeches.length);
    return speeches[randomIndex];
  }, []);

  // Initialize speech content when speaker changes
  useEffect(() => {
    if (currentSpeaker) {
      setIsPlayerSpeech(currentSpeaker.isPlayer);
      setSpeechRevealed(false);
      setPlayerSpeechSubmitted(false);
      setTimeRemaining(SPEECH_DURATION);
      
      if (!currentSpeaker.isPlayer) {
        // Reveal AI speech after a brief delay for dramatic effect
        const revealTimer = setTimeout(() => {
          setAiSpeech(generateAISpeech(currentSpeaker));
          setSpeechRevealed(true);
        }, 1000);
        return () => clearTimeout(revealTimer);
      }
    }
  }, [currentSpeaker, generateAISpeech]);

  // Timer countdown
  useEffect(() => {
    if (!currentSpeaker) return;
    
    // Don't run timer for player until they've submitted
    if (currentSpeaker.isPlayer && !speechSubmitted) return;
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up, move to next speaker or complete
      handleNextSpeaker();
    }
  }, [timeRemaining, currentSpeaker, speechSubmitted]);

  // Handle fast-forward event
  useEffect(() => {
    const handleFastForward = () => {
      onComplete();
    };
    
    document.addEventListener('game:fastForward', handleFastForward);
    return () => document.removeEventListener('game:fastForward', handleFastForward);
  }, [onComplete]);

  const handleNextSpeaker = () => {
    if (currentSpeakerIndex < nominees.length - 1) {
      setCurrentSpeakerIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePlayerSpeechSubmit = () => {
    setPlayerSpeechSubmitted(true);
  };

  const handleSkipAll = () => {
    onComplete();
  };

  const handleSkipCurrent = () => {
    handleNextSpeaker();
  };

  if (!currentSpeaker) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-bb-blue/20 to-bb-gold/20 mb-2">
          <Mic className="h-7 w-7 text-bb-gold" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">
          Final Pleas
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Each nominee has a chance to address the house before the vote.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {nominees.map((nominee, index) => (
          <div
            key={nominee.id}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSpeakerIndex
                ? 'bg-bb-gold scale-125'
                : index < currentSpeakerIndex
                ? 'bg-bb-green'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Current Speaker Card */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-bb-blue/5 via-bb-gold/5 to-bb-blue/5 rounded-xl blur-xl" />
        
        <div className="relative bg-gradient-to-b from-card to-muted/30 border border-border rounded-xl p-6 space-y-4">
          {/* Speaker info */}
          <div className="flex items-center gap-4">
            <StatusAvatar
              name={currentSpeaker.name}
              imageUrl={currentSpeaker.imageUrl}
              status="nominee"
              size="lg"
            />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {currentSpeaker.name}
                {currentSpeaker.isPlayer && (
                  <span className="text-xs bg-bb-blue text-white px-2 py-0.5 rounded-full">YOU</span>
                )}
              </h4>
              <p className="text-sm text-muted-foreground">{currentSpeaker.occupation}</p>
            </div>
            
            {/* Timer */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Timer className="h-4 w-4" />
                <span>{timeRemaining}s</span>
              </div>
              <Progress 
                value={(timeRemaining / SPEECH_DURATION) * 100} 
                className="w-20 h-1.5"
              />
            </div>
          </div>

          {/* Speech Content */}
          <div className="min-h-[120px] bg-muted/30 rounded-lg p-4 border border-border/50">
            {isPlayerSpeech && !speechSubmitted ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground italic">
                  Write your final plea to the house:
                </p>
                <Textarea
                  value={playerSpeech}
                  onChange={(e) => setPlayerSpeech(e.target.value)}
                  placeholder="I want to stay in this house because..."
                  className="min-h-[80px] resize-none"
                  maxLength={300}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {playerSpeech.length}/300 characters
                  </span>
                  <Button
                    size="sm"
                    onClick={handlePlayerSpeechSubmit}
                    className="bg-bb-blue hover:bg-bb-blue/90"
                  >
                    Deliver Speech
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ) : isPlayerSpeech && speechSubmitted ? (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-bb-gold mb-2">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Your speech:</span>
                </div>
                <p className="text-foreground italic">
                  "{playerSpeech || "I hope you all keep me. I've played a good game and I deserve to be here."}"
                </p>
              </div>
            ) : !speechRevealed ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-muted-foreground">
                  {currentSpeaker.name} is preparing to speak...
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-bb-gold mb-2">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Speaking:</span>
                </div>
                <p className="text-foreground italic">"{aiSpeech}"</p>
              </div>
            )}
          </div>

          {/* Skip current button */}
          {(!isPlayerSpeech || speechSubmitted) && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipCurrent}
                className="text-muted-foreground hover:text-foreground"
              >
                {currentSpeakerIndex < nominees.length - 1 ? 'Next Speech' : 'Continue to Vote'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Skip All Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSkipAll}
          className="text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Skip All Speeches
        </Button>
      </div>
    </div>
  );
};

export default NomineeSpeeches;
