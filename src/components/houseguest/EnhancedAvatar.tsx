import React from 'react';
import { motion } from 'framer-motion';
import { Houseguest, PersonalityTrait } from '@/models/houseguest';
import { cn } from '@/lib/utils';
import { Crown, Target, Shield, UserX, Smile, Meh, Frown, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'hoh' | 'nominee' | 'pov' | 'safe' | 'evicted' | 'none';

interface EnhancedAvatarProps {
  houseguest: Houseguest;
  size?: AvatarSize;
  status?: AvatarStatus;
  showMood?: boolean;
  showStatus?: boolean;
  showBadge?: boolean;
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; badge: string; mood: string }> = {
  xs: { container: 'w-8 h-8', text: 'text-xs', badge: 'w-4 h-4 -top-0.5 -right-0.5', mood: 'w-3 h-3' },
  sm: { container: 'w-10 h-10', text: 'text-sm', badge: 'w-5 h-5 -top-0.5 -right-0.5', mood: 'w-3.5 h-3.5' },
  md: { container: 'w-14 h-14', text: 'text-base', badge: 'w-6 h-6 -top-1 -right-1', mood: 'w-4 h-4' },
  lg: { container: 'w-20 h-20', text: 'text-xl', badge: 'w-8 h-8 -top-1 -right-1', mood: 'w-5 h-5' },
  xl: { container: 'w-28 h-28', text: 'text-3xl', badge: 'w-10 h-10 -top-2 -right-2', mood: 'w-6 h-6' },
};

// Trait-based gradient mappings
const traitGradients: Record<PersonalityTrait, string> = {
  Strategic: 'from-blue-500 via-purple-500 to-indigo-600',
  Social: 'from-pink-400 via-rose-400 to-orange-400',
  Competitive: 'from-red-500 via-orange-500 to-amber-500',
  Loyal: 'from-emerald-400 via-teal-400 to-cyan-500',
  Sneaky: 'from-purple-600 via-violet-700 to-slate-800',
  Emotional: 'from-pink-500 via-red-400 to-rose-500',
  Analytical: 'from-cyan-400 via-blue-500 to-indigo-500',
  Charming: 'from-amber-400 via-orange-400 to-yellow-400',
  Manipulative: 'from-violet-500 via-purple-600 to-fuchsia-600',
  Funny: 'from-yellow-400 via-amber-400 to-orange-400',
  Impulsive: 'from-rose-500 via-red-500 to-orange-500',
  Deceptive: 'from-slate-600 via-gray-700 to-zinc-800',
  Introverted: 'from-slate-400 via-blue-400 to-indigo-400',
  Stubborn: 'from-amber-600 via-orange-600 to-red-600',
  Flexible: 'from-teal-400 via-cyan-400 to-sky-400',
  Intuitive: 'from-violet-400 via-purple-400 to-fuchsia-400',
  Confrontational: 'from-red-600 via-rose-600 to-pink-600',
};

const statusConfig: Record<AvatarStatus, { 
  ringColor: string; 
  glowColor: string; 
  BadgeIcon: React.ElementType;
  badgeBg: string;
}> = {
  hoh: { 
    ringColor: 'ring-bb-gold', 
    glowColor: 'shadow-glow-gold',
    BadgeIcon: Crown,
    badgeBg: 'bg-gradient-to-br from-bb-gold to-amber-600'
  },
  nominee: { 
    ringColor: 'ring-bb-red', 
    glowColor: 'shadow-glow-danger',
    BadgeIcon: Target,
    badgeBg: 'bg-gradient-to-br from-bb-red to-red-700'
  },
  pov: { 
    ringColor: 'ring-bb-gold', 
    glowColor: 'shadow-glow-gold',
    BadgeIcon: Shield,
    badgeBg: 'bg-gradient-to-br from-bb-gold to-amber-600'
  },
  safe: { 
    ringColor: 'ring-bb-green', 
    glowColor: 'shadow-glow-success',
    BadgeIcon: Star,
    badgeBg: 'bg-gradient-to-br from-bb-green to-emerald-600'
  },
  evicted: { 
    ringColor: 'ring-muted', 
    glowColor: '',
    BadgeIcon: UserX,
    badgeBg: 'bg-muted'
  },
  none: { 
    ringColor: 'ring-transparent', 
    glowColor: '',
    BadgeIcon: () => null,
    badgeBg: ''
  },
};

const MoodIcon: React.FC<{ mood: number; className?: string }> = ({ mood, className }) => {
  if (mood >= 70) return <Smile className={cn('text-bb-green', className)} />;
  if (mood >= 40) return <Meh className={cn('text-bb-gold', className)} />;
  return <Frown className={cn('text-bb-red', className)} />;
};

export const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
  houseguest,
  size = 'md',
  status = 'none',
  showMood = false,
  showStatus = true,
  showBadge = true,
  animated = true,
  onClick,
  className,
}) => {
  const sizeConfig = sizeClasses[size];
  const statusCfg = statusConfig[status];
  
  // Get gradient based on primary trait
  const primaryTrait = houseguest.traits[0] as PersonalityTrait;
  const gradient = traitGradients[primaryTrait] || 'from-slate-400 to-slate-600';
  
  // Calculate initials
  const initials = houseguest.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isActive = houseguest.status === 'Active';
  
  // Convert mood from string type to numeric for display
  const moodMap: Record<string, number> = {
    'Happy': 90, 'Content': 70, 'Neutral': 50, 'Upset': 30, 'Angry': 10
  };
  const moodValue = houseguest.mood ? moodMap[houseguest.mood] ?? 50 : 50;

  const avatarContent = (
    <motion.div
      className={cn(
        'relative inline-flex',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={animated && onClick ? { scale: 1.05 } : undefined}
      whileTap={animated && onClick ? { scale: 0.95 } : undefined}
    >
      {/* Animated status ring */}
      {showStatus && status !== 'none' && status !== 'evicted' && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full',
            statusCfg.ringColor,
            'ring-[3px] ring-offset-2 ring-offset-background'
          )}
          animate={animated ? {
            boxShadow: [
              `0 0 10px hsl(var(--bb-${status === 'nominee' ? 'red' : 'gold'}) / 0.3)`,
              `0 0 25px hsl(var(--bb-${status === 'nominee' ? 'red' : 'gold'}) / 0.6)`,
              `0 0 10px hsl(var(--bb-${status === 'nominee' ? 'red' : 'gold'}) / 0.3)`,
            ]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main avatar */}
      <div
        className={cn(
          sizeConfig.container,
          'rounded-full relative overflow-hidden',
          'ring-2 ring-background',
          isActive ? '' : 'grayscale opacity-60',
          houseguest.isPlayer && 'ring-4 ring-bb-green ring-offset-2 ring-offset-background',
          statusCfg.glowColor
        )}
      >
        {houseguest.avatarUrl ? (
          <img 
            src={houseguest.avatarUrl} 
            alt={houseguest.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            {/* Gradient background */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br',
              gradient
            )} />
            
            {/* Lens overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
            
            {/* Scan line effect */}
            {animated && isActive && (
              <motion.div
                className="absolute inset-x-0 h-1/4 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"
                animate={{ y: ['-100%', '400%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            )}
            
            {/* Initials */}
            <div className={cn(
              'absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-lg',
              sizeConfig.text
            )}>
              {initials}
            </div>
          </>
        )}
      </div>

      {/* Status badge */}
      {showBadge && status !== 'none' && (
        <motion.div
          className={cn(
            'absolute rounded-full flex items-center justify-center text-white shadow-lg',
            sizeConfig.badge,
            statusCfg.badgeBg
          )}
          initial={animated ? { scale: 0 } : undefined}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <statusCfg.BadgeIcon className="w-3/5 h-3/5" />
        </motion.div>
      )}

      {/* Player indicator */}
      {houseguest.isPlayer && (
        <div className={cn(
          'absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full',
          'bg-bb-green text-white text-[8px] font-bold shadow-md',
          size === 'xs' && 'text-[6px] px-1'
        )}>
          YOU
        </div>
      )}

      {/* Mood indicator */}
      {showMood && isActive && (
        <div className={cn(
          'absolute -bottom-1 -left-1 rounded-full bg-background p-0.5 shadow-md',
          sizeConfig.mood
        )}>
          <MoodIcon mood={moodValue} className="w-full h-full" />
        </div>
      )}
    </motion.div>
  );

  if (onClick) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {avatarContent}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-semibold">{houseguest.name}</div>
              <div className="text-xs text-muted-foreground">
                {houseguest.age} • {houseguest.occupation}
              </div>
              {showMood && (
                <div className="text-xs mt-1 flex items-center justify-center gap-1">
                  Mood: <MoodIcon mood={moodValue} className="w-3 h-3" />
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return avatarContent;
};

export default EnhancedAvatar;
