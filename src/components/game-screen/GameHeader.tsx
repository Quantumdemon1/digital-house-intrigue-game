
import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';
import ProfileButton from '../auth/ProfileButton';
import { SettingsDialog } from '@/components/settings';
import { PhaseIndicator, WeekIndicator } from '@/components/ui/phase-indicator';

const GameHeader: React.FC = () => {
  const { gameState } = useGame();
  
  return (
    <motion.header 
      className="relative overflow-hidden rounded-xl border bg-card/95 backdrop-blur-sm shadow-game-md max-w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-surveillance-pattern opacity-5" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-bb-blue/5 via-transparent to-bb-gold/5" />
      
      <div className="relative p-2 sm:p-3 md:p-4">
        {/* Top row: Title, Week, Settings, Profile */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left side: Title and Week */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <motion.h1 
              className="game-title text-sm sm:text-base md:text-lg lg:text-xl truncate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Digital House Intrigue
            </motion.h1>
            <Separator orientation="vertical" className="h-6 sm:h-8 hidden md:block" />
            <WeekIndicator week={gameState.week} className="hidden md:flex" />
          </div>
          
          {/* Right side: Settings and Profile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <SettingsDialog />
            <ProfileButton />
          </div>
        </div>
        
        {/* Phase Indicator - Full width below title */}
        <motion.div 
          className="mt-2 sm:mt-3 md:mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PhaseIndicator 
            currentPhase={gameState.phase} 
            week={gameState.week} 
          />
        </motion.div>
        
        {/* Mobile: Week indicator below phase on small screens */}
        <div className="md:hidden mt-2 sm:mt-3 flex justify-center">
          <WeekIndicator week={gameState.week} />
        </div>
      </div>
    </motion.header>
  );
};

export default GameHeader;
