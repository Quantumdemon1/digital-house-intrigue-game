
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Houseguest } from '@/models/houseguest';

interface HouseguestAvatarProps {
  houseguest: Houseguest;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string; // Add className to the props interface
}

const HouseguestAvatar: React.FC<HouseguestAvatarProps> = ({ 
  houseguest, 
  size = 'md',
  rounded = true,
  className = '' // Default to empty string
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${rounded ? 'rounded-full' : 'rounded-md'} shadow-md ${className}`}>
      <AvatarFallback className={`camera-lens ${rounded ? '' : 'rounded-md'} bg-gray-200`}>
        {houseguest.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default HouseguestAvatar;
