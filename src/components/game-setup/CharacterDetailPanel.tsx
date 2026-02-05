
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CharacterTemplate, archetypeInfo } from '@/data/character-templates';
import { Button } from '@/components/ui/button';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { MapPin, Briefcase, User, Sparkles, Loader2 } from 'lucide-react';
import { AvatarLoader } from '@/components/avatar-3d/AvatarLoader';

interface CharacterDetailPanelProps {
  template: CharacterTemplate | null;
  onSelect: () => void;
  onCustomize: () => void;
}

export const CharacterDetailPanel: React.FC<CharacterDetailPanelProps> = ({
  template,
  onSelect,
  onCustomize
}) => {
  if (!template) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
        <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <User className="w-16 h-16 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">Select a Character</p>
        <p className="text-sm mt-2">Choose from the cast to see their details</p>
      </div>
    );
  }

  const archetype = archetypeInfo[template.archetype];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={template.id}
        className="h-full flex flex-col"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Large portrait - 3D or 2D based on avatar config */}
        <div className="relative flex-shrink-0">
          <div className="relative mx-auto w-48 h-48">
            {/* Ornate frame */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-1.5 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-amber-200/50">
                {template.avatar3DConfig?.modelUrl ? (
                  <React.Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  }>
                    <AvatarLoader
                      avatarUrl={template.avatar3DConfig.modelUrl}
                      avatarConfig={template.avatar3DConfig}
                      size="full"
                      animated={true}
                      characterName={template.name}
                    />
                  </React.Suspense>
                ) : (
                  <motion.img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            </div>

            {/* Animated glow */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{
                boxShadow: [
                  '0 0 30px rgba(251, 191, 36, 0.3)',
                  '0 0 60px rgba(251, 191, 36, 0.5)',
                  '0 0 30px rgba(251, 191, 36, 0.3)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Archetype badge floating */}
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={cn(
              'px-4 py-1.5 rounded-full font-bold text-sm',
              'bg-gradient-to-r shadow-lg',
              archetype.color,
              'text-white border border-white/20'
            )}>
              <Sparkles className="w-3 h-3 inline mr-1" />
              {template.tagline}
            </div>
          </motion.div>
        </div>

        {/* Character info */}
        <div className="mt-8 text-center space-y-4 flex-1">
          {/* Name */}
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {template.name}
          </motion.h2>

          {/* Details */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {template.age}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {template.occupation}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {template.hometown}
            </span>
          </motion.div>

          {/* Bio */}
          <motion.p
            className="text-sm text-muted-foreground italic px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            "{template.bio}"
          </motion.p>

          {/* Traits */}
          <motion.div
            className="flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {template.traits.map((trait, i) => (
              <AnimatedBadge
                key={trait}
                variant={i === 0 ? 'primary' : 'gold'}
                delay={0.4 + i * 0.1}
              >
                {trait}
              </AnimatedBadge>
            ))}
          </motion.div>

          {/* Archetype description */}
          <motion.div
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className={cn(
              'px-2 py-1 rounded bg-gradient-to-r',
              archetype.color,
              'bg-opacity-20 text-foreground'
            )}>
              {archetype.label}
            </span>
            <span className="ml-2">{archetype.description}</span>
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div
          className="mt-6 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onSelect}
            variant="glow"
            size="lg"
            className="w-full"
          >
            Play as {template.name.split(' ')[0]}
          </Button>
          <Button
            onClick={onCustomize}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Customize Character
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CharacterDetailPanel;
