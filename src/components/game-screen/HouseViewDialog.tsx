 import React, { useMemo } from 'react';
 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { X } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { useGame } from '@/contexts/GameContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
 import { HouseScene, CharacterCarousel } from '@/components/avatar-3d';
 import { characterTemplates, CharacterTemplate } from '@/data/character-templates';
 import { Houseguest } from '@/models/houseguest';
 
 interface HouseViewDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 // Get status tagline for houseguest
 const getStatusTagline = (hg: Houseguest, hohId?: string, nomineeIds: string[] = []): string => {
   if (hg.id === hohId) return '👑 Head of Household';
   if (nomineeIds.includes(hg.id)) return '⚠️ Nominated';
   if (hg.isPovHolder) return '🏆 PoV Holder';
   return hg.isPlayer ? '🎮 You' : 'Houseguest';
 };
 
 const HouseViewDialog: React.FC<HouseViewDialogProps> = ({ open, onOpenChange }) => {
   const { gameState } = useGame();
   const [selectedId, setSelectedId] = React.useState<string | null>(null);
   const [showRoomNav, setShowRoomNav] = useState(true);
  const isMobile = useIsMobile();
   
   // Convert active houseguests to CharacterTemplate format
   const activeCharacters = useMemo(() => {
     const activeHouseguests = gameState.houseguests.filter(h => h.status === 'Active');
     const hohId = gameState.hohWinner?.id;
     const nomineesIds = gameState.nominees?.map(n => n.id) || [];
     
     return activeHouseguests.map((hg): CharacterTemplate => {
       const original = characterTemplates.find(t => t.id === hg.id);
       
       return {
         id: hg.id,
         name: hg.name,
         age: original?.age || 25,
         occupation: original?.occupation || 'Houseguest',
         hometown: original?.hometown || 'Unknown',
         bio: original?.bio || '',
         archetype: original?.archetype || 'socialite',
         tagline: getStatusTagline(hg, hohId, nomineesIds),
         imageUrl: hg.avatarUrl || original?.imageUrl || '',
         traits: original?.traits || [],
         avatar3DConfig: hg.avatarConfig || original?.avatar3DConfig || { modelSource: 'rpm', modelUrl: '' },
       };
     });
   }, [gameState.houseguests, gameState.hohWinner, gameState.nominees]);
   
   // Get player ID for gestures
   const playerId = gameState.houseguests.find(h => h.isPlayer)?.id;
   
   // Build relationships map
   const relationships = useMemo(() => {
     const player = gameState.houseguests.find(h => h.isPlayer);
     if (!player) return {};
     
     const relMap: Record<string, number> = {};
     if (player.relationships) {
       for (const [id, val] of Object.entries(player.relationships)) {
         if (typeof val === 'number') {
           relMap[id] = val;
         }
       }
     }
     return relMap;
   }, [gameState.houseguests]);
   
   if (!open) return null;
   
   return (
     <AnimatePresence>
       {open && (
         <motion.div
            className={cn(
              "fixed inset-0 z-50 bg-background",
              // Safe area insets for notched devices
              "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
              "pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
            )}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
         >
           {/* Close button */}
            <div className={cn(
              "absolute z-50",
              isMobile ? "top-2 right-2" : "top-4 right-4"
            )}>
             <Button
               variant="outline"
                size={isMobile ? "default" : "icon"}
               onClick={() => onOpenChange(false)}
                className={cn(
                  "bg-black/50 backdrop-blur-sm border-white/20 hover:bg-white/10",
                  isMobile && "h-12 w-12"
                )}
             >
               <X className="h-5 w-5" />
             </Button>
           </div>
           
           {/* 3D House Scene */}
           <div className="absolute inset-0">
             <HouseScene
               characters={activeCharacters}
               selectedId={selectedId}
               onSelect={setSelectedId}
               playerId={playerId}
               relationships={relationships}
             gamePhase={gameState.phase}
             showRoomNav={showRoomNav}
             />
           </div>
           
           {/* Character Carousel */}
           <div className="absolute bottom-0 left-0 right-0 z-10">
             <CharacterCarousel
               characters={activeCharacters}
               selectedId={selectedId}
               onSelect={setSelectedId}
             />
           </div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 };
 
 export default HouseViewDialog;