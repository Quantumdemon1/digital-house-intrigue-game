/**
 * @file CharacterCarousel.tsx
 * @description Bottom carousel UI for character selection in the House Scene
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CharacterTemplate, archetypeInfo } from '@/data/character-templates';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CharacterCarouselProps {
  characters: CharacterTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onViewInHouse?: () => void;
}

export const CharacterCarousel: React.FC<CharacterCarouselProps> = ({
  characters,
  selectedId,
  onSelect,
  onViewInHouse
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Scroll to selected character
  useEffect(() => {
    if (selectedId && scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector(`[data-id="${selectedId}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      }
    }
  }, [selectedId]);
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = characters.findIndex(c => c.id === selectedId);
    
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      onSelect(characters[currentIndex - 1].id);
    } else if (e.key === 'ArrowRight' && currentIndex < characters.length - 1) {
      onSelect(characters[currentIndex + 1].id);
    }
  };
  
  return (
    <div 
      className="w-full bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Navigation hint */}
      <div className="flex justify-center gap-8 py-2 text-xs text-white/50 border-b border-white/10">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">→</kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">Enter</kbd>
          Select
        </span>
      </div>
      
      {/* Carousel container */}
      <div className="relative py-4 px-4">
        {/* Left scroll button */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-amber-500/20 border border-white/20 hover:border-amber-500/50 transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        
        {/* Scrollable character strip */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-10 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {characters.map((char) => {
            const isSelected = selectedId === char.id;
            const archetype = archetypeInfo[char.archetype];
            
            return (
              <motion.div
                key={char.id}
                data-id={char.id}
                className={cn(
                  'flex-shrink-0 cursor-pointer transition-all duration-200',
                  'flex flex-col items-center'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(char.id)}
              >
                {/* Portrait frame */}
                <div className={cn(
                  'relative w-16 h-16 rounded-full overflow-hidden',
                  'ring-2 transition-all duration-200',
                  isSelected 
                    ? 'ring-amber-400 ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(251,191,36,0.5)]' 
                    : 'ring-white/30 hover:ring-amber-400/50'
                )}>
                  {/* Gradient border for selected */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                  
                  {/* Character image */}
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className={cn(
                      'w-full h-full object-cover',
                      isSelected && 'scale-105'
                    )}
                  />
                  
                  {/* Selection overlay */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Name */}
                <div className={cn(
                  'mt-1.5 text-center max-w-20',
                  'transition-colors duration-200'
                )}>
                  <p className={cn(
                    'text-xs font-medium truncate',
                    isSelected ? 'text-amber-400' : 'text-white/80'
                  )}>
                    {char.name.split(' ')[0]}
                  </p>
                </div>
                
                {/* Archetype dot */}
                <div className={cn(
                  'w-2 h-2 rounded-full mt-0.5',
                  'bg-gradient-to-r',
                  archetype.color
                )} />
              </motion.div>
            );
          })}
        </div>
        
        {/* Right scroll button */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-amber-500/20 border border-white/20 hover:border-amber-500/50 transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Selected character info */}
      <AnimatePresence mode="wait">
        {selectedId && (
          <motion.div
            key={selectedId}
            className="px-6 pb-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const char = characters.find(c => c.id === selectedId);
              if (!char) return null;
              
              const archetype = archetypeInfo[char.archetype];
              
              return (
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{char.name}</h3>
                    <p className="text-sm text-white/60">{char.occupation} • {char.hometown}</p>
                  </div>
                  <div className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    'bg-gradient-to-r text-white',
                    archetype.color
                  )}>
                    {char.tagline}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterCarousel;
