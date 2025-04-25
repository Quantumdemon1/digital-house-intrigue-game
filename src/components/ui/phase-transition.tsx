
import React, { useState, useEffect } from 'react';
import { Card } from './card';
import { animations } from '@/lib/animations';
import { GamePhase } from '@/models/game-state';

interface PhaseTransitionProps {
  previousPhase: GamePhase;
  currentPhase: GamePhase;
  onTransitionComplete?: () => void;
}

export const PhaseTransition: React.FC<PhaseTransitionProps> = ({
  previousPhase,
  currentPhase,
  onTransitionComplete
}) => {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(previousPhase);
  
  useEffect(() => {
    // Show the previous phase first
    setPhase(previousPhase);
    setVisible(true);
    
    // After a delay, hide it
    const timer1 = setTimeout(() => {
      setVisible(false);
    }, 1000);
    
    // After it's hidden, change to new phase
    const timer2 = setTimeout(() => {
      setPhase(currentPhase);
      setVisible(true);
    }, 1500);
    
    // After showing the new phase, call the completion handler
    const timer3 = setTimeout(() => {
      if (onTransitionComplete) {
        onTransitionComplete();
      }
    }, 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [previousPhase, currentPhase, onTransitionComplete]);
  
  // Format phase name for display
  const formatPhaseName = (phase: GamePhase) => {
    return phase.replace(/([A-Z])/g, ' $1').trim();
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <Card 
        className={`
          p-8 transition-all duration-500
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${visible ? 'animate-phase-transition' : ''}
        `}
      >
        <div className="text-center">
          <div className="mb-2 text-sm text-muted-foreground">
            {visible ? 'Now entering' : 'Leaving'}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {formatPhaseName(phase)}
          </h2>
          <div className="mt-4 flex justify-center space-x-2">
            <span className={`h-2 w-2 rounded-full ${phase === previousPhase ? 'bg-primary' : 'bg-muted'}`}></span>
            <span className={`h-2 w-2 rounded-full ${phase === currentPhase ? 'bg-primary' : 'bg-muted'}`}></span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PhaseTransition;
