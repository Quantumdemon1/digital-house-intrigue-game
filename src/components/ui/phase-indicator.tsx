
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Crown, 
  Target, 
  Shield, 
  UserMinus, 
  Users,
  MessageCircle,
  Trophy,
  Check,
  Play
} from 'lucide-react';
import { GamePhase } from '@/models/game-state';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PhaseConfig {
  icon: React.ElementType;
  label: string;
  shortLabel: string;
}

// Create a partial config for known phases we want to display
const phaseConfigs: Partial<Record<GamePhase, PhaseConfig>> = {
  'Setup': { icon: Users, label: 'Setup', shortLabel: 'Setup' },
  'Initialization': { icon: Play, label: 'Initialization', shortLabel: 'Init' },
  'HoH': { icon: Crown, label: 'Head of Household', shortLabel: 'HoH' },
  'HOH Competition': { icon: Crown, label: 'HoH Competition', shortLabel: 'HoH' },
  'Nomination': { icon: Target, label: 'Nomination Ceremony', shortLabel: 'Noms' },
  'PoVPlayerSelection': { icon: Shield, label: 'PoV Player Selection', shortLabel: 'PoV Pick' },
  'POV Player Selection': { icon: Shield, label: 'PoV Player Selection', shortLabel: 'PoV Pick' },
  'PoV': { icon: Shield, label: 'Power of Veto', shortLabel: 'PoV' },
  'POV Competition': { icon: Shield, label: 'PoV Competition', shortLabel: 'PoV' },
  'PoVMeeting': { icon: Shield, label: 'Veto Meeting', shortLabel: 'Veto' },
  'POV Meeting': { icon: Shield, label: 'Veto Meeting', shortLabel: 'Veto' },
  'Eviction': { icon: UserMinus, label: 'Live Eviction', shortLabel: 'Evict' },
  'SocialInteraction': { icon: MessageCircle, label: 'Social Time', shortLabel: 'Social' },
  'FinalHoH': { icon: Trophy, label: 'Final HoH', shortLabel: 'Final' },
  'Final HOH Part1': { icon: Trophy, label: 'Final HoH Part 1', shortLabel: 'Final 1' },
  'Final HOH Part2': { icon: Trophy, label: 'Final HoH Part 2', shortLabel: 'Final 2' },
  'Final HOH Part3': { icon: Trophy, label: 'Final HoH Part 3', shortLabel: 'Final 3' },
  'JuryQuestioning': { icon: MessageCircle, label: 'Jury Questioning', shortLabel: 'Jury Q' },
  'Jury Questioning': { icon: MessageCircle, label: 'Jury Questioning', shortLabel: 'Jury Q' },
  'Finale': { icon: Trophy, label: 'Finale', shortLabel: 'Finale' },
  'GameOver': { icon: Trophy, label: 'Game Over', shortLabel: 'End' }
};

// Define the weekly cycle of phases for the indicator
type WeeklyPhase = 'HoH' | 'Nomination' | 'PoVPlayerSelection' | 'PoV' | 'PoVMeeting' | 'Eviction';
const weeklyPhases: WeeklyPhase[] = [
  'HoH',
  'Nomination',
  'PoVPlayerSelection',
  'PoV',
  'PoVMeeting',
  'Eviction'
];

// Helper to get config for any phase
const getPhaseConfig = (phase: GamePhase): PhaseConfig => {
  return phaseConfigs[phase] || { icon: Trophy, label: phase, shortLabel: phase };
};

