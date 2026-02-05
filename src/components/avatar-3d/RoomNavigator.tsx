 /**
  * @file RoomNavigator.tsx
  * @description Quick-jump room navigation UI for 3D house exploration
  */
 
 import React from 'react';
 import { Button } from '@/components/ui/button';
 import { motion } from 'framer-motion';
 import { 
   Home, Crown, MessageSquare, ChefHat, Tv, Gamepad2, 
   AlertTriangle, Bed, Waves, X
 } from 'lucide-react';
 
 export interface RoomCameraPosition {
   camera: [number, number, number];
   target: [number, number, number];
   label: string;
   icon: React.ReactNode;
 }
 
 export const ROOM_CAMERA_POSITIONS: Record<string, RoomCameraPosition> = {
   overview: {
     camera: [0, 18, 25],
     target: [0, 0.5, 0],
     label: 'Overview',
     icon: <Home className="h-4 w-4" />,
   },
   hohSuite: {
     camera: [14, 5, -6],
     target: [10, 0.5, -10],
     label: 'HOH Suite',
     icon: <Crown className="h-4 w-4" />,
   },
   diaryRoom: {
     camera: [-10, 3, -3],
     target: [-14, 1, -3],
     label: 'Diary Room',
     icon: <MessageSquare className="h-4 w-4" />,
   },
   kitchen: {
     camera: [16, 5, 4],
     target: [12, 0.5, 0],
     label: 'Kitchen',
     icon: <ChefHat className="h-4 w-4" />,
   },
   livingRoom: {
     camera: [0, 6, 10],
     target: [0, 0.5, 0],
     label: 'Living Room',
     icon: <Tv className="h-4 w-4" />,
   },
   gameRoom: {
     camera: [16, 4, 14],
     target: [12, 0.5, 9],
     label: 'Game Room',
     icon: <Gamepad2 className="h-4 w-4" />,
   },
   nomination: {
     camera: [0, 5, 18],
     target: [0, 0.5, 11],
     label: 'Nomination',
     icon: <AlertTriangle className="h-4 w-4" />,
   },
   bedrooms: {
     camera: [-6, 5, -4],
     target: [-5, 0.5, -10],
     label: 'Bedrooms',
     icon: <Bed className="h-4 w-4" />,
   },
   backyard: {
     camera: [0, 12, -32],
     target: [0, 0, -22],
     label: 'Backyard',
     icon: <Waves className="h-4 w-4" />,
   },
 };
 
 interface RoomNavigatorProps {
   currentRoom: string | null;
   onNavigate: (roomId: string) => void;
   isOpen?: boolean;
   onClose?: () => void;
 }
 
 export const RoomNavigator: React.FC<RoomNavigatorProps> = ({ 
   currentRoom, 
   onNavigate,
   isOpen = true,
   onClose
 }) => {
   if (!isOpen) return null;
   
   const rooms = Object.entries(ROOM_CAMERA_POSITIONS);
   
   return (
     <motion.div
       initial={{ opacity: 0, x: -20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg"
     >
       {/* Header */}
       <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
         <div className="flex items-center gap-2">
           <Home className="h-4 w-4 text-primary" />
           <span className="text-sm font-semibold text-foreground">Rooms</span>
         </div>
         {onClose && (
           <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
             <X className="h-3 w-3" />
           </Button>
         )}
       </div>
       
       {/* Room buttons grid */}
       <div className="grid grid-cols-2 gap-1.5">
         {rooms.map(([roomId, room]) => (
           <Button
             key={roomId}
             variant={currentRoom === roomId ? 'default' : 'ghost'}
             size="sm"
             onClick={() => onNavigate(roomId)}
             className={`
               justify-start gap-2 h-8 px-2 text-xs
               ${currentRoom === roomId 
                 ? 'bg-primary text-primary-foreground' 
                 : 'hover:bg-accent hover:text-accent-foreground'
               }
             `}
           >
             {room.icon}
             <span className="hidden sm:inline truncate">{room.label}</span>
           </Button>
         ))}
       </div>
     </motion.div>
   );
 };
 
 /**
  * Compact room navigator for mobile - icon-only strip
  */
 export const RoomNavigatorCompact: React.FC<{
   currentRoom: string | null;
   onNavigate: (roomId: string) => void;
 }> = ({ currentRoom, onNavigate }) => {
   const rooms = Object.entries(ROOM_CAMERA_POSITIONS);
   
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-border rounded-full px-2 py-1 shadow-lg"
     >
       {rooms.map(([roomId, room]) => (
         <Button
           key={roomId}
           variant="ghost"
           size="sm"
           onClick={() => onNavigate(roomId)}
           className={`
             h-8 w-8 p-0 rounded-full
             ${currentRoom === roomId 
               ? 'bg-primary text-primary-foreground' 
               : 'text-muted-foreground hover:text-foreground'
             }
           `}
           title={room.label}
         >
           {room.icon}
         </Button>
       ))}
     </motion.div>
   );
 };
 
 export default RoomNavigator;