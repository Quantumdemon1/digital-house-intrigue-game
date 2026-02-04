/**
 * @file avatar-3d/AvatarProfilePicture.tsx
 * @description Displays captured 2D profile photo with 3D fallback
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { Avatar3DConfig } from '@/models/avatar-config';

interface AvatarProfilePictureProps {
  config?: Avatar3DConfig;
  profilePhotoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
}

const SIZE_CLASSES = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};

/**
 * Displays the captured profile photo or a fallback
 */
export const AvatarProfilePicture: React.FC<AvatarProfilePictureProps> = ({
  config,
  profilePhotoUrl,
  size = 'md',
  className,
  showBorder = true,
  borderColor
}) => {
  const photoUrl = profilePhotoUrl || config?.profilePhotoUrl;
  const sizeClass = SIZE_CLASSES[size];
  
  return (
    <div 
      className={cn(
        'rounded-full overflow-hidden bg-muted flex items-center justify-center',
        sizeClass,
        showBorder && 'ring-2 ring-offset-2 ring-offset-background',
        showBorder && (borderColor || 'ring-border'),
        className
      )}
    >
      {photoUrl ? (
        <img 
          src={photoUrl} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <User className={cn(
            'text-muted-foreground',
            size === 'xs' ? 'w-4 h-4' :
            size === 'sm' ? 'w-5 h-5' :
            size === 'md' ? 'w-8 h-8' :
            size === 'lg' ? 'w-12 h-12' :
            'w-16 h-16'
          )} />
        </div>
      )}
    </div>
  );
};

export default AvatarProfilePicture;
