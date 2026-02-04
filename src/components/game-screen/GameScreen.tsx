
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import PhaseContent from './PhaseContent';
import GameSidebar from './GameSidebar';
import GameHeader from './GameHeader';
import GameStatusIndicator from './GameStatusIndicator';
import SpectatorBanner from './SpectatorBanner';
import { SocialNetworkDialog } from '@/components/social-network';

const GameScreen: React.FC = () => {
  const { gameState } = useGame();
  const [showSocialNetwork, setShowSocialNetwork] = useState(false);
  
  // Only show social network when there's an active player in the game
  const player = gameState.houseguests.find(h => h.isPlayer);
  const canShowSocial = player && gameState.phase !== 'Setup' && gameState.phase !== 'GameOver';
  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Surveillance pattern */}
        <div className="absolute inset-0 bg-surveillance-pattern opacity-[0.02]" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-bb-blue/[0.02] via-transparent to-bb-gold/[0.02]" />
        
        {/* Corner glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-bb-blue/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-bb-gold/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>
      
      <motion.div 
        className="relative container mx-auto px-4 py-4 md:py-6 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Spectator Mode Banner */}
        <SpectatorBanner />
        
        {/* Header */}
        <GameHeader 
          onShowSocialNetwork={canShowSocial ? () => setShowSocialNetwork(true) : undefined}
        />
        
        {/* Status Indicator */}
        <GameStatusIndicator />
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Game Area */}
          <motion.div 
            className="lg:flex-1 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="game-card overflow-hidden backdrop-blur-sm bg-card/95">
              <PhaseContent phase={gameState.phase} />
            </div>
          </motion.div>
          
          {/* Sidebar */}
          <motion.div 
            className="lg:w-80 xl:w-96 shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="lg:sticky lg:top-4">
              <GameSidebar />
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Social Network Dialog */}
      <SocialNetworkDialog
        open={showSocialNetwork}
        onOpenChange={setShowSocialNetwork}
      />
    </div>
  );
};

export default GameScreen;
