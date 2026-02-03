
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Crown, Target, Shield, Vote, Users, Award, MessageSquare, Trophy } from 'lucide-react';
import { GamePhase } from '@/models/game-state';

interface PhaseTitleCardProps {
  phase: GamePhase;
  week?: number;
  onDismiss?: () => void;
  autoHideDuration?: number;
  className?: string;
}

// Phase display configurations
const PHASE_CONFIG: Record<string, {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  gradient: string;
  accent: string;
}> = {
  'HoH': {
    title: 'HEAD OF HOUSEHOLD',
    subtitle: 'Competition',
    icon: Crown,
    gradient: 'from-bb-gold via-amber-500 to-bb-gold',
    accent: 'text-bb-gold'
  },
  'Nomination': {
    title: 'NOMINATION',
    subtitle: 'Ceremony',
    icon: Target,
    gradient: 'from-bb-red via-red-500 to-bb-red',
    accent: 'text-bb-red'
  },
  'PoVPlayerSelection': {
    title: 'VETO PLAYER',
    subtitle: 'Selection',
    icon: Shield,
    gradient: 'from-bb-gold via-amber-500 to-bb-gold',
    accent: 'text-bb-gold'
  },
  'PoV': {
    title: 'POWER OF VETO',
    subtitle: 'Competition',
    icon: Shield,
    gradient: 'from-bb-gold via-amber-500 to-bb-gold',
    accent: 'text-bb-gold'
  },
  'PoVMeeting': {
    title: 'VETO',
    subtitle: 'Ceremony',
    icon: Shield,
    gradient: 'from-bb-gold via-amber-500 to-bb-gold',
    accent: 'text-bb-gold'
  },
  'Eviction': {
    title: 'LIVE',
    subtitle: 'Eviction',
    icon: Vote,
    gradient: 'from-bb-red via-red-600 to-bb-red',
    accent: 'text-bb-red'
  },
  'SocialInteraction': {
    title: 'HOUSE',
    subtitle: 'Meeting',
    icon: Users,
    gradient: 'from-bb-blue via-blue-500 to-bb-blue',
    accent: 'text-bb-blue'
  },
  'FinalHoH': {
    title: 'FINAL',
    subtitle: 'Head of Household',
    icon: Crown,
    gradient: 'from-bb-gold via-amber-400 to-bb-gold',
    accent: 'text-bb-gold'
  },
  'JuryQuestioning': {
    title: 'JURY',
    subtitle: 'Questioning',
    icon: MessageSquare,
    gradient: 'from-purple-600 via-purple-500 to-purple-600',
    accent: 'text-purple-400'
  },
  'Finale': {
    title: 'GRAND',
    subtitle: 'Finale',
    icon: Trophy,
    gradient: 'from-bb-gold via-yellow-400 to-bb-gold',
    accent: 'text-bb-gold'
  },
  'GameOver': {
    title: 'SEASON',
    subtitle: 'Complete',
    icon: Award,
    gradient: 'from-bb-gold via-amber-400 to-bb-gold',
    accent: 'text-bb-gold'
  }
};

const PhaseTitleCard: React.FC<PhaseTitleCardProps> = ({
  phase,
  week,
  onDismiss,
  autoHideDuration = 2500,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Get config for this phase
  const config = PHASE_CONFIG[phase] || {
    title: phase.toUpperCase(),
    subtitle: undefined,
    icon: Award,
    gradient: 'from-primary via-primary/80 to-primary',
    accent: 'text-primary'
  };

  const Icon = config.icon;
  const subtitle = config.subtitle;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 500);
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [autoHideDuration, onDismiss]);

  const handleClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-pointer",
        "transition-opacity duration-500",
        isExiting ? "opacity-0" : "opacity-100",
        className
      )}
      onClick={handleClick}
    >
      {/* TV Static Effect Background (subtle) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full animate-pulse bg-gradient-to-b from-white/5 via-transparent to-white/5" />
      </div>

      {/* Main Content */}
      <div className={cn(
        "relative flex flex-col items-center text-center transition-all duration-700",
        isExiting ? "scale-95 opacity-0" : "scale-100 opacity-100 animate-fade-in"
      )}>
        {/* Week indicator */}
        {week && (
          <div className="mb-4 text-white/60 text-sm font-medium tracking-[0.3em] uppercase animate-fade-in">
            Week {week}
          </div>
        )}

        {/* Icon */}
        <div className={cn(
          "mb-6 p-4 rounded-full",
          `bg-gradient-to-r ${config.gradient}`,
          "animate-pulse shadow-2xl"
        )}>
          <Icon className="w-12 h-12 text-black" />
        </div>

        {/* Title */}
        <h1 className={cn(
          "text-5xl md:text-7xl font-display font-black tracking-wider mb-2",
          `bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`,
          "drop-shadow-2xl"
        )}>
          {config.title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <h2 className={cn(
            "text-2xl md:text-4xl font-display font-bold tracking-widest uppercase",
            config.accent
          )}>
            {subtitle}
          </h2>
        )}

        {/* Tap to continue hint */}
        <p className="mt-8 text-white/40 text-xs tracking-widest uppercase animate-pulse">
          Tap to continue
        </p>
      </div>

      {/* Decorative lines */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
        <div className={cn(
          "absolute w-64 h-px",
          `bg-gradient-to-r from-transparent via-current to-transparent`,
          config.accent,
          "opacity-30 -translate-y-20"
        )} />
        <div className={cn(
          "absolute w-64 h-px",
          `bg-gradient-to-r from-transparent via-current to-transparent`,
          config.accent,
          "opacity-30 translate-y-24"
        )} />
      </div>
    </div>
  );
};

export default PhaseTitleCard;
