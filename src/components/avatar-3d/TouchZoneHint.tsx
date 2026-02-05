 /**
  * @file TouchZoneHint.tsx
  * @description Visual hint overlay showing touch gesture zones for mobile users
  */
 
 import React, { useEffect, useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Hand, Move, ZoomIn } from 'lucide-react';
 
 interface TouchZoneHintProps {
   /** Whether to show the hint overlay */
   visible?: boolean;
   /** Auto-hide after duration (ms), 0 to disable */
   autoHideDuration?: number;
   /** Callback when hint is dismissed */
   onDismiss?: () => void;
 }
 
 export const TouchZoneHint: React.FC<TouchZoneHintProps> = ({
   visible = true,
   autoHideDuration = 3000,
   onDismiss
 }) => {
   const [show, setShow] = useState(visible);
   
   useEffect(() => {
     setShow(visible);
     
     if (visible && autoHideDuration > 0) {
       const timer = setTimeout(() => {
         setShow(false);
         onDismiss?.();
       }, autoHideDuration);
       
       return () => clearTimeout(timer);
     }
   }, [visible, autoHideDuration, onDismiss]);
   
   return (
     <AnimatePresence>
       {show && (
         <motion.div
           className="absolute inset-0 pointer-events-none z-20"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.3 }}
         >
           {/* Semi-transparent overlay */}
           <div className="absolute inset-0 bg-black/30" />
           
           {/* Center gesture zone */}
           <div className="absolute inset-8 sm:inset-16">
             <motion.div
               className="w-full h-full border-2 border-dashed border-white/30 rounded-2xl"
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2 }}
             >
               {/* Gesture hints */}
               <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                 {/* Rotate hint */}
                 <motion.div
                   className="flex items-center gap-2 text-white/80"
                   initial={{ y: -10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.3 }}
                 >
                   <Hand className="h-5 w-5" />
                   <span className="text-sm font-medium">Drag to rotate</span>
                 </motion.div>
                 
                 {/* Zoom hint */}
                 <motion.div
                   className="flex items-center gap-2 text-white/80"
                   initial={{ y: -10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.4 }}
                 >
                   <ZoomIn className="h-5 w-5" />
                   <span className="text-sm font-medium">Pinch to zoom</span>
                 </motion.div>
                 
                 {/* Move hint */}
                 <motion.div
                   className="flex items-center gap-2 text-white/80"
                   initial={{ y: -10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.5 }}
                 >
                   <Move className="h-5 w-5" />
                   <span className="text-sm font-medium">Hold to move avatar</span>
                 </motion.div>
               </div>
             </motion.div>
           </div>
           
           {/* Tap to dismiss hint */}
           <motion.div
             className="absolute bottom-20 left-1/2 -translate-x-1/2"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
           >
             <span className="text-white/50 text-xs">Tap anywhere to dismiss</span>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 };
 
 export default TouchZoneHint;