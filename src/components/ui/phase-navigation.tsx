
import React from 'react';
import { LucideIcon, ArrowRight, Users, Target, Shield, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type GamePhase = 
  | 'HoH' 
  | 'Nomination' 
  | 'PoVPlayerSelection' 
  | 'PoV' 
  | 'PoVMeeting' 
  | 'Eviction' 
  | 'SocialInteraction'
  | 'FinalHoH'
  | 'JuryQuestioning'
  | 'Finale'
  | 'GameOver';

export interface NavigationOption {
  label: string;
  phase: GamePhase;
  icon: LucideIcon;
  primary?: boolean;
  description?: string;
}

interface PhaseNavigationProps {
  options: NavigationOption[];
  onNavigate: (phase: GamePhase) => void;
  className?: string;
}

// Pre-configured navigation options for common transitions
export const navigationPresets = {
  afterHoH: [
    {
      label: 'Continue to Nominations',
      phase: 'Nomination' as GamePhase,
      icon: Target,
      primary: true,
      description: 'Nominate two houseguests for eviction'
    },
    {
      label: 'Talk to Houseguests First',
      phase: 'SocialInteraction' as GamePhase,
      icon: Users,
      description: 'Build alliances before nominations'
    }
  ],
  afterNomination: [
    {
      label: 'Continue to PoV Selection',
      phase: 'PoVPlayerSelection' as GamePhase,
      icon: Shield,
      primary: true,
      description: 'Draw players for the Veto competition'
    },
    {
      label: 'Campaign Period',
      phase: 'SocialInteraction' as GamePhase,
      icon: Users,
      description: 'Talk strategy with houseguests'
    }
  ],
  afterPoVMeeting: [
    {
      label: 'Continue to Eviction',
      phase: 'Eviction' as GamePhase,
      icon: Vote,
      primary: true,
      description: 'The house will vote'
    }
  ]
};

const PhaseNavigation: React.FC<PhaseNavigationProps> = ({
  options,
  onNavigate,
  className
}) => {
  if (options.length === 0) return null;
  
  // If only one option, show simple button
  if (options.length === 1) {
    const option = options[0];
    const Icon = option.icon;
    
    return (
      <div className={cn("flex justify-center", className)}>
        <Button 
          onClick={() => onNavigate(option.phase)}
          size="lg"
          className="bg-bb-blue hover:bg-bb-blue/90 text-white"
        >
          {option.label}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }
  
  // Multiple options - show card-style selection
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-center text-sm text-muted-foreground">
        Choose your next action:
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {options.map((option, index) => {
          const Icon = option.icon;
          
          return (
            <button
              key={option.phase}
              onClick={() => onNavigate(option.phase)}
              className={cn(
                "flex flex-col items-center p-6 rounded-xl border transition-all",
                "hover:shadow-game-md hover:-translate-y-1",
                option.primary
                  ? "bg-gradient-to-b from-bb-blue/10 to-card border-bb-blue/30 hover:border-bb-blue"
                  : "bg-card border-border hover:border-muted-foreground"
              )}
            >
              <div className={cn(
                "p-3 rounded-full mb-3",
                option.primary 
                  ? "bg-bb-blue/20 text-bb-blue" 
                  : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <span className={cn(
                "font-semibold text-foreground",
                option.primary && "text-bb-blue"
              )}>
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-muted-foreground mt-1 text-center max-w-[180px]">
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseNavigation;
