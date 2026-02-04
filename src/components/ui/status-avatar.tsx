import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Target, Shield, UserX, Check } from 'lucide-react';
import { Avatar3DConfig } from '@/models/avatar-config';
import { MoodType } from '@/models/houseguest/types';
import { AvatarLoader } from '@/components/avatar-3d';

export type AvatarStatus = 'hoh' | 'nominee' | 'pov' | 'safe' | 'evicted' | 'none';
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface StatusAvatarProps {
  name: string;
  status?: AvatarStatus;
  size?: AvatarSize;
  showBadge?: boolean;
  className?: string;
  imageUrl?: string;
  avatarUrl?: string;
  isPlayer?: boolean;
  animated?: boolean;
  // 3D avatar props
  use3D?: boolean;
  avatarConfig?: Avatar3DConfig;
  mood?: MoodType;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28'
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl'
};

const badgeSizeClasses: Record<AvatarSize, string> = {
  sm: 'w-5 h-5 -top-0.5 -right-0.5',
  md: 'w-6 h-6 -top-1 -right-1',
  lg: 'w-8 h-8 -top-1 -right-1',
  xl: 'w-10 h-10 -top-2 -right-2'
};

const statusConfig: Record<AvatarStatus, {
  ringClass: string;
  badgeClass: string;
  BadgeIcon: React.ElementType;
  label: string;
  glowColor: string;
}> = {
  hoh: {
    ringClass: 'ring-bb-gold',
    badgeClass: 'bg-gradient-to-br from-bb-gold to-amber-600 text-white',
    BadgeIcon: Crown,
    label: 'Head of Household',
    glowColor: 'hsl(var(--bb-gold) / 0.5)'
  },
  nominee: {
    ringClass: 'ring-bb-red',
    badgeClass: 'bg-gradient-to-br from-bb-red to-red-700 text-white',
    BadgeIcon: Target,
    label: 'Nominee',
    glowColor: 'hsl(var(--bb-red) / 0.5)'
  },
  pov: {
    ringClass: 'ring-bb-gold',
    badgeClass: 'bg-gradient-to-br from-bb-gold to-amber-600 text-white',
    BadgeIcon: Shield,
    label: 'PoV Holder',
    glowColor: 'hsl(var(--bb-gold) / 0.5)'
  },
  safe: {
    ringClass: 'ring-bb-green',
    badgeClass: 'bg-gradient-to-br from-bb-green to-emerald-600 text-white',
    BadgeIcon: Check,
    label: 'Safe',
    glowColor: 'hsl(var(--bb-green) / 0.5)'
  },
  evicted: {
    ringClass: 'ring-muted',
    badgeClass: 'bg-muted text-muted-foreground',
    BadgeIcon: UserX,
    label: 'Evicted',
    glowColor: 'transparent'
  },
  none: {
    ringClass: '',
    badgeClass: '',
    BadgeIcon: () => null,
    label: '',
    glowColor: 'transparent'
  }
};

// Map our sizes to 3D avatar sizes
const size3DMap: Record<AvatarSize, 'sm' | 'md' | 'lg' | 'xl'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
};

/**
 * 3D Avatar wrapper with status badge overlay
 */
const Avatar3DWrapper: React.FC<{
  config: Avatar3DConfig;
  size: AvatarSize;
  status: AvatarStatus;
  mood: MoodType;
  isPlayer: boolean;
  animated: boolean;
  name: string;
}> = ({ config, size, status, mood, isPlayer, animated, name }) => {
  return (
    <AvatarLoader
      avatarConfig={config}
      size={size3DMap[size]}
      status={status}
      mood={mood}
      isPlayer={isPlayer}
      animated={animated}
    />
  );
};

export const StatusAvatar: React.FC<StatusAvatarProps> = ({
  name,
  status = 'none',
  size = 'md',
  showBadge = true,
  className,
  imageUrl,
  avatarUrl,
  isPlayer = false,
  animated = true,
  use3D = false,
  avatarConfig,
  mood = 'Neutral'
}) => {
  const config = statusConfig[status];
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const actualImageUrl = imageUrl || avatarUrl;
  const hasActiveStatus = status !== 'none' && status !== 'evicted';

  // Render 3D avatar if enabled and config available
  const render3D = use3D && avatarConfig;

  return (
    <div className={cn('status-avatar relative inline-flex', className)}>
      {/* Animated glow ring for active statuses */}
      {hasActiveStatus && animated && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full',
            config.ringClass,
            'ring-[3px] ring-offset-2 ring-offset-background'
          )}
          animate={{
            boxShadow: [
              `0 0 10px ${config.glowColor}`,
              `0 0 25px ${config.glowColor}`,
              `0 0 10px ${config.glowColor}`,
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Static ring for non-animated */}
      {hasActiveStatus && !animated && (
        <div className={cn(
          'absolute inset-0 rounded-full',
          config.ringClass,
          'ring-[3px] ring-offset-2 ring-offset-background'
        )} />
      )}
      
      {/* Avatar - 3D or 2D */}
      {render3D ? (
        <Avatar3DWrapper
          config={avatarConfig}
          size={size}
          status={status}
          mood={mood}
          isPlayer={isPlayer}
          animated={animated}
          name={name}
        />
      ) : (
        <Avatar 
          className={cn(
            sizeClasses[size],
            'border-2 border-background shadow-game-md transition-all duration-300',
            status === 'evicted' && 'grayscale opacity-60',
            isPlayer && 'ring-2 ring-bb-green ring-offset-2 ring-offset-background'
          )}
        >
          {actualImageUrl ? (
            <img src={actualImageUrl} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <AvatarFallback 
              className={cn(
                'bg-gradient-to-br from-muted via-muted to-muted-foreground/10 text-foreground font-semibold',
                textSizeClasses[size]
              )}
            >
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      )}

      {/* Animated status badge */}
      {showBadge && status !== 'none' && (
        <motion.div 
          className={cn(
            'absolute rounded-full flex items-center justify-center shadow-lg',
            badgeSizeClasses[size],
            config.badgeClass
          )}
          title={config.label}
          initial={animated ? { scale: 0 } : undefined}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <config.BadgeIcon className="w-3/5 h-3/5" />
        </motion.div>
      )}

      {/* Player indicator */}
      {isPlayer && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-bb-green text-white text-[8px] font-bold shadow-md"
          initial={animated ? { y: 5, opacity: 0 } : undefined}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          YOU
        </motion.div>
      )}
    </div>
  );
};

export default StatusAvatar;
