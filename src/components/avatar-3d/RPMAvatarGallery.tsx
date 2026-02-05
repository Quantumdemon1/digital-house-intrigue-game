/**
 * @file avatar-3d/RPMAvatarGallery.tsx
 * @description Gallery component for displaying and selecting saved RPM avatars
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trash2, Check, User } from 'lucide-react';
import { SavedRPMAvatar } from '@/hooks/useRPMAvatarStorage';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3", className)}>
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
              onClick={(e) => {
                e.stopPropagation();
                onSelect(avatar);
              }}
              className={cn(
                "w-full aspect-square rounded-xl overflow-hidden border-2 transition-all",
                "bg-muted/50 flex items-center justify-center",
                "min-h-[80px] min-w-[80px]",
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
              <button
                className={cn(
                  "absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center shadow-lg z-10",
                  isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(avatar.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive-foreground" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RPMAvatarGallery;
