 /**
  * @file AvatarControlPanel.tsx
  * @description Player avatar controls overlay with gestures and quick actions
  */
 
 import React, { memo, useState, useEffect } from 'react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { cn } from '@/lib/utils';
 import { Hand, ThumbsUp, Users, ChevronDown, Loader2 } from 'lucide-react';
 import { GestureType } from '@/components/avatar-3d/hooks/useGestureAnimation';
 
 // Gesture button configuration
 interface GestureButton {
   type: GestureType;
   icon: string;
   label: string;
   cooldown: number; // seconds
 }
 
 const GESTURE_BUTTONS: GestureButton[] = [
   { type: 'wave', icon: '👋', label: 'Wave', cooldown: 2 },
   { type: 'thumbsUp', icon: '👍', label: 'Thumbs Up', cooldown: 1.5 },
   { type: 'shrug', icon: '🤷', label: 'Shrug', cooldown: 1.5 },
   { type: 'clap', icon: '👏', label: 'Clap', cooldown: 2.5 },
   { type: 'nod', icon: '😌', label: 'Nod', cooldown: 1 },
   { type: 'point', icon: '👉', label: 'Point', cooldown: 1.5 },
 ];
 
 interface CharacterOption {
   id: string;
   name: string;
   tagline?: string;
 }
 
 interface AvatarControlPanelProps {
   isVisible: boolean;
   onGesture: (gesture: GestureType) => void;
   onQuickSocialize: (targetId: string) => void;
   characters: CharacterOption[];
   playerId: string;
   currentGesture?: GestureType | null;
   gestureInProgress?: boolean;
   className?: string;
 }
 
 export const AvatarControlPanel: React.FC<AvatarControlPanelProps> = memo(({
   isVisible,
   onGesture,
   onQuickSocialize,
   characters,
   playerId,
   currentGesture,
   gestureInProgress = false,
   className,
 }) => {
   // Track cooldowns for each gesture
   const [cooldowns, setCooldowns] = useState<Record<GestureType, number>>({
     wave: 0, nod: 0, shrug: 0, clap: 0, point: 0, thumbsUp: 0
   });
   
   // Countdown cooldowns
   useEffect(() => {
     const interval = setInterval(() => {
       setCooldowns(prev => {
         const next = { ...prev };
         let changed = false;
         Object.keys(next).forEach(key => {
           const gesture = key as GestureType;
           if (next[gesture] > 0) {
             next[gesture] = Math.max(0, next[gesture] - 0.1);
             changed = true;
           }
         });
         return changed ? next : prev;
       });
     }, 100);
     
     return () => clearInterval(interval);
   }, []);
   
   const handleGesture = (gesture: GestureType) => {
     if (gestureInProgress || cooldowns[gesture] > 0) return;
     
     const config = GESTURE_BUTTONS.find(b => b.type === gesture);
     if (config) {
       setCooldowns(prev => ({ ...prev, [gesture]: config.cooldown }));
       onGesture(gesture);
     }
   };
   
   // Filter out player from character list
   const otherCharacters = characters.filter(c => c.id !== playerId);
   
   if (!isVisible) return null;
   
   return (
     <Card className={cn(
       'bg-background/95 backdrop-blur-md border-primary/30 shadow-xl',
       'animate-fade-in',
       className
     )}>
       <CardHeader className="py-2 px-3">
         <CardTitle className="text-sm flex items-center gap-2">
           <span className="text-primary">⭐</span>
           Your Avatar
         </CardTitle>
       </CardHeader>
       
       <CardContent className="p-3 pt-0 space-y-3">
         {/* Gesture Buttons */}
         <div>
           <p className="text-xs text-muted-foreground mb-2">Gestures</p>
           <div className="flex flex-wrap gap-1.5">
             {GESTURE_BUTTONS.map(({ type, icon, label, cooldown }) => {
               const isOnCooldown = cooldowns[type] > 0;
               const isActive = currentGesture === type;
               const progress = isOnCooldown ? (cooldowns[type] / cooldown) * 100 : 0;
               
               return (
                 <Button
                   key={type}
                   variant={isActive ? 'default' : 'outline'}
                   size="sm"
                   disabled={gestureInProgress || isOnCooldown}
                   onClick={() => handleGesture(type)}
                   className={cn(
                     'relative overflow-hidden min-w-[60px] h-8',
                     isActive && 'bg-primary text-primary-foreground'
                   )}
                   title={label}
                 >
                   {/* Cooldown overlay */}
                   {isOnCooldown && (
                     <div 
                       className="absolute inset-0 bg-muted-foreground/30"
                       style={{ 
                         clipPath: `inset(0 ${100 - progress}% 0 0)` 
                       }}
                     />
                   )}
                   
                   <span className="relative z-10 flex items-center gap-1">
                     <span className="text-base">{icon}</span>
                     <span className="text-xs hidden sm:inline">{label}</span>
                   </span>
                   
                   {isActive && (
                     <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                   )}
                 </Button>
               );
             })}
           </div>
         </div>
         
         {/* Quick Socialize */}
         <div>
           <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button 
                 variant="secondary" 
                 size="sm" 
                 className="w-full justify-between"
               >
                 <span className="flex items-center gap-2">
                   <Users className="h-4 w-4" />
                   Socialize With...
                 </span>
                 <ChevronDown className="h-4 w-4" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent 
               align="start" 
               className="w-56 max-h-60 overflow-y-auto"
             >
               {otherCharacters.map(char => (
                 <DropdownMenuItem
                   key={char.id}
                   onClick={() => onQuickSocialize(char.id)}
                   className="flex flex-col items-start gap-0.5"
                 >
                   <span className="font-medium">{char.name}</span>
                   {char.tagline && (
                     <span className="text-xs text-muted-foreground">
                       {char.tagline}
                     </span>
                   )}
                 </DropdownMenuItem>
               ))}
               {otherCharacters.length === 0 && (
                 <DropdownMenuItem disabled>
                   No other houseguests
                 </DropdownMenuItem>
               )}
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </CardContent>
     </Card>
   );
 });
 
 AvatarControlPanel.displayName = 'AvatarControlPanel';
 
 export default AvatarControlPanel;