interface PhaseIndicatorProps {
  currentPhase: GamePhase;
  week: number;
  className?: string;
  compact?: boolean;
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  currentPhase,
  week,
  className,
  compact = false
}) => {
  // Map current phase to weekly phase equivalent
  const normalizePhase = (phase: GamePhase): WeeklyPhase | null => {
    if (phase === 'HoH' || phase === 'HOH Competition') return 'HoH';
    if (phase === 'Nomination') return 'Nomination';
    if (phase === 'PoVPlayerSelection' || phase === 'POV Player Selection') return 'PoVPlayerSelection';
    if (phase === 'PoV' || phase === 'POV Competition') return 'PoV';
    if (phase === 'PoVMeeting' || phase === 'POV Meeting') return 'PoVMeeting';
    if (phase === 'Eviction') return 'Eviction';
    return null;
  };

  // For end-game phases, show simplified indicator
  const isEndGame = ['FinalHoH', 'Final HOH Part1', 'Final HOH Part2', 'Final HOH Part3', 'JuryQuestioning', 'Jury Questioning', 'Finale', 'GameOver'].includes(currentPhase);
  
  if (isEndGame) {
    const config = getPhaseConfig(currentPhase);
    return (
      <div className={cn('flex items-center justify-center gap-3 py-3 px-4 bg-muted/30 rounded-lg', className)}>
        <div className="phase-step-circle active">
          <config.icon className="w-5 h-5" />
        </div>
        <span className="font-semibold text-primary">{config.label}</span>
      </div>
    );
  }

  const normalizedCurrent = normalizePhase(currentPhase);
  const currentIndex = normalizedCurrent ? weeklyPhases.indexOf(normalizedCurrent) : -1;

  // For setup/initialization, don't show weekly phases
  if (currentPhase === 'Setup' || currentPhase === 'Initialization' || currentPhase === 'SocialInteraction') {
    const config = getPhaseConfig(currentPhase);
    return (
      <div className={cn('flex items-center justify-center gap-3 py-3 px-4 bg-muted/30 rounded-lg', className)}>
        <div className="phase-step-circle active">
          <config.icon className="w-5 h-5" />
        </div>
        <span className="font-semibold text-primary">{config.label}</span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn(
        'flex items-center justify-between gap-1 py-3 px-4 bg-muted/30 rounded-lg',
        className
      )}>
        {weeklyPhases.map((phase, index) => {
          const config = getPhaseConfig(phase);
          const isCompleted = currentIndex > index;
          const isActive = normalizedCurrent === phase;
          const Icon = config.icon;

          return (
            <React.Fragment key={phase}>
              {index > 0 && (
                <div 
                  className={cn(
                    'flex-1 h-0.5 max-w-8 transition-all duration-300',
                    isCompleted ? 'bg-game-success' : 'bg-border'
                  )}
                />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 min-w-[48px] cursor-default">
                    <div 
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
                        isCompleted && 'bg-game-success text-white',
                        isActive && 'bg-primary text-primary-foreground scale-110 shadow-glow-primary animate-pulse-glow',
                        !isCompleted && !isActive && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span 
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-wide text-center whitespace-nowrap',
                        isActive && 'text-primary font-bold',
                        isCompleted && 'text-game-success',
                        !isActive && !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      {config.shortLabel}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-medium">
                  {config.label}
                </TooltipContent>
              </Tooltip>
            </React.Fragment>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

// Simplified phase badge for inline use
interface PhaseBadgeProps {
  phase: GamePhase;
  className?: string;
}

export const PhaseBadge: React.FC<PhaseBadgeProps> = ({ phase, className }) => {
  const config = getPhaseConfig(phase);
  const Icon = config.icon;
  
  return (
    <div className={cn('bb-badge primary', className)}>
      <Icon className="w-3 h-3" />
      <span>{config.shortLabel}</span>
    </div>
  );
};

// Week indicator component
interface WeekIndicatorProps {
  week: number;
  className?: string;
}

export const WeekIndicator: React.FC<WeekIndicatorProps> = ({ week, className }) => (
  <div className={cn('flex items-center gap-2', className)}>
    <span className="text-xs text-muted-foreground uppercase tracking-wider">Week</span>
    <span className="font-display font-bold text-xl text-primary">{week}</span>
  </div>
);

export default PhaseIndicator;
