
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Dumbbell, 
  Brain, 
  Clock, 
  Users, 
  Dice6,
  Trophy,
  Loader2,
  Target,
  Zap
} from 'lucide-react';
import { CompetitionType } from '@/models/houseguest/types';
import { BBCompetitionCategory } from '@/models/competition';

interface CompetitionVisualProps {
  type: CompetitionType | BBCompetitionCategory | null;
  status: 'idle' | 'running' | 'complete';
  winner?: string;
  className?: string;
}

// Config for legacy competition types
const legacyTypeConfig: Record<CompetitionType, {
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

// Config for BB USA competition categories
const bbCategoryConfig: Record<BBCompetitionCategory, {
  icon: React.ElementType;
  label: string;
  description: string;
  gradient: string;
}> = {
  'Endurance': {
    icon: Clock,
    label: 'Endurance Competition',
    description: 'Outlast the competition!',
    gradient: 'from-emerald-500 to-teal-600'
  },
  'Physical': {
    icon: Dumbbell,
    label: 'Physical Competition',
    description: 'Strength and agility!',
    gradient: 'from-orange-500 to-red-600'
  },
  'Mental': {
    icon: Brain,
    label: 'Mental Competition',
    description: 'Puzzles and strategy!',
    gradient: 'from-purple-500 to-indigo-600'
  },
  'Skill': {
    icon: Target,
    label: 'Skill Competition',
    description: 'Precision and focus!',
    gradient: 'from-blue-500 to-cyan-600'
  },
  'Crapshoot': {
    icon: Dice6,
    label: 'Crapshoot Competition',
    description: 'Anyone can win!',
    gradient: 'from-yellow-500 to-amber-600'
  }
};

function getConfig(type: CompetitionType | BBCompetitionCategory | null) {
  if (!type) return null;
  
  // Check if it's a BB category (capitalized)
  if (type in bbCategoryConfig) {
    return bbCategoryConfig[type as BBCompetitionCategory];
  }
  
  // Fall back to legacy types
  if (type in legacyTypeConfig) {
    return legacyTypeConfig[type as CompetitionType];
  }
  
  return null;
}

export const CompetitionVisual: React.FC<CompetitionVisualProps> = ({
  type,
  status,
  winner,
  className
}) => {
  const config = getConfig(type);
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

// Competition type badge - supports both legacy and BB USA types
interface CompetitionTypeBadgeProps {
  type: CompetitionType | BBCompetitionCategory;
  className?: string;
  showDescription?: boolean;
}

export const CompetitionTypeBadge: React.FC<CompetitionTypeBadgeProps> = ({
  type,
  className,
  showDescription = false
}) => {
  const config = getConfig(type);
  if (!config) return null;
  
  const Icon = config.icon;
  const displayType = typeof type === 'string' ? type.charAt(0).toUpperCase() + type.slice(1) : type;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white',
        `bg-gradient-to-r ${config.gradient}`,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{displayType}</span>
    </div>
  );
};

// BB Category selector for showing all competition types
interface CompetitionCategorySelectorProps {
  selectedCategory?: BBCompetitionCategory;
  onSelect?: (category: BBCompetitionCategory) => void;
  className?: string;
}

export const CompetitionCategorySelector: React.FC<CompetitionCategorySelectorProps> = ({
  selectedCategory,
  onSelect,
  className
}) => {
  const categories: BBCompetitionCategory[] = ['Endurance', 'Physical', 'Mental', 'Skill', 'Crapshoot'];
  
  return (
    <div className={cn('flex flex-wrap gap-2 justify-center', className)}>
      {categories.map(category => {
        const config = bbCategoryConfig[category];
        const Icon = config.icon;
        const isSelected = selectedCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => onSelect?.(category)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
              isSelected 
                ? `bg-gradient-to-r ${config.gradient} border-transparent text-white` 
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <Icon className="w-4 h-4" />
            <div className="text-left">
              <span className="block text-sm font-medium">{category}</span>
              {!isSelected && (
                <span className="block text-xs text-muted-foreground">{config.description}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CompetitionVisual;
