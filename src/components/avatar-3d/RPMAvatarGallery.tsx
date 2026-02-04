/**
 * @file avatar-3d/RPMAvatarGallery.tsx
 * @description Gallery component for displaying and selecting saved RPM avatars
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trash2, Check, User, Clock } from 'lucide-react';
import { SavedRPMAvatar } from '@/hooks/useRPMAvatarStorage';
import { formatDistanceToNow } from 'date-fns';

interface RPMAvatarGalleryProps {
  avatars: SavedRPMAvatar[];
  selectedUrl?: string;
  onSelect: (avatar: SavedRPMAvatar) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

/**
 * RPMAvatarGallery - Displays saved RPM avatars in a selectable grid
 */
export const RPMAvatarGallery: React.FC<RPMAvatarGalleryProps> = ({
  avatars,
  selectedUrl,
  onSelect,
  onDelete,
  className,
}) => {
  if (avatars.length === 0) {
    return (
      <div className={cn(
        "text-center py-8 text-muted-foreground",
        className
      )}>
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No saved avatars yet</p>
        <p className="text-xs opacity-70">Create an avatar above to save it here</p>
      </div>
    );
  }

  // Helper to extract avatar ID for comparison
  const extractAvatarId = (url: string) => {
    const match = url.match(/models\.readyplayer\.me\/([a-f0-9-]+)/);
    return match ? match[1] : url;
  };

  const isSelected = (avatar: SavedRPMAvatar) => {
    if (!selectedUrl) return false;
    return extractAvatarId(avatar.url) === extractAvatarId(selectedUrl);
  };

  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3", className)}>
      <AnimatePresence mode="popLayout">
        {avatars.map((avatar) => (
          <motion.div
            key={avatar.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative group"
          >
            <motion.button
              onClick={() => onSelect(avatar)}
              className={cn(
                "w-full aspect-square rounded-xl overflow-hidden border-2 transition-all",
                "bg-muted/50 flex items-center justify-center",
                isSelected(avatar)
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {avatar.thumbnail ? (
                <img 
                  src={avatar.thumbnail} 
                  alt={avatar.name || 'Saved avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <User className="w-8 h-8 text-primary/60" />
                </div>
              )}

              {/* Selected indicator */}
              {isSelected(avatar) && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </motion.button>

            {/* Delete button */}
            {onDelete && (
              <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(avatar.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive-foreground" />
              </motion.button>
            )}

            {/* Name/timestamp tooltip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl">
              <p className="text-[10px] text-white truncate">
                {avatar.name || 'Avatar'}
              </p>
              <p className="text-[9px] text-white/70 flex items-center gap-1">
                <Clock className="w-2 h-2" />
                {formatDistanceToNow(new Date(avatar.createdAt), { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RPMAvatarGallery;
