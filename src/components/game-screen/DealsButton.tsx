
import React, { useState } from 'react';
import { Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { DealsPanel } from '@/components/deals';

const DealsButton: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { game } = useGame();
  
  const playerId = game?.houseguests.find(h => h.isPlayer)?.id || '';
  
  // Get active deals count
  const activeDealsCount = game?.deals?.filter(
    d => d.status === 'active' && 
    (d.proposerId === playerId || d.recipientId === playerId)
  ).length || 0;
  
  // Get pending proposals count
  const pendingProposalsCount = game?.pendingNPCProposals?.filter(
    p => p.response === 'pending'
  ).length || 0;
  
  const totalCount = activeDealsCount + pendingProposalsCount;
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="relative flex items-center gap-1.5"
      >
        <Handshake className="h-4 w-4 text-amber-500" />
        <span>Deals</span>
        {totalCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 bg-amber-100 text-amber-800">
            {totalCount}
          </Badge>
        )}
      </Button>
      
      <DealsPanel
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default DealsButton;
