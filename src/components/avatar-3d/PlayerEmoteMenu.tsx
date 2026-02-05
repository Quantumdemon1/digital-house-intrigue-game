/**
 * @file PlayerEmoteMenu.tsx
 * @description Enhanced emote selection menu with state feedback and better UX
 */

import React from 'react';
import { Hand, Sparkles, ThumbsUp, Meh, PartyPopper, ArrowRight, Move, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GestureType } from './animation';
import { cn } from '@/lib/utils';

interface PlayerEmoteMenuProps {
  isVisible: boolean;
  isPlaying?: boolean;
  currentGesture?: GestureType | null;
  onEmote: (gesture: GestureType) => void;
  onMove: () => void;
  onClose?: () => void;
  className?: string;
}

const PLAYER_EMOTES: Array<{ id: GestureType; icon: React.ElementType; label: string }> = [
  { id: 'wave', icon: Hand, label: 'Wave' },
  { id: 'clap', icon: Sparkles, label: 'Clap' },
  { id: 'thumbsUp', icon: ThumbsUp, label: 'Like' },
  { id: 'shrug', icon: Meh, label: 'Shrug' },
  { id: 'celebrate', icon: PartyPopper, label: 'Celebrate' },
  { id: 'point', icon: ArrowRight, label: 'Point' },
];

export const PlayerEmoteMenu: React.FC<PlayerEmoteMenuProps> = ({
  isVisible,
  isPlaying = false,
  currentGesture = null,
  onEmote,
  onMove,
  onClose,
  className = '',
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn('absolute bottom-4 left-1/2 -translate-x-1/2 z-20', className)}>
      <div className="bg-background/95 backdrop-blur-md rounded-2xl border border-primary/30 p-3 shadow-xl relative">
        {/* Header with title and close button */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Your Actions
          </span>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Emote grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PLAYER_EMOTES.map((emote) => {
            const isActive = currentGesture === emote.id;
            const isDisabled = isPlaying && !isActive;
            
            return (
              <Button
                key={emote.id}
                variant="ghost"
                size="sm"
                disabled={isDisabled}
                onClick={() => !isPlaying && onEmote(emote.id)}
                className={cn(
                  'flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200',
                  isActive && 'bg-primary/20 ring-2 ring-primary text-primary',
                  !isActive && !isDisabled && 'hover:bg-primary/10 text-foreground hover:text-primary',
                  isDisabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                <emote.icon className={cn('w-5 h-5', isActive && 'animate-pulse')} />
                <span className="text-xs font-medium">{emote.label}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Move button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onMove}
          disabled={isPlaying}
          className={cn(
            'w-full flex items-center justify-center gap-2 transition-all duration-200',
            'bg-accent/20 border-accent/50 hover:bg-accent/30 text-accent-foreground hover:text-accent-foreground',
            isPlaying && 'opacity-40 cursor-not-allowed'
          )}
        >
          <Move className="w-4 h-4" />
          <span className="font-medium">Move</span>
        </Button>
        
        {/* Playing indicator */}
        {isPlaying && (
          <div className="text-center text-xs text-primary mt-2 animate-pulse">
            Performing gesture...
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerEmoteMenu;