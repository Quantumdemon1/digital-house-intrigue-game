/**
 * @file src/components/social-network/NetworkLegend.tsx
 * @description Comprehensive legend component for the social network visualization
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { HoHIcon, PoVIcon, NomineeIcon } from './StatusIcons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface NetworkLegendProps {
  isMobile?: boolean;
  className?: string;
}

const LegendContent: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <div className={cn(
    "flex flex-wrap items-center text-xs",
    isMobile ? "flex-col items-start gap-3" : "gap-x-6 gap-y-2"
  )}>
    {/* Relationship Colors */}
    <div className={cn(
      "flex items-center",
      isMobile ? "flex-wrap gap-2" : "gap-4"
    )}>
      <span className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
        Relationships:
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-sm" />
          <span className="text-foreground/80">Allies</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 shadow-sm" />
          <span className="text-foreground/80">Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-gradient-to-r from-red-400 to-red-500 shadow-sm" />
          <span className="text-foreground/80">Enemies</span>
        </div>
      </div>
    </div>
    
    {/* Line Thickness */}
    <div className={cn(
      "flex items-center gap-3",
      !isMobile && "border-l pl-4 border-border/50"
    )}>
      <span className="text-muted-foreground text-[10px] uppercase tracking-wide">Strength:</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="w-5 h-[2px] bg-muted-foreground/60 rounded" />
          <span className="text-[10px] text-foreground/70">Weak</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-[4px] bg-muted-foreground rounded" />
          <span className="text-[10px] text-foreground/70">Strong</span>
        </div>
      </div>
    </div>
    
    {/* Status Symbols */}
    <div className={cn(
      "flex items-center",
      isMobile ? "flex-wrap gap-2" : "gap-3 border-l pl-4 border-border/50"
    )}>
      <span className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
        Status:
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <HoHIcon className="h-4 w-4" />
          <span className="text-foreground/80">HoH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PoVIcon className="h-4 w-4" />
          <span className="text-foreground/80">PoV</span>
        </div>
        <div className="flex items-center gap-1.5">
          <NomineeIcon className="h-4 w-4" />
          <span className="text-foreground/80">Nominee</span>
        </div>
      </div>
    </div>
  </div>
);

export const NetworkLegend: React.FC<NetworkLegendProps> = ({ 
  isMobile = false,
  className 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  if (isMobile) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between px-3 py-2 h-auto"
          >
            <span className="flex items-center gap-2 text-xs">
              <HelpCircle className="h-3.5 w-3.5" />
              Legend & Help
            </span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 transition-transform",
              isOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 py-2 border-t border-border/50">
          <LegendContent isMobile={true} />
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  return (
    <div className={cn("py-1", className)}>
      <LegendContent isMobile={false} />
    </div>
  );
};

export default NetworkLegend;
