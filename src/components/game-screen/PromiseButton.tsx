
import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { PromiseDialog } from '@/components/promise';

const PromiseButton: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { game } = useGame();
  
  // Get active promises count (if game is available)
  const activePromiseCount = game?.promises?.filter(
    p => p.status === 'pending' || p.status === 'active'
  ).length || 0;
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="relative flex items-center gap-1.5"
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
