
import React, { useState, useCallback } from 'react';
import AllianceProposalModal from './AllianceProposalModal';
import { useGame } from '@/contexts/GameContext';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export type AllianceProposalData = {
  name: string;
  members: string[];
  isPublic: boolean;
};

export const AllianceManager: React.FC = () => {
  const { game, dispatch } = useGame();
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Function to open the alliance proposal modal
  const openProposalModal = useCallback(() => {
    setIsProposalModalOpen(true);
  }, []);

  // Function to submit an alliance proposal
  const handleAllianceProposal = useCallback((data: AllianceProposalData) => {
    if (!game || !game.controller.allianceSystem) return;
    
    const playerHouseguest = game.houseguests.find(h => h.isPlayer);
    if (!playerHouseguest) return;
    
    // Get selected houseguests
    const selectedMembers = data.members
      .map(id => game.getHouseguestById(id))
      .filter(Boolean);
    
    // Add player to the alliance members
    const allMembers = [playerHouseguest, ...selectedMembers];
    
    try {
      // Create the alliance
      const alliance = game.controller.allianceSystem.createAlliance(
        data.name,
        allMembers,
        playerHouseguest,
        data.isPublic
      );
      
      toast({
        title: "Alliance Formed",
        description: `You've created "${data.name}" with ${selectedMembers.map(m => m?.name).join(", ")}`
      });
      
      // Trigger AI evaluation of the alliance proposal for each member
      selectedMembers.forEach(async (member) => {
        if (!member || !game.controller.aiSystem) return;
        
        // Get relationship data for context
        const relationshipScore = game.controller.relationshipSystem.getRelationship(
          member.id,
          playerHouseguest.id
        );
        
        // Propose alliance context
        const allianceContext = {
          proposer: playerHouseguest.name,
          allianceName: data.name,
          memberNames: allMembers.map(m => m.name),
          isPublic: data.isPublic,
          week: game.week,
          relationships: {} as Record<string, any>
        };
        
        // Add relationship data for each member
        allMembers.forEach(m => {
          if (m.id !== member.id) {
            allianceContext.relationships[m.name] = {
              score: game.controller.relationshipSystem.getEffectiveRelationship(member.id, m.id),
              level: game.controller.relationshipSystem.getRelationshipLevel(member.id, m.id)
            };
          }
        });
        
        // Make AI decision about alliance acceptance
        try {
          const decision = await game.controller.aiSystem.makeDecision(
            member.name,
            'alliance_response',
            allianceContext,
            game
          );
          
          if (decision && decision.accept) {
            // If accepted, member stays in alliance
            toast({
              title: "Alliance Accepted",
              description: `${member.name} has accepted your alliance proposal.`
            });
          } else {
            // If rejected, remove from alliance
            game.controller.allianceSystem.removeMemberFromAlliance(
              alliance,
              member.id,
              "Declined alliance invitation"
            );
            
            toast({
              title: "Alliance Declined",
              description: `${member.name} has declined to join your alliance.`,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error in AI alliance response:", error);
          
          // Fallback: Base acceptance on relationship score
          const willAccept = relationshipScore > 20 || Math.random() < 0.5;
          
          if (!willAccept) {
            game.controller.allianceSystem.removeMemberFromAlliance(
              alliance,
              member.id,
              "Declined alliance invitation"
            );
            
            toast({
              title: "Alliance Declined",
              description: `${member.name} has declined to join your alliance.`,
              variant: "destructive"
            });
          }
        }
      });
      
      // Update game state to reflect the new alliance
      dispatch({ type: 'UPDATE_GAME_STATE', payload: { ...game } });
      
    } catch (error) {
      console.error("Error creating alliance:", error);
      toast({
        title: "Alliance Error",
        description: "There was an error creating your alliance.",
        variant: "destructive"
      });
    }
  }, [game, dispatch]);

  // Register openProposalModal with the game controller
  React.useEffect(() => {
    if (game && game.controller) {
      game.controller.openAllianceProposalUI = openProposalModal;
    }
  }, [game, openProposalModal]);

  return (
    <>
      <AllianceProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSubmit={handleAllianceProposal}
      />
    </>
  );
};

export default AllianceManager;
