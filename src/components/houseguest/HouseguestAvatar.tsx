
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Houseguest } from '@/models/houseguest';
import { cn } from '@/lib/utils';

interface HouseguestAvatarProps {
  houseguest: Houseguest;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl'
};

const HouseguestAvatar: React.FC<HouseguestAvatarProps> = ({ 
  houseguest, 
  size = 'md',
  rounded = true,
  className = ''
}) => {
  const initials = houseguest.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isActive = houseguest.status === 'Active';

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
