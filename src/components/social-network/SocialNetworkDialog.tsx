/**
 * @file src/components/social-network/SocialNetworkDialog.tsx
 * @description Full dialog wrapper for the social network visualization
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGame } from '@/contexts/GameContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Houseguest } from '@/models/houseguest';
import { 
  PlayerPerception, 
  PlayerPerceptions, 
  CustomAlliance,
  createInitialPlayerPerceptions 
} from '@/models/player-perception';
import { RelationshipMap } from '@/systems/relationship/types';
import SocialNetworkGraph from './SocialNetworkGraph';
import PerceptionEditorDialog from './PerceptionEditorDialog';
import CustomAllianceDialog from './CustomAllianceDialog';
import NetworkLegend from './NetworkLegend';
import { Plus, Users, Eye, Network, HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialNetworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewMode = 'all' | 'alliances' | 'connections';

const SocialNetworkDialog: React.FC<SocialNetworkDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { gameState, dispatch, getRelationship } = useGame();
  const isMobile = useIsMobile();
  // State for view mode
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  
  // State for dialogs
  const [perceptionDialogOpen, setPerceptionDialogOpen] = useState(false);
  const [allianceDialogOpen, setAllianceDialogOpen] = useState(false);
  const [selectedHouseguest, setSelectedHouseguest] = useState<Houseguest | null>(null);
  const [editingAlliance, setEditingAlliance] = useState<CustomAlliance | undefined>(undefined);
  
  // Get player perceptions from game state or create default
  const playerPerceptions: PlayerPerceptions = useMemo(() => 
    gameState.playerPerceptions || createInitialPlayerPerceptions(),
    [gameState.playerPerceptions]
  );
  
  // Find the player
  const player = useMemo(() => 
    gameState.houseguests.find(h => h.isPlayer),
    [gameState.houseguests]
  );
  
  // Get active houseguests
  const activeHouseguests = useMemo(() => 
    gameState.houseguests.filter(h => h.status === 'Active' || h.status === 'Jury'),
    [gameState.houseguests]
  );
  
  // Handle editing perception
  const handleEditPerception = useCallback((houseguestId: string) => {
    const houseguest = gameState.houseguests.find(h => h.id === houseguestId);
    if (houseguest && !houseguest.isPlayer) {
      setSelectedHouseguest(houseguest);
      setPerceptionDialogOpen(true);
    }
  }, [gameState.houseguests]);
  
  // Handle saving perception
  const handleSavePerception = useCallback((perception: PlayerPerception) => {
    dispatch({
      type: 'UPDATE_PLAYER_PERCEPTION',
      payload: { perception }
    });
  }, [dispatch]);
  
  // Handle creating/editing alliance
  const handleSaveAlliance = useCallback((alliance: CustomAlliance) => {
    const isNew = !playerPerceptions.customAlliances.some(a => a.id === alliance.id);
    dispatch({
      type: isNew ? 'CREATE_CUSTOM_ALLIANCE' : 'UPDATE_CUSTOM_ALLIANCE',
      payload: { alliance }
    });
    setEditingAlliance(undefined);
  }, [dispatch, playerPerceptions.customAlliances]);
  
  // Handle deleting alliance
  const handleDeleteAlliance = useCallback((allianceId: string) => {
    dispatch({
      type: 'DELETE_CUSTOM_ALLIANCE',
      payload: { allianceId }
    });
    setEditingAlliance(undefined);
  }, [dispatch]);
  
  // Handle clicking on an alliance badge to edit
  const handleAllianceClick = useCallback((alliance: CustomAlliance) => {
    setEditingAlliance(alliance);
    setAllianceDialogOpen(true);
  }, []);
  
  // Get relationship score for the perception dialog
  const getRelationshipScore = useCallback((houseguestId: string): number => {
    if (!player) return 0;
    return getRelationship(player.id, houseguestId);
  }, [player, getRelationship]);
  
  if (!player) return null;
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(
          "p-0 gap-0 overflow-hidden",
          isMobile 
            ? "w-[98vw] h-[95vh] max-w-none max-h-none" 
            : "max-w-[95vw] w-[1200px] h-[90vh] max-h-[800px]"
        )}>
          <DialogHeader className={cn(
            "p-4 pb-2 border-b bg-gradient-to-r from-bb-blue/10 via-transparent to-bb-gold/10",
            isMobile && "p-3 pb-2"
          )}>
            <div className="flex items-center justify-between">
              <DialogTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-lg" : "text-xl"
              )}>
                <Network className={cn("text-bb-blue", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                Social Network
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Legend - Responsive */}
            <div className="mt-2">
              <NetworkLegend isMobile={isMobile} />
            </div>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View Mode Tabs */}
            <div className={cn(
              "px-4 py-2 border-b bg-muted/30",
              isMobile && "px-3 py-1.5"
            )}>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList className={cn(isMobile && "h-8")}>
                  <TabsTrigger value="all" className={cn(
                    "flex items-center gap-1.5",
                    isMobile && "text-xs px-2 py-1"
                  )}>
                    <Eye className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="alliances" className={cn(
                    "flex items-center gap-1.5",
                    isMobile && "text-xs px-2 py-1"
                  )}>
                    <Users className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                    {isMobile ? "Allies" : "Alliances"}
                  </TabsTrigger>
                  <TabsTrigger value="connections" className={cn(
                    "flex items-center gap-1.5",
                    isMobile && "text-xs px-2 py-1"
                  )}>
                    <Network className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                    {isMobile ? "Mine" : "My Connections"}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Main Graph Area */}
            <div className={cn(
              "flex-1 relative bg-gradient-to-br from-background via-muted/20 to-background",
              isMobile ? "overflow-auto touch-pan-x touch-pan-y" : "overflow-hidden"
            )}>
              <SocialNetworkGraph
                houseguests={gameState.houseguests}
                playerId={player.id}
                relationships={gameState.relationships}
                playerPerceptions={playerPerceptions}
                gameAlliances={gameState.alliances}
                onEditPerception={handleEditPerception}
                showOnlyPlayerConnections={viewMode === 'connections'}
                showOnlyAlliances={viewMode === 'alliances'}
                isMobile={isMobile}
              />
              
              {/* Help tooltip - hidden on mobile */}
              {!isMobile && (
                <motion.div 
                  className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <HelpCircle className="h-4 w-4" />
                  Click on any houseguest to edit your perception
                </motion.div>
              )}
            </div>
            
            {/* Alliance Management Footer */}
            <div className={cn(
              "px-4 py-3 border-t bg-muted/30",
              isMobile && "px-3 py-2"
            )}>
              <div className={cn(
                "flex items-center",
                isMobile ? "flex-col gap-2" : "justify-between"
              )}>
                <div className={cn(
                  "flex items-center gap-2",
                  isMobile && "w-full flex-wrap"
                )}>
                  <span className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                    Your Alliances:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {playerPerceptions.customAlliances.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None yet</span>
                    ) : (
                      playerPerceptions.customAlliances.map((alliance) => (
                        <Badge
                          key={alliance.id}
                          variant="outline"
                          className={cn(
                            "cursor-pointer hover:bg-accent transition-colors",
                            isMobile && "text-[10px] px-1.5 py-0.5"
                          )}
                          style={{ borderColor: alliance.color, color: alliance.color }}
                          onClick={() => handleAllianceClick(alliance)}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-1" 
                            style={{ backgroundColor: alliance.color }}
                          />
                          {alliance.name}
                          <span className="ml-1 text-muted-foreground">
                            ({alliance.memberIds.length})
                          </span>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  className={cn(isMobile && "w-full mt-1")}
                  onClick={() => {
                    setEditingAlliance(undefined);
                    setAllianceDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Alliance
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Perception Editor Dialog */}
      <PerceptionEditorDialog
        open={perceptionDialogOpen}
        onOpenChange={setPerceptionDialogOpen}
        houseguest={selectedHouseguest}
        perception={selectedHouseguest ? playerPerceptions.perceptions[selectedHouseguest.id] || null : null}
        customAlliances={playerPerceptions.customAlliances}
        actualRelationshipScore={selectedHouseguest ? getRelationshipScore(selectedHouseguest.id) : 0}
        onSave={handleSavePerception}
      />
      
      {/* Custom Alliance Dialog */}
      <CustomAllianceDialog
        open={allianceDialogOpen}
        onOpenChange={setAllianceDialogOpen}
        existingAlliance={editingAlliance}
        houseguests={activeHouseguests}
        existingAlliances={playerPerceptions.customAlliances}
        onSave={handleSaveAlliance}
        onDelete={handleDeleteAlliance}
      />
    </>
  );
};

export default SocialNetworkDialog;
