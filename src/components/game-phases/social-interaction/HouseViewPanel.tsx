 /**
  * @file HouseViewPanel.tsx
  * @description Wrapper for HouseScene that converts active houseguests to CharacterTemplate format
  */
 
 import React, { memo, useMemo, lazy, Suspense } from 'react';
 import { Houseguest } from '@/models/houseguest';
 import { characterTemplates, CharacterTemplate, Archetype } from '@/data/character-templates';
 import { Loader2 } from 'lucide-react';
 
 // Lazy load HouseScene for better performance
 const HouseScene = lazy(() => import('@/components/avatar-3d/HouseScene').then(m => ({ default: m.HouseScene })));
 
 interface HouseViewPanelProps {
   houseguests: Houseguest[];
   selectedId: string | null;
   onSelect: (id: string) => void;
   hohId?: string;
   nomineeIds?: string[];
   povHolderId?: string;
   playerId?: string;
 }
 
 // Generate status-based tagline for houseguest
 const getStatusTagline = (
   hg: Houseguest,
   hohId?: string,
   nomineeIds?: string[],
   povHolderId?: string,
   playerId?: string
 ): string => {
   if (hg.id === hohId || hg.isHoH) return '👑 Head of Household';
   if (hg.id === povHolderId || hg.isPovHolder) return '🏆 PoV Holder';
   if (nomineeIds?.includes(hg.id) || hg.isNominated) return '⚠️ Nominated';
   if (hg.id === playerId || hg.isPlayer) return '⭐ You';
   return hg.occupation;
 };
 
 // Map Houseguest to CharacterTemplate format for HouseScene
 const mapHouseguestToTemplate = (
   hg: Houseguest,
   hohId?: string,
   nomineeIds?: string[],
   povHolderId?: string,
   playerId?: string
 ): CharacterTemplate => {
   // Find original template by ID or name
   const original = characterTemplates.find(t => t.id === hg.id) || 
                    characterTemplates.find(t => t.name === hg.name);
   
   return {
     id: hg.id,
     name: hg.name,
     age: hg.age,
     occupation: hg.occupation,
     hometown: hg.hometown,
     bio: hg.bio,
     imageUrl: hg.imageUrl || hg.avatarUrl || original?.imageUrl || '',
     traits: hg.traits,
     archetype: (original?.archetype || 'underdog') as Archetype,
     tagline: getStatusTagline(hg, hohId, nomineeIds, povHolderId, playerId),
     avatar3DConfig: hg.avatarConfig || original?.avatar3DConfig || {
       modelSource: 'none',
       bodyType: 'average',
       height: 'average',
       skinTone: '#E8C4A0',
       headShape: 'oval',
       eyeShape: 'almond',
       eyeColor: '#5D4037',
       noseType: 'medium',
       mouthType: 'full',
       hairStyle: 'short',
       hairColor: '#3E2723',
       topStyle: 'tshirt',
       topColor: '#2196F3',
       bottomStyle: 'jeans',
       bottomColor: '#1565C0',
     }
   };
 };
 
 // Loading fallback
 const HouseSceneLoader: React.FC = () => (
   <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-background via-muted to-background rounded-lg">
     <div className="flex flex-col items-center gap-3">
       <Loader2 className="h-8 w-8 animate-spin text-primary" />
       <p className="text-muted-foreground text-sm">Loading House...</p>
     </div>
   </div>
 );
 
 export const HouseViewPanel: React.FC<HouseViewPanelProps> = memo(({
   houseguests,
   selectedId,
   onSelect,
   hohId,
   nomineeIds,
   povHolderId,
   playerId
 }) => {
   // Convert houseguests to CharacterTemplate format
   const characters = useMemo(() => {
     return houseguests.map(hg => 
       mapHouseguestToTemplate(hg, hohId, nomineeIds, povHolderId, playerId)
     );
   }, [houseguests, hohId, nomineeIds, povHolderId, playerId]);
   
   return (
     <div className="w-full h-full min-h-[350px] rounded-lg overflow-hidden border border-border/50 bg-card">
       <Suspense fallback={<HouseSceneLoader />}>
         <HouseScene
           characters={characters}
           selectedId={selectedId}
           onSelect={onSelect}
         />
       </Suspense>
     </div>
   );
 });
 
 HouseViewPanel.displayName = 'HouseViewPanel';
 
 export default HouseViewPanel;