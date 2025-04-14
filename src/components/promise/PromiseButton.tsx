
import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { PromiseDialog } from '@/components/promise';

interface PromiseButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const PromiseButton: React.FC<PromiseButtonProps> = ({ 
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { gameState } = useGame();
  
  // Get active promises count
  const activePromiseCount = gameState.promises?.filter(
    p => p.status === 'pending' || p.status === 'active'
  ).length || 0;
  
  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={() => setDialogOpen(true)}
        className={`relative flex items-center gap-1.5 ${className}`}
      >
        <Shield className="h-4 w-4 text-green-500" />
        <span>Promises</span>
        {activePromiseCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 bg-green-100 text-green-800">
            {activePromiseCount}
          </Badge>
        )}
      </Button>
      
      <PromiseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default PromiseButton;
