
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Shield, Target, Users, FileText } from "lucide-react";
import HouseguestListComponent from '../HouseguestList';
import GameLog from "../GameEventLog";
import PromiseManager from '../promise/PromiseManager';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { staggerContainer, cardVariants } from '@/lib/motion-variants';

const GameSidebar: React.FC = () => {
  const { gameState } = useGame();
  
  const hohHouseguest = gameState.hohWinner 
    ? gameState.houseguests.find(h => h.id === gameState.hohWinner.id) || gameState.hohWinner
    : null;
  const povHouseguest = gameState.povWinner 
    ? gameState.houseguests.find(h => h.id === gameState.povWinner.id) || gameState.povWinner
    : null;
  const nominees = gameState.nominees
    .map(nominee => gameState.houseguests.find(h => h.id === nominee.id) || nominee)
    .filter(Boolean);
  
  return (
    <motion.div 
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Game Status Section */}
      <motion.div variants={cardVariants}>
        <Card className="game-card overflow-hidden backdrop-blur-sm bg-card/95">
          <CardHeader className="pb-3 bg-gradient-to-r from-bb-blue/10 via-transparent to-bb-gold/10 border-b border-border/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <motion.div 
                className="p-1.5 rounded-lg bg-bb-blue/10"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Crown className="h-4 w-4 text-bb-blue" />
              </motion.div>
              Current Power
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <AnimatePresence mode="wait">
              {/* HoH Display */}
              {hohHouseguest && (
                <motion.div 
                  key={`hoh-${hohHouseguest.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-bb-gold/10 to-transparent border border-bb-gold/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <StatusAvatar 
                    name={hohHouseguest.name} 
                    status="hoh" 
                    size="sm" 
                    isPlayer={hohHouseguest.isPlayer}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">Head of Household</div>
                    <div className="font-semibold truncate">{hohHouseguest.name}</div>
                  </div>
                </motion.div>
              )}
              
              {/* PoV Holder */}
              {povHouseguest && (
                <motion.div 
                  key={`pov-${povHouseguest.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-bb-gold/10 to-transparent border border-bb-gold/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <StatusAvatar 
                    name={povHouseguest.name} 
                    status="pov" 
                    size="sm"
                    isPlayer={povHouseguest.isPlayer}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">Power of Veto</div>
                    <div className="font-semibold truncate">{povHouseguest.name}</div>
                  </div>
                </motion.div>
              )}
              
              {/* Nominees */}
              {nominees.length > 0 && (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Target className="h-3 w-3 text-bb-red" />
                    Nominees
                  </div>
                  <div className="flex gap-2">
                    {nominees.map((nominee: any, index: number) => (
                      <motion.div 
                        key={nominee.id} 
                        className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-bb-red/10 to-transparent border border-bb-red/20 flex-1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <StatusAvatar 
                          name={nominee.name} 
                          status="nominee" 
                          size="sm"
                          showBadge={false}
                          isPlayer={nominee.isPlayer}
                        />
                        <span className="text-sm font-medium truncate">{nominee.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {!hohHouseguest && !povHouseguest && nominees.length === 0 && (
                <motion.div 
                  className="text-center py-6 text-muted-foreground text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No active powers this week
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Promise Manager */}
      <motion.div variants={cardVariants}>
        <PromiseManager />
      </motion.div>
      
      {/* Tabs for Houseguests and Game Log */}
      <motion.div variants={cardVariants}>
        <Tabs defaultValue="houseguests" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger 
              value="houseguests" 
              className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Houseguests</span>
            </TabsTrigger>
            <TabsTrigger 
              value="log" 
              className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="houseguests" className="mt-2">
            <Card className="game-card overflow-hidden backdrop-blur-sm bg-card/95">
              <ScrollArea className="h-[400px]">
                <CardContent className="p-3 overflow-hidden">
                  <HouseguestListComponent compact />
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>
          <TabsContent value="log" className="mt-2">
            <Card className="game-card backdrop-blur-sm bg-card/95">
              <ScrollArea className="h-[400px]">
                <CardContent className="p-3">
                  <GameLog />
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default GameSidebar;
