import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CharacterTemplate, archetypeInfo } from '@/data/character-templates';

interface CharacterFrameProps {
  template: CharacterTemplate;
  isSelected: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  showName?: boolean;
  showArchetype?: boolean;
}

const sizeConfig = {
  sm: { frame: 'w-20 h-20', image: 'w-16 h-16', text: 'text-xs', ring: 'ring-2' },
  md: { frame: 'w-28 h-28', image: 'w-24 h-24', text: 'text-sm', ring: 'ring-3' },
  lg: { frame: 'w-36 h-36', image: 'w-32 h-32', text: 'text-base', ring: 'ring-4' }
};

export const CharacterFrame: React.FC<CharacterFrameProps> = ({
  template,
  isSelected,
  size = 'md',
  onClick,
  showName = true,
  showArchetype = true
}) => {
  const config = sizeConfig[size];
  const archetype = archetypeInfo[template.archetype];
  
  // Use the profile photo URL or fall back to imageUrl for grid thumbnails
  const profileImage = template.avatar3DConfig?.profilePhotoUrl || template.imageUrl;

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Ornate frame container */}
      <div className="relative">
        {/* Outer decorative ring - gold gradient */}
        <div className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
          'p-1 shadow-lg',
          isSelected && 'animate-glow-pulse-ring'
        )}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/50 via-transparent to-amber-600/30" />
        </div>

        {/* Frame with image */}
        <motion.div
          className={cn(
            config.frame,
            'relative rounded-full overflow-hidden',
            'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
            'p-1 shadow-xl',
            'transition-all duration-300'
          )}
          animate={isSelected ? {
            boxShadow: [
              '0 0 20px rgba(251, 191, 36, 0.5)',
              '0 0 40px rgba(251, 191, 36, 0.8)',
              '0 0 20px rgba(251, 191, 36, 0.5)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Inner frame */}
          <div className={cn(
            'w-full h-full rounded-full overflow-hidden',
            'ring-2 ring-amber-200/50 ring-offset-1 ring-offset-amber-600/20'
          )}>
            {/* Character headshot image */}
            <img
              src={profileImage}
              alt={template.name}
              className={cn(
                'w-full h-full object-cover',
                'transition-all duration-300',
                'group-hover:scale-110',
                isSelected && 'ring-2 ring-bb-green'
              )}
            />

            {/* Hover overlay */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            )} />
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={cn(
                'absolute inset-0 rounded-full',
                config.ring,
                'ring-bb-green ring-offset-2 ring-offset-background'
              )} />
            </motion.div>
          )}
        </motion.div>

        {/* Selection checkmark */}
        {isSelected && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-bb-green flex items-center justify-center shadow-lg border-2 border-background"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Name plate */}
      {showName && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={cn(
            'px-3 py-1 rounded-full',
            'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800',
            'border border-amber-500/30',
            'shadow-md'
          )}>
            <span className={cn(
              config.text,
              'font-bold text-white',
              'drop-shadow-sm'
            )}>
              {template.name}
            </span>
          </div>
        </motion.div>
      )}

      {/* Archetype badge */}
      {showArchetype && (
        <motion.div
          className={cn(
            'mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
            'bg-gradient-to-r',
            archetype.color,
            'text-white shadow-sm'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {template.tagline}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CharacterFrame;
