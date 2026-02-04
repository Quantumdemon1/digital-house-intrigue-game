import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Houseguest } from '@/models/houseguest';
import { cn } from '@/lib/utils';
import { SimsAvatar } from '@/components/avatar-3d';

interface HouseguestAvatarProps {
  houseguest: Houseguest;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  use3D?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl'
};

// Map our sizes to SimsAvatar sizes
const simsAvatarSizes: Record<'sm' | 'md' | 'lg', 'sm' | 'md' | 'lg' | 'xl'> = {
  sm: 'sm',
  md: 'lg',
  lg: 'xl'
};

const HouseguestAvatar: React.FC<HouseguestAvatarProps> = ({ 
  houseguest, 
  size = 'md',
  rounded = true,
  className = '',
  use3D = true
}) => {
  const initials = houseguest.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isActive = houseguest.status === 'Active';

  // Determine avatar status for 3D avatar
  const getAvatarStatus = () => {
    if (houseguest.isHoH) return 'hoh';
    if (houseguest.isPovHolder) return 'pov';
    if (houseguest.isNominated) return 'nominee';
    if (houseguest.status === 'Evicted') return 'evicted';
    return 'none';
  };

  // Use 3D avatar if config is available and use3D is true
  if (use3D && houseguest.avatarConfig) {
    return (
      <div 
        className={cn(
          sizeClasses[size],
          'relative overflow-hidden',
          rounded ? 'rounded-full' : 'rounded-lg',
          'shadow-game-md transition-all duration-300',
          !isActive && 'grayscale opacity-60',
          className
        )}
      >
        <SimsAvatar
          config={houseguest.avatarConfig}
          size={simsAvatarSizes[size]}
          status={getAvatarStatus()}
          mood={houseguest.mood || 'Neutral'}
          isPlayer={houseguest.isPlayer}
          animated={isActive}
        />
      </div>
    );
  }

  // Fallback to 2D avatar
  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        rounded ? 'rounded-full' : 'rounded-lg',
        'shadow-game-md transition-all duration-300',
        !isActive && 'grayscale opacity-60',
        className
      )}
    >
      <AvatarFallback 
        className={cn(
          'camera-lens bg-muted text-foreground font-semibold',
          rounded ? 'rounded-full' : 'rounded-lg'
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default HouseguestAvatar;
