 /**
  * @file HouseViewToggle.tsx
  * @description Toggle button to show/hide the 3D House View in Social Phase
  */
 
 import React from 'react';
 import { Button } from '@/components/ui/button';
 import { Home, List } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface HouseViewToggleProps {
   showHouseView: boolean;
   onToggle: () => void;
   className?: string;
 }
 
 export const HouseViewToggle: React.FC<HouseViewToggleProps> = ({
   showHouseView,
   onToggle,
   className
 }) => {
   return (
     <Button
       variant="outline"
       size="sm"
       onClick={onToggle}
       className={cn(
         "gap-2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent",
         className
       )}
     >
       {showHouseView ? (
         <>
           <List className="h-4 w-4" />
           <span className="hidden sm:inline">Hide House</span>
         </>
       ) : (
         <>
           <Home className="h-4 w-4" />
           <span className="hidden sm:inline">Show House</span>
         </>
       )}
     </Button>
   );
 };
 
 export default HouseViewToggle;