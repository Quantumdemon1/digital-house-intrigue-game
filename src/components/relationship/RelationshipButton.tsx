
import React, { useState } from 'react';
import { BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import RelationshipDialog from './RelationshipDialog';

interface RelationshipButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const RelationshipButton: React.FC<RelationshipButtonProps> = ({
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={`flex items-center gap-1.5 ${className}`}
      >
        <BarChart className="h-4 w-4 text-blue-500" />
        <span>Relationships</span>
      </Button>
      
      <RelationshipDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
};

export default RelationshipButton;
