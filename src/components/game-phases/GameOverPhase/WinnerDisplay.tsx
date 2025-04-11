
import React, { useEffect } from 'react';
import { Trophy, Crown, Star } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import confetti from 'canvas-confetti';

interface WinnerDisplayProps {
  winner: Houseguest;
  runnerUp: Houseguest | null;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner, runnerUp }) => {
  // Trigger confetti when component mounts
  useEffect(() => {
    const confettiOptions = {
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    };
    
    confetti(confettiOptions);
    
    // Second confetti burst after a short delay
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
    <div className="flex flex-col items-center">
      <div className="relative mb-8 mt-2">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <Crown className="h-12 w-12 text-yellow-500" />
        </div>
        <div className="w-36 h-36 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-600 flex items-center justify-center p-1.5">
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-5xl font-bold overflow-hidden">
            {winner?.avatarUrl ? (
              <img src={winner.avatarUrl} alt={winner.name} className="w-full h-full object-cover" />
            ) : (
              winner.name.charAt(0)
            )}
          </div>
        </div>
        
        <div className="absolute flex -bottom-4 left-1/2 transform -translate-x-1/2">
          <Trophy className="h-10 w-10 text-yellow-600 drop-shadow" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-center mb-2">{winner.name}</h2>
      <div className="py-1 px-3 bg-yellow-100 text-yellow-800 rounded-full inline-flex items-center gap-1 mb-4">
        <Trophy className="h-4 w-4" /> Winner
      </div>
      
      <div className="text-center mb-8">
        <p className="text-lg">{winner.age} years • {winner.hometown}</p>
        <p className="text-muted-foreground">{winner.occupation}</p>
      </div>
      
      {winner.isPlayer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-8 max-w-md">
          <Star className="inline-block text-green-500 mr-2 h-5 w-5" />
          <span className="font-medium text-green-800">Congratulations! You've won Big Brother!</span>
        </div>
      )}
      
      {runnerUp && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-center mb-4">Runner-up</h3>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl mb-2 overflow-hidden">
              {runnerUp?.avatarUrl ? (
                <img src={runnerUp.avatarUrl} alt={runnerUp.name} className="w-full h-full object-cover" />
              ) : (
                runnerUp.name.charAt(0)
              )}
            </div>
            <h4 className="font-medium">{runnerUp.name}</h4>
            <p className="text-sm text-muted-foreground">{runnerUp.age} • {runnerUp.occupation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnerDisplay;
