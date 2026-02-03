
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Target, Shield, UserX, Check } from 'lucide-react';

export type AvatarStatus = 'hoh' | 'nominee' | 'pov' | 'safe' | 'evicted' | 'none';
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface StatusAvatarProps {
  name: string;
  status?: AvatarStatus;
  size?: AvatarSize;
  showBadge?: boolean;
  className?: string;
  imageUrl?: string;
  isPlayer?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28'
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
}> = {
  hoh: {
    ringClass: 'status-avatar-ring hoh',
    badgeClass: 'bg-bb-gold text-white',
    BadgeIcon: Crown,
    label: 'Head of Household'
  },
  nominee: {
    ringClass: 'status-avatar-ring nominee',
    badgeClass: 'bg-bb-red text-white',
    BadgeIcon: Target,
    label: 'Nominee'
  },
  pov: {
    ringClass: 'status-avatar-ring pov',
    badgeClass: 'bg-bb-gold text-white',
    BadgeIcon: Shield,
    label: 'PoV Holder'
  },
  safe: {
    ringClass: 'status-avatar-ring safe',
    badgeClass: 'bg-bb-green text-white',
    BadgeIcon: Check,
    label: 'Safe'
  },
  evicted: {
    ringClass: 'status-avatar-ring evicted',
    badgeClass: 'bg-muted text-muted-foreground',
    BadgeIcon: UserX,
    label: 'Evicted'
  },
  none: {
    ringClass: '',
    badgeClass: '',
    BadgeIcon: () => null,
    label: ''
  }
};

export const StatusAvatar: React.FC<StatusAvatarProps> = ({
  name,
  status = 'none',
  size = 'md',
  showBadge = true,
  className,
  imageUrl,
  isPlayer = false
}) => {
  const config = statusConfig[status];
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={cn('status-avatar relative inline-flex', className)}>
      {/* Status ring */}
      {status !== 'none' && (
        <div className={cn('absolute inset-0 rounded-full', config.ringClass)} />
      )}
      
      {/* Avatar */}
      <Avatar 
        className={cn(
          sizeClasses[size],
          'border-2 border-background shadow-game-md transition-transform duration-300',
          status === 'evicted' && 'grayscale opacity-60',
          isPlayer && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <AvatarFallback 
            className={cn(
              'camera-lens bg-muted text-foreground font-semibold',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-lg',
              size === 'xl' && 'text-2xl'
            )}
          >
            {initials}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Status badge */}
      {showBadge && status !== 'none' && (
        <div 
          className={cn(
            'absolute rounded-full flex items-center justify-center shadow-game-md',
            badgeSizeClasses[size],
            config.badgeClass
          )}
          title={config.label}
        >
          <config.BadgeIcon className="w-3/5 h-3/5" />
        </div>
      )}
    </div>
  );
};

export default StatusAvatar;
