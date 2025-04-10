
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import JuryVoting from './JuryVoting';

interface JuryVoteSectionProps {
  finalHoH: Houseguest;
  finalist: Houseguest;
  juryMembers: Houseguest[];
  handleJuryVoteComplete: (winner: Houseguest, runnerUp: Houseguest) => void;
  getRelationship: (guest1Id: string, guest2Id: string) => number;
}

const JuryVoteSection: React.FC<JuryVoteSectionProps> = ({
  finalHoH,
  finalist,
  juryMembers,
  handleJuryVoteComplete,
  getRelationship
}) => {
  return (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-bold mb-4">Jury Vote</h3>
      
      <div className="flex justify-center items-center gap-16 my-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
            {finalHoH.name.charAt(0)}
          </div>
          <p className="font-semibold">{finalHoH.name}</p>
          <p className="text-sm text-muted-foreground">Final HoH</p>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
            {finalist.name.charAt(0)}
          </div>
          <p className="font-semibold">{finalist.name}</p>
          <p className="text-sm text-muted-foreground">Finalist</p>
        </div>
      </div>
      
      <JuryVoting 
        finalist1={finalHoH}
        finalist2={finalist}
        jury={juryMembers}
        onVotingComplete={handleJuryVoteComplete}
        getRelationship={getRelationship}
      />
    </div>
  );
};

export default JuryVoteSection;
