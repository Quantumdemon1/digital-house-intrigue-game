
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Target } from 'lucide-react';

interface NomineeDisplayProps {
  nominee: Houseguest;
  voteCount?: number;
  showVotes?: boolean;
}

const NomineeDisplay: React.FC<NomineeDisplayProps> = ({ 
  nominee, 
  voteCount = 0,
  showVotes = false 
}) => {
  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-b from-bb-red/5 to-transparent border border-bb-red/20">
      <div className="relative">
        <StatusAvatar
          name={nominee.name}
          imageUrl={nominee.imageUrl}
          status="nominee"
          size="lg"
        />
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-bb-red">
          <Target className="h-3 w-3 text-white" />
        </div>
      </div>
      
      <p className="font-semibold text-lg mt-3 text-foreground">{nominee.name}</p>
      <p className="text-sm text-muted-foreground">{nominee.occupation}</p>
      
      {showVotes && (
        <div className="mt-3 px-4 py-1.5 bg-bb-red/10 rounded-full">
          <span className="text-sm font-bold text-bb-red">{voteCount} votes</span>
        </div>
      )}
    </div>
  );
};

export default NomineeDisplay;
