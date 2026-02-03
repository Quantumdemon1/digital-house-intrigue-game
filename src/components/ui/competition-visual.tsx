
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Dumbbell, 
  Brain, 
  Clock, 
  Users, 
  Dice6,
  Trophy,
  Loader2
} from 'lucide-react';
import { CompetitionType } from '@/models/houseguest/types';

interface CompetitionVisualProps {
  type: CompetitionType | null;
  status: 'idle' | 'running' | 'complete';
  winner?: string;
  className?: string;
}

const typeConfig: Record<CompetitionType, {
  icon: React.ElementType;
  label: string;
  gradient: string;
}> = {
  physical: {
    icon: Dumbbell,
    label: 'Physical Competition',
    gradient: 'from-orange-500 to-red-600'
  },
  mental: {
    icon: Brain,
    label: 'Mental Competition',
    gradient: 'from-purple-500 to-indigo-600'
  },
  endurance: {
    icon: Clock,
    label: 'Endurance Competition',
    gradient: 'from-green-500 to-teal-600'
  },
  social: {
    icon: Users,
    label: 'Social Competition',
    gradient: 'from-pink-500 to-rose-600'
  },
  luck: {
    icon: Dice6,
    label: 'Luck Competition',
    gradient: 'from-yellow-500 to-amber-600'
  }
};

export const CompetitionVisual: React.FC<CompetitionVisualProps> = ({
  type,
  status,
  winner,
  className
}) => {
  const config = type ? typeConfig[type] : null;
  const Icon = config?.icon || Trophy;

  return (
    <div 
      className={cn(
        'competition-visual relative w-full h-48 md:h-64 rounded-xl overflow-hidden',
        config && `bg-gradient-to-br ${config.gradient}`,
        !config && 'bg-gradient-to-br from-bb-dark to-gray-800',
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-surveillance-pattern opacity-10" />
      
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
        {status === 'running' ? (
          <>
            <div className="relative">
              <Icon className="w-16 h-16 md:w-24 md:h-24 animate-pulse-slow opacity-80" />
              <Loader2 className="absolute -bottom-2 -right-2 w-8 h-8 animate-spin" />
            </div>
            <h3 className="mt-4 text-xl md:text-2xl font-bold text-center">
              Competition in Progress
            </h3>
            <p className="text-sm md:text-base opacity-80 mt-2">
              {config?.label || 'Random Competition'}
            </p>
            {/* Progress bar */}
            <div className="w-full max-w-xs mt-6 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-competition-progress rounded-full" />
            </div>
          </>
        ) : status === 'complete' ? (
          <>
            <Trophy className="w-16 h-16 md:w-24 md:h-24 text-bb-gold animate-celebrate-winner" />
            <h3 className="mt-4 text-xl md:text-2xl font-bold text-center">
              {winner} Wins!
            </h3>
            <p className="text-sm md:text-base opacity-80 mt-2">
              {config?.label || 'Competition Complete'}
            </p>
          </>
        ) : (
          <>
            <Icon className="w-16 h-16 md:w-24 md:h-24 opacity-60" />
            <h3 className="mt-4 text-xl md:text-2xl font-bold text-center">
              {config?.label || 'Competition'}
            </h3>
            <p className="text-sm md:text-base opacity-80 mt-2">
              Ready to begin
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Competition type badge
interface CompetitionTypeBadgeProps {
  type: CompetitionType;
  className?: string;
}

export const CompetitionTypeBadge: React.FC<CompetitionTypeBadgeProps> = ({
  type,
  className
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white',
        `bg-gradient-to-r ${config.gradient}`,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
    </div>
  );
};

export default CompetitionVisual;
