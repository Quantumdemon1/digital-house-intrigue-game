
import React, { useEffect } from 'react';
import { Trophy, Crown, Star, Award } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Badge } from '@/components/ui/badge';
import { StatusAvatar } from '@/components/ui/status-avatar';
import confetti from 'canvas-confetti';

interface WinnerDisplayProps {
  winner: Houseguest;
  runnerUp?: Houseguest | null;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner, runnerUp }) => {
  // Trigger confetti when component mounts
  useEffect(() => {
    const confettiOptions = {
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFA500', '#FFD700', '#FF6347', '#00CED1', '#9370DB']
    };
    
    confetti(confettiOptions);
    
    const timer = setTimeout(() => {
      confetti({
        ...confettiOptions,
        particleCount: 100,
        origin: { y: 0.7, x: 0.3 }
      });
      
      setTimeout(() => {
        confetti({
          ...confettiOptions,
          particleCount: 100,
          origin: { y: 0.7, x: 0.7 }
        });
      }, 300);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex flex-col items-center py-8">
      {/* Winner Section */}
      <div className="relative mb-8">
        {/* Crown */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10">
          <div className="p-2 rounded-full bg-gradient-to-b from-bb-gold to-amber-600 shadow-lg animate-bounce">
            <Crown className="h-10 w-10 text-white" />
          </div>
        </div>
        
        {/* Winner Avatar with glow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-bb-gold via-amber-400 to-bb-gold blur-xl opacity-50 animate-glow scale-110" />
          <div className="relative p-1.5 rounded-full bg-gradient-to-r from-bb-gold via-amber-400 to-bb-gold">
            <div className="w-40 h-40 rounded-full bg-card overflow-hidden border-4 border-white shadow-2xl">
              {winner?.avatarUrl ? (
                <img src={winner.avatarUrl} alt={winner.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-6xl font-bold text-foreground">
                  {winner.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          
          {/* Trophy Badge */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="p-2 rounded-full bg-gradient-to-r from-bb-gold to-amber-500 shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Winner Name */}
      <h2 className="text-4xl font-display font-bold text-foreground mt-4 mb-2">
        {winner.name}
      </h2>
      
      <Badge className="bg-gradient-to-r from-bb-gold to-amber-500 text-white border-0 text-sm px-4 py-1 mb-4">
        <Trophy className="h-4 w-4 mr-1" /> Champion
      </Badge>
      
      <div className="text-center mb-6">
        <p className="text-lg text-foreground">{winner.age} years • {winner.hometown}</p>
        <p className="text-muted-foreground">{winner.occupation}</p>
      </div>
      
      {/* Player Win Message */}
      {winner.isPlayer && (
        <div className="bg-gradient-to-r from-bb-green/10 to-bb-green/5 border border-bb-green/20 rounded-xl p-6 text-center mb-8 max-w-md animate-reveal">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-6 w-6 text-bb-green" />
            <span className="font-bold text-xl text-bb-green">Congratulations!</span>
            <Star className="h-6 w-6 text-bb-green" />
          </div>
          <p className="text-foreground">You've won Big Brother and claimed the grand prize!</p>
        </div>
      )}
      
      {/* Runner-up Section */}
      {runnerUp && (
        <div className="mt-6 pt-6 border-t border-border w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-muted-foreground">Runner-up</h3>
          </div>
          
          <div className="flex flex-col items-center">
            <StatusAvatar
              name={runnerUp.name}
              imageUrl={runnerUp.avatarUrl}
              size="lg"
              isPlayer={runnerUp.isPlayer}
            />
            <h4 className="font-semibold text-lg mt-3 text-foreground">{runnerUp.name}</h4>
            <p className="text-sm text-muted-foreground">{runnerUp.age} • {runnerUp.occupation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnerDisplay;
