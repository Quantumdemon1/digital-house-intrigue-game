import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PlayerFormData } from './types';
import { PersonalityTrait } from '@/models/houseguest';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { Briefcase, MapPin, User, Wand2, ArrowLeft } from 'lucide-react';
import AvatarImageOptions from './AvatarImageOptions';
import { AvatarLoader } from '@/components/avatar-3d';
import { AvatarCustomizer } from '@/components/avatar-3d/AvatarCustomizer';
import { generateDefaultConfig, Avatar3DConfig } from '@/models/avatar-config';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AvatarPreviewProps {
  formData: PlayerFormData;
  avatarUrl?: string;
  className?: string;
  onAvatarChange?: (url: string) => void;
  onAvatarConfigChange?: (config: Avatar3DConfig) => void;
  showImageOptions?: boolean;
  use3D?: boolean;
}

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

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ 
  formData, 
  avatarUrl, 
  className,
  onAvatarChange,
  onAvatarConfigChange,
  showImageOptions = false,
  use3D = true
}) => {
  const { playerName, selectedTraits, playerOccupation, playerHometown, stats, avatarConfig } = formData;
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState<Avatar3DConfig>(
    avatarConfig || generateDefaultConfig()
  );
  
  // Get gradient based on first selected trait
  const primaryTrait = selectedTraits[0] as PersonalityTrait;
  const gradient = primaryTrait 
    ? traitGradients[primaryTrait] 
    : 'from-slate-400 via-slate-500 to-slate-600';
  
  // Calculate initials
  const initials = playerName
    ? playerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  // Calculate total stats for display
  const statKeys = ['physical', 'mental', 'endurance', 'social', 'strategic', 'luck'] as const;
  const statTotal = statKeys.reduce((sum, key) => sum + (stats[key] as number || 5), 0);
  const maxStats = statKeys.length * 10;

  const hasAvatar = avatarUrl && avatarUrl !== '/placeholder.svg';
  const has3DConfig = avatarConfig || use3D;

  const handleCustomizerChange = (config: Avatar3DConfig) => {
    setLocalConfig(config);
    onAvatarConfigChange?.(config);
  };

  const handleCustomizerComplete = () => {
    onAvatarConfigChange?.(localConfig);
    setCustomizerOpen(false);
  };

  return (
    <motion.div 
      className={cn('flex flex-col items-center', className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Avatar */}
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 20px hsl(var(--bb-blue) / 0.3)',
              '0 0 40px hsl(var(--bb-blue) / 0.5)',
              '0 0 20px hsl(var(--bb-blue) / 0.3)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Player badge ring */}
        <div className="absolute inset-0 rounded-full ring-4 ring-bb-green ring-offset-4 ring-offset-background" />
        
        {/* Main avatar circle */}
        <motion.div 
          className={cn(
            'w-32 h-32 rounded-full relative overflow-hidden',
            'shadow-xl'
          )}
          key={avatarConfig?.profilePhotoUrl || (hasAvatar ? avatarUrl : gradient)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Priority: 1. Captured profile photo, 2. 3D avatar, 3. Image URL, 4. Initials */}
          {avatarConfig?.profilePhotoUrl ? (
            <>
              {/* Show captured 2D profile photo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={avatarConfig.profilePhotoUrl}
                    alt={playerName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Subtle lens overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none rounded-full" />
            </>
          ) : has3DConfig ? (
            <AvatarLoader 
              avatarConfig={avatarConfig || localConfig}
              size="xl"
              isPlayer={true}
              animated={true}
            />
          ) : hasAvatar ? (
            <>
              {/* Ornate frame */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-1">
                <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-amber-200/50">
                  <img
                    src={avatarUrl}
                    alt={playerName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Lens overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
            </>
          ) : (
            <>
              {/* Gradient background */}
              <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
              
              {/* Lens overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
              
              {/* Scan line effect */}
              <motion.div
                className="absolute inset-x-0 h-1/4 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"
                animate={{ y: ['-100%', '400%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Initials */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span 
                  className="text-4xl font-bold text-white drop-shadow-lg"
                  key={initials}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {initials}
                </motion.span>
              </div>
            </>
          )}
        </motion.div>

        {/* "YOU" badge */}
        <motion.div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-bb-green text-white text-xs font-bold shadow-lg"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          YOU
        </motion.div>
      </div>

      {/* Customize Avatar Button */}
      {use3D && (
        <Dialog open={customizerOpen} onOpenChange={setCustomizerOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Customize Avatar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Add touch-action style for mobile scrolling */}
            <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Create Your Avatar
              </DialogTitle>
            </DialogHeader>
            <div className="touch-pan-y overscroll-contain">
              <AvatarCustomizer
                initialConfig={avatarConfig || localConfig}
                onChange={handleCustomizerChange}
                onComplete={handleCustomizerComplete}
                showCompleteButton={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Player info */}
      <div className="mt-6 text-center space-y-2">
        <motion.h3 
          className="text-xl font-bold"
          key={playerName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {playerName || 'Your Name'}
        </motion.h3>
        
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          {playerOccupation && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {playerOccupation}
            </span>
          )}
          {playerHometown && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {playerHometown}
            </span>
          )}
        </div>
      </div>

      {/* Selected traits */}
      <div className="mt-4 flex gap-2">
        {selectedTraits.map((trait, i) => (
          <AnimatedBadge 
            key={trait} 
            variant={i === 0 ? 'primary' : 'gold'}
            delay={0.1 * i}
            pulse
          >
            {trait}
          </AnimatedBadge>
        ))}
        {selectedTraits.length === 0 && (
          <span className="text-sm text-muted-foreground italic">Select 2 traits</span>
        )}
      </div>

      {/* Stats summary */}
      <motion.div 
        className="mt-4 flex items-center gap-2 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-bb-blue to-bb-green"
            initial={{ width: 0 }}
            animate={{ width: `${(statTotal / maxStats) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-muted-foreground">
          Power: {statTotal}/{maxStats}
        </span>
      </motion.div>

      {/* Image Options - fallback when not using 3D */}
      {showImageOptions && onAvatarChange && !use3D && (
        <AvatarImageOptions
          onImageGenerated={onAvatarChange}
          onImageUploaded={onAvatarChange}
          currentAvatarUrl={avatarUrl}
          playerName={playerName}
          className="w-full max-w-xs"
        />
      )}
    </motion.div>
  );
};

export default AvatarPreview;
