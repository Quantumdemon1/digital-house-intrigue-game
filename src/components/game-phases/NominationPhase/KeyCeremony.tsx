
import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Key, Target, ChevronRight, Crown, AlertCircle, User, SkipForward } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { GameCard, GameCardHeader, GameCardContent, GameCardTitle, GameCardDescription } from '@/components/ui/game-card';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KeyCeremonyProps {
  hoh: Houseguest;
  nominees: Houseguest[];
  eligibleHouseguests: Houseguest[];
  onComplete: () => void;
}

interface KeyReveal {
  houseguestId: string;
  houseguest: Houseguest;
  revealed: boolean;
  isSafe: boolean;
}

export const KeyCeremony: React.FC<KeyCeremonyProps> = ({
  hoh,
  nominees,
  eligibleHouseguests,
  onComplete
}) => {
  const [keyReveals, setKeyReveals] = useState<KeyReveal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [ceremonyStarted, setCeremonyStarted] = useState(false);
  const [ceremonyComplete, setCeremonyComplete] = useState(false);
  
  // Skip to end function
  const skipToEnd = useCallback(() => {
    // Mark all as revealed
    setKeyReveals(prev => prev.map(reveal => ({ ...reveal, revealed: true })));
    setCeremonyComplete(true);
  }, []);
  
  // Initialize key reveals (safe houseguests + nominees at end)
  useEffect(() => {
    const nomineeIds = nominees.map(n => n.id);
    const safeGuests = eligibleHouseguests.filter(h => !nomineeIds.includes(h.id));
    
    // Shuffle safe guests for dramatic effect
    const shuffledSafe = [...safeGuests].sort(() => Math.random() - 0.5);
    
    const reveals: KeyReveal[] = [
      ...shuffledSafe.map(h => ({
        houseguestId: h.id,
        houseguest: h,
        revealed: false,
        isSafe: true
      })),
      // Nominees revealed last
      ...nominees.map(h => ({
        houseguestId: h.id,
        houseguest: h,
        revealed: false,
        isSafe: false
      }))
    ];
    
    setKeyReveals(reveals);
  }, [eligibleHouseguests, nominees]);
  
  const startCeremony = () => {
    setCeremonyStarted(true);
    setCurrentIndex(0);
  };
  
  const revealNextKey = useCallback(() => {
    if (currentIndex >= keyReveals.length - 1) {
      setCeremonyComplete(true);
      return;
    }
    
    // Mark current as revealed
    setKeyReveals(prev => prev.map((reveal, i) => 
      i === currentIndex ? { ...reveal, revealed: true } : reveal
    ));
    
    // Move to next after delay
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 1500);
  }, [currentIndex, keyReveals.length]);
  
  // Auto-reveal for safe houseguests, pause at nominees
  useEffect(() => {
    if (!ceremonyStarted || currentIndex < 0 || ceremonyComplete) return;
    
    const currentReveal = keyReveals[currentIndex];
    if (!currentReveal) return;
    
    // Auto-reveal safe houseguests
    if (currentReveal.isSafe && !currentReveal.revealed) {
      const timer = setTimeout(revealNextKey, 2000);
      return () => clearTimeout(timer);
    }
  }, [ceremonyStarted, currentIndex, keyReveals, ceremonyComplete, revealNextKey]);
  
  const getCurrentReveal = () => keyReveals[currentIndex];
  
  // Pre-ceremony state
  if (!ceremonyStarted) {
    return (
      <GameCard variant="primary">
        <GameCardHeader variant="primary" icon={Key}>
          <div className="flex items-center justify-between w-full">
            <div>
              <GameCardTitle>Nomination Ceremony</GameCardTitle>
              <GameCardDescription>The Key Ceremony</GameCardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipToEnd}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>
        </GameCardHeader>
        
        <GameCardContent className="space-y-6">
          <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Head of Household</span>
            </div>
            <StatusAvatar
              name={hoh.name}
              imageUrl={hoh.avatarUrl}
              status="hoh"
              size="lg"
              className="mx-auto mb-3"
            />
            <h3 className="text-xl font-bold">{hoh.name}</h3>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              {hoh.name} has made their decision. The keys will now be revealed
              to determine who is safe and who has been nominated.
            </p>
            <p className="text-sm text-muted-foreground italic">
              "This is the nomination ceremony. It is my responsibility as Head of Household
              to nominate two houseguests for eviction."
            </p>
          </div>
          
          {/* Key Box Visual */}
          <div className="flex justify-center">
            <div className="relative w-32 h-24 bg-gradient-to-b from-bb-gold to-amber-700 rounded-lg shadow-lg flex items-center justify-center">
              <div className="absolute inset-1 bg-black/20 rounded-md" />
              <Key className="w-12 h-12 text-white/80 relative z-10" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-gradient-to-b from-bb-gold to-amber-700 rounded-b-lg" />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={startCeremony}
              size="lg"
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            >
              Begin Key Ceremony
            </Button>
            <Button
              onClick={skipToEnd}
              variant="outline"
              size="lg"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Ceremony complete
  if (ceremonyComplete) {
    return (
      <GameCard variant="danger">
        <GameCardHeader variant="danger" icon={Target}>
          <GameCardTitle>Nominees Revealed</GameCardTitle>
          <GameCardDescription>The nominations are final</GameCardDescription>
        </GameCardHeader>
        
        <GameCardContent className="space-y-6">
          <div className="text-center p-6 bg-bb-red/10 rounded-lg border border-bb-red/30">
            <h3 className="text-lg font-bold text-bb-red mb-4">Nominated for Eviction</h3>
            <div className="flex justify-center gap-8">
              {nominees.map(nominee => (
                <div key={nominee.id} className="flex flex-col items-center">
                  <StatusAvatar
                    name={nominee.name}
                    imageUrl={nominee.avatarUrl}
                    status="nominee"
                    size="lg"
                    className="animate-shake"
                  />
                  <span className="mt-2 font-semibold">{nominee.name}</span>
                  {nominee.isPlayer && <Badge variant="secondary" className="mt-1">You</Badge>}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-muted-foreground italic">
              "{hoh.name}: I have nominated you, {nominees.map(n => n.name).join(' and ')}, for eviction.
              One of you will be leaving the Big Brother house. This meeting is adjourned."
            </p>
          </div>
          
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full"
          >
            Continue to PoV Player Selection
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </GameCardContent>
      </GameCard>
    );
  }
  
  // Active ceremony - revealing keys
  const currentReveal = getCurrentReveal();
  
  return (
    <GameCard variant="primary">
      <GameCardHeader variant="primary" icon={Key}>
        <div className="flex items-center justify-between w-full">
          <div>
            <GameCardTitle>Nomination Ceremony</GameCardTitle>
            <GameCardDescription>
              Revealing key {currentIndex + 1} of {keyReveals.length}
            </GameCardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={skipToEnd}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Current Reveal */}
        {currentReveal && (
          <div className="text-center p-8 bg-muted/50 rounded-lg border animate-fade-in">
            {currentReveal.revealed ? (
              <>
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4",
                  currentReveal.isSafe 
                    ? "bg-bb-green/10 text-bb-green" 
                    : "bg-bb-red/10 text-bb-red"
                )}>
                  {currentReveal.isSafe ? (
                    <>
                      <Key className="h-4 w-4" />
                      <span className="font-medium">SAFE</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      <span className="font-medium">NOMINATED</span>
                    </>
                  )}
                </div>
                <StatusAvatar
                  name={currentReveal.houseguest.name}
                  imageUrl={currentReveal.houseguest.avatarUrl}
                  status={currentReveal.isSafe ? "safe" : "nominee"}
                  size="xl"
                  className="mx-auto mb-3"
                />
                <h3 className="text-2xl font-bold">{currentReveal.houseguest.name}</h3>
                {currentReveal.houseguest.isPlayer && (
                  <Badge variant="secondary" className="mt-2">You</Badge>
                )}
              </>
            ) : (
              <>
                <div className="w-24 h-24 mx-auto bg-gradient-to-b from-bb-gold to-amber-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Key className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground">Revealing...</h3>
              </>
            )}
          </div>
        )}
        
        {/* All Keys Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {keyReveals.map((reveal, index) => (
            <div
              key={reveal.houseguestId}
              className={cn(
                "relative flex flex-col items-center p-2 rounded-lg border transition-all",
                index < currentIndex && reveal.revealed && reveal.isSafe && "bg-bb-green/5 border-bb-green/30",
                index < currentIndex && reveal.revealed && !reveal.isSafe && "bg-bb-red/5 border-bb-red/30",
                index === currentIndex && "bg-primary/10 border-primary ring-2 ring-primary/50",
                index > currentIndex && "bg-muted/30 border-border opacity-50"
              )}
            >
              {index < currentIndex && reveal.revealed ? (
                <StatusAvatar
                  name={reveal.houseguest.name}
                  size="sm"
                  status={reveal.isSafe ? "safe" : "nominee"}
                />
              ) : (
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  index === currentIndex 
                    ? "bg-gradient-to-b from-bb-gold to-amber-600" 
                    : "bg-muted"
                )}>
                  {index === currentIndex ? (
                    <Key className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              )}
              <span className="text-xs mt-1 truncate w-full text-center">
                {index < currentIndex && reveal.revealed 
                  ? reveal.houseguest.name.split(' ')[0]
                  : `Key ${index + 1}`}
              </span>
            </div>
          ))}
        </div>
        
        {/* Manual advance for nominees */}
        {currentReveal && !currentReveal.isSafe && !currentReveal.revealed && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-bb-red/10 border border-bb-red/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-bb-red mx-auto mb-2" />
              <p className="text-sm text-bb-red font-medium">
                The remaining houseguests are nominees
              </p>
            </div>
            <Button onClick={revealNextKey} variant="destructive">
              Reveal Nominee
            </Button>
          </div>
        )}
      </GameCardContent>
    </GameCard>
  );
};

export default KeyCeremony;
