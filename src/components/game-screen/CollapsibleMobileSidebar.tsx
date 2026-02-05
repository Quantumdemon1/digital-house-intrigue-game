 /**
  * @file CollapsibleMobileSidebar.tsx
  * @description Collapsible wrapper for GameSidebar on mobile devices
  */
 
 import React, { useState } from 'react';
 import { ChevronDown, Users } from 'lucide-react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { useIsMobile } from '@/hooks/use-mobile';
 import { cn } from '@/lib/utils';
 import GameSidebar from './GameSidebar';
 
 const CollapsibleMobileSidebar: React.FC = () => {
   const isMobile = useIsMobile();
   const [isExpanded, setIsExpanded] = useState(false);
   
   // On desktop, just render the sidebar directly
   if (!isMobile) {
     return <GameSidebar />;
   }
   
   return (
     <div className="w-full">
       {/* Collapsible trigger */}
       <button
         onClick={() => setIsExpanded(!isExpanded)}
         className={cn(
           "w-full p-3 rounded-lg border transition-all duration-200",
           "flex items-center justify-between",
           "bg-card hover:bg-accent/50",
           isExpanded && "rounded-b-none border-b-0"
         )}
       >
         <div className="flex items-center gap-2">
           <Users className="h-4 w-4 text-primary" />
           <span className="font-semibold text-sm">Houseguests & Status</span>
         </div>
         <ChevronDown 
           className={cn(
             "h-4 w-4 text-muted-foreground transition-transform duration-200",
             isExpanded && "rotate-180"
           )} 
         />
       </button>
       
       {/* Collapsible content */}
       <AnimatePresence>
         {isExpanded && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.2 }}
             className="overflow-hidden border border-t-0 rounded-b-lg bg-card"
           >
             <GameSidebar />
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 };
 
 export default CollapsibleMobileSidebar;