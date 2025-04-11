
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Houseguest, PersonalityTrait, createHouseguest, HouseguestStats, TRAIT_STAT_BOOSTS, TRAIT_BOOST_VALUES, NominationCount } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import PlayerForm from './game-setup/PlayerForm';
import HouseguestList from './game-setup/HouseguestList';
import { defaultHouseguests, personalityTraits } from './game-setup/defaultHouseguests';
import { PlayerFormData } from './game-setup/types';
import { GamePhase } from '@/models/game-state';

const GameSetup: React.FC = () => {
  const { dispatch } = useGame();
  const [step, setStep] = useState<1 | 2>(1);
  const [playerFormData, setPlayerFormData] = useState<PlayerFormData>({
    playerName: '',
    playerAge: 25,
    playerBio: '',
    playerHometown: '',
    playerOccupation: '',
    selectedTraits: [],
    stats: {
      physical: 5,
      mental: 5,
      endurance: 5,
      social: 5,
      luck: 5,
      competition: 5,
      strategic: 5,
      loyalty: 5
    },
    remainingPoints: 5, // Starting with 5 points to distribute
    houseguestCount: 8
  });
  const [finalHouseguests, setFinalHouseguests] = useState<Houseguest[]>([]);
  
  const handleFormDataChange = (field: keyof PlayerFormData, value: any) => {
    setPlayerFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatsChange = (stat: keyof HouseguestStats, value: number) => {
    // Skip if the stat is nominations which should be handled separately
    if (stat === 'nominations') return;
    
    const currentValue = playerFormData.stats[stat] as number;
    const difference = value - currentValue;
    
    // Check if we have enough points to increase the stat
    if (difference > 0 && playerFormData.remainingPoints < difference) {
      return; // Not enough points
    }
    
    // Calculate new remaining points
    const newRemainingPoints = playerFormData.remainingPoints - difference;
    
    setPlayerFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: value
      },
      remainingPoints: newRemainingPoints
    }));
  };

  const toggleTrait = (trait: PersonalityTrait) => {
    const { selectedTraits, stats } = playerFormData;
    
    if (selectedTraits.includes(trait)) {
      // Remove trait and its stat boosts
      const newTraits = selectedTraits.filter(t => t !== trait);
      const newStats = { ...stats };
      
      // Remove the boosts
      const boost = TRAIT_STAT_BOOSTS[trait];
      
      // Skip if the stat is nominations which should be handled separately
      if (boost.primary !== 'nominations' && typeof newStats[boost.primary] === 'number') {
        newStats[boost.primary] = Math.max(1, (newStats[boost.primary] as number) - TRAIT_BOOST_VALUES.primary);
      }
      
      if (boost.secondary !== 'nominations' && typeof newStats[boost.secondary] === 'number') {
        newStats[boost.secondary] = Math.max(1, (newStats[boost.secondary] as number) - TRAIT_BOOST_VALUES.secondary);
      }
      
      handleFormDataChange('selectedTraits', newTraits);
      handleFormDataChange('stats', newStats);
    } else if (selectedTraits.length < 2) {
      // Add trait and its stat boosts
      const newTraits = [...selectedTraits, trait];
      const newStats = { ...stats };
      
      // Apply the boosts
      const boost = TRAIT_STAT_BOOSTS[trait];
      
      // Skip if the stat is nominations which should be handled separately
      if (boost.primary !== 'nominations' && typeof newStats[boost.primary] === 'number') {
        newStats[boost.primary] = Math.min(10, (newStats[boost.primary] as number) + TRAIT_BOOST_VALUES.primary);
      }
      
      if (boost.secondary !== 'nominations' && typeof newStats[boost.secondary] === 'number') {
        newStats[boost.secondary] = Math.min(10, (newStats[boost.secondary] as number) + TRAIT_BOOST_VALUES.secondary);
      }
      
      handleFormDataChange('selectedTraits', newTraits);
      handleFormDataChange('stats', newStats);
    }
  };
  
  const handlePlayerCreation = () => {
    if (!playerFormData.playerName) return;
    
    const { 
      playerName, 
      playerAge, 
      playerOccupation, 
      playerHometown, 
      playerBio, 
      selectedTraits, 
      stats, 
      houseguestCount 
    } = playerFormData;
    
    // Create player houseguest
    const playerGuest = createHouseguest(
      uuidv4(),
      playerName,
      playerAge,
      playerOccupation,
      playerHometown,
      playerBio,
      '/placeholder.svg', // placeholder avatar
      selectedTraits,
      stats,
      true // isPlayer = true
    );
    
    // Randomly select other houseguests
    const shuffled = [...defaultHouseguests]
      .sort(() => 0.5 - Math.random())
      .slice(0, houseguestCount - 1);
      
    // Create actual houseguest objects
    const npcs = shuffled.map(guest => 
      createHouseguest(
        uuidv4(),
        guest.name,
        guest.age,
        guest.occupation,
        guest.hometown,
        guest.bio,
        guest.imageUrl,
        guest.traits,
        {}, // random stats with trait boosts applied in createHouseguest
        false // isPlayer = false
      )
    );
    
    // Combine player with NPCs
    const allHouseguests = [playerGuest, ...npcs];
    setFinalHouseguests(allHouseguests);
    setStep(2);
  };
  
  const startGame = () => {
    // Convert to PLAYER_ACTION with the appropriate parameters for the new game action system
    dispatch({ 
      type: 'START_GAME', 
      payload: finalHouseguests
    });
    
    // Create initial game event log entry
    dispatch({ 
      type: 'LOG_EVENT', 
      payload: {
        week: 1,
        phase: 'Setup' as GamePhase,
        type: 'GAME_START',
        description: `${playerFormData.playerName} and ${playerFormData.houseguestCount - 1} other houseguests entered the Big Brother house.`,
        involvedHouseguests: finalHouseguests.map(guest => guest.id),
      }
    });
  };

  if (step === 1) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <PlayerForm 
          formData={playerFormData}
          personalityTraits={personalityTraits}
          onFormDataChange={handleFormDataChange}
          onStatsChange={handleStatsChange}
          onToggleTrait={toggleTrait}
          onSubmit={handlePlayerCreation}
        />
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <HouseguestList 
        finalHouseguests={finalHouseguests}
        onBack={() => setStep(1)}
        onStartGame={startGame}
      />
    </div>
  );
};

export default GameSetup;
