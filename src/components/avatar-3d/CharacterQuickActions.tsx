 /**
  * @file CharacterQuickActions.tsx
  * @description Quick action overlay for selected character in 3D house view
  */
 
 import React from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Button } from '@/components/ui/button';
 import { MessageSquare, Users, Info, Heart, Swords } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 export type QuickActionType = 'chat' | 'ally' | 'info' | 'relationship';
 
 interface CharacterQuickActionsProps {
   characterId: string;
   characterName: string;
   isVisible: boolean;
   relationshipScore?: number;
   isAlly?: boolean;
   onAction: (action: QuickActionType) => void;
   className?: string;
 }
 
 /**
  * Get relationship indicator based on score
  */
 const getRelationshipIndicator = (score: number) => {
   if (score >= 50) return { icon: Heart, color: 'text-green-400', label: 'Ally' };
   if (score >= 20) return { icon: Heart, color: 'text-green-300', label: 'Friend' };
   if (score <= -50) return { icon: Swords, color: 'text-red-400', label: 'Enemy' };
   if (score <= -20) return { icon: Swords, color: 'text-orange-400', label: 'Rival' };
   return { icon: Users, color: 'text-muted-foreground', label: 'Neutral' };
 };
 
 export const CharacterQuickActions: React.FC<CharacterQuickActionsProps> = ({
   characterId,
   characterName,
   isVisible,
   relationshipScore = 0,
   isAlly = false,
   onAction,
   className
 }) => {
   const relationship = getRelationshipIndicator(relationshipScore);
   const RelationshipIcon = relationship.icon;
   
   return (
     <AnimatePresence>
       {isVisible && (
         <motion.div
           initial={{ opacity: 0, y: 10, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -10, scale: 0.9 }}
           transition={{ duration: 0.2 }}
           className={cn(
             'flex flex-col items-center gap-2 pointer-events-auto',
             className
           )}
         >
           {/* Relationship indicator */}
           <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm border border-border">
             <RelationshipIcon className={cn('h-3 w-3', relationship.color)} />
             <span className={cn('text-xs font-medium', relationship.color)}>
               {relationship.label}
             </span>
             {isAlly && (
               <span className="text-xs text-primary font-bold ml-1">★</span>
             )}
           </div>
           
           {/* Action buttons */}
           <motion.div 
             className="flex items-center gap-1.5 p-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg"
             initial={{ scale: 0.8 }}
             animate={{ scale: 1 }}
             transition={{ delay: 0.1 }}
           >
             <Button
               variant="ghost"
               size="sm"
               onClick={() => onAction('chat')}
               className="h-8 w-8 p-0 rounded-full hover:bg-primary/20 hover:text-primary"
               title={`Chat with ${characterName}`}
             >
               <MessageSquare className="h-4 w-4" />
             </Button>
             
             <Button
               variant="ghost"
               size="sm"
               onClick={() => onAction('ally')}
               className={cn(
                 'h-8 w-8 p-0 rounded-full',
                 isAlly 
                   ? 'bg-primary/20 text-primary' 
                   : 'hover:bg-primary/20 hover:text-primary'
               )}
               title={isAlly ? 'View Alliance' : 'Form Alliance'}
             >
               <Users className="h-4 w-4" />
             </Button>
             
             <Button
               variant="ghost"
               size="sm"
               onClick={() => onAction('info')}
               className="h-8 w-8 p-0 rounded-full hover:bg-accent hover:text-accent-foreground"
               title={`View ${characterName}'s profile`}
             >
               <Info className="h-4 w-4" />
             </Button>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 };
 
 /**
  * Get status ring color for carousel based on relationship/role
  */
 export const getStatusRingColor = (
   relationshipScore: number,
   isAlly: boolean,
   isHoH: boolean,
   isNominee: boolean
 ): string => {
   if (isHoH) return 'ring-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]';
   if (isNominee) return 'ring-red-400';
   if (isAlly) return 'ring-green-400';
   if (relationshipScore >= 50) return 'ring-green-300';
   if (relationshipScore <= -50) return 'ring-red-300';
   return 'ring-border';
 };
 
 export default CharacterQuickActions;