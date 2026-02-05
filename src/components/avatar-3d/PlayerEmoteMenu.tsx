/**
 * @file PlayerEmoteMenu.tsx
 * @description Emote selection menu that appears when the player selects their own avatar
 */

import React from 'react';
import { Hand, Sparkles, ThumbsUp, HelpCircle, PartyPopper, ArrowRight, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GestureType } from './animation';

interface PlayerEmoteMenuProps {
  isVisible: boolean;
  onEmote: (gesture: GestureType) => void;
  onMove: () => void;
  className?: string;
}

const PLAYER_EMOTES: Array<{ id: GestureType; icon: React.ElementType; label: string }> = [
  { id: 'wave', icon: Hand, label: 'Wave' },
  { id: 'clap', icon: Sparkles, label: 'Clap' },
  { id: 'thumbsUp', icon: ThumbsUp, label: 'Like' },
  { id: 'shrug', icon: HelpCircle, label: 'Shrug' },
  { id: 'celebrate', icon: PartyPopper, label: 'Celebrate' },
  { id: 'point', icon: ArrowRight, label: 'Point' },
];

export const PlayerEmoteMenu: React.FC<PlayerEmoteMenuProps> = ({
  isVisible,
  onEmote,
  onMove,
  className = '',
}) => {
  if (!isVisible) return null;

  return (
    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 ${className}`}>
      <div className="bg-background/90 backdrop-blur-md rounded-2xl border border-primary/30 p-3 shadow-xl">
        {/* Emote grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PLAYER_EMOTES.map((emote) => (
            <Button
              key={emote.id}
              variant="ghost"
              size="sm"
              onClick={() => onEmote(emote.id)}
              className="flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-primary/20 text-foreground hover:text-primary transition-colors"
            >
              <emote.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{emote.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Move button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onMove}
          className="w-full flex items-center justify-center gap-2 bg-accent/20 border-accent/50 hover:bg-accent/30 text-accent-foreground hover:text-accent-foreground"
        >
          <Move className="w-4 h-4" />
          <span className="font-medium">Move</span>
        </Button>
        
        {/* Menu title */}
        <div className="text-center text-xs text-muted-foreground mt-2">
          Your Avatar Actions
        </div>
      </div>
    </div>
  );
};

export default PlayerEmoteMenu;
