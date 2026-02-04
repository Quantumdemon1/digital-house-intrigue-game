
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Houseguest, PersonalityTrait, createHouseguest, HouseguestStats, TRAIT_STAT_BOOSTS, TRAIT_BOOST_VALUES, NominationCount } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import PlayerForm from './game-setup/PlayerForm';
import HouseguestList from './game-setup/HouseguestList';
import { AvatarSelector } from './game-setup/AvatarSelector';
import { characterTemplates, CharacterTemplate } from '@/data/character-templates';
import { personalityTraits } from './game-setup/defaultHouseguests';
import { PlayerFormData } from './game-setup/types';
import { GamePhase } from '@/models/game-state';
import { staggerContainer, cardVariants } from '@/lib/motion-variants';

const GameSetup: React.FC = () => {
  const { dispatch } = useGame();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<CharacterTemplate | null>(null);
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
    remainingPoints: 5,
    houseguestCount: 8,
    avatarUrl: undefined,
    templateId: undefined
  });
  const [finalHouseguests, setFinalHouseguests] = useState<Houseguest[]>([]);
  
  const handleFormDataChange = (field: keyof PlayerFormData, value: any) => {
    setPlayerFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatsChange = (stat: keyof HouseguestStats, value: number) => {
    if (stat === 'nominations') return;
    
    const currentValue = playerFormData.stats[stat] as number;
    const difference = value - currentValue;
    
    if (difference > 0 && playerFormData.remainingPoints < difference) {
      return;
    }
    
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
      const newTraits = selectedTraits.filter(t => t !== trait);
      const newStats = { ...stats };
      
      const boost = TRAIT_STAT_BOOSTS[trait];
      
      if (boost.primary !== 'nominations' && typeof newStats[boost.primary] === 'number') {
        newStats[boost.primary] = Math.max(1, (newStats[boost.primary] as number) - TRAIT_BOOST_VALUES.primary);
      }
      
      if (boost.secondary !== 'nominations' && typeof newStats[boost.secondary] === 'number') {
        newStats[boost.secondary] = Math.max(1, (newStats[boost.secondary] as number) - TRAIT_BOOST_VALUES.secondary);
      }
      
      handleFormDataChange('selectedTraits', newTraits);
      handleFormDataChange('stats', newStats);
    } else if (selectedTraits.length < 2) {
      const newTraits = [...selectedTraits, trait];
      const newStats = { ...stats };
      
      const boost = TRAIT_STAT_BOOSTS[trait];
      
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

  // Handle selecting a character template directly (play as this character)
  const handleTemplateSelect = (template: CharacterTemplate) => {
    setSelectedTemplate(template);
    setPlayerFormData(prev => ({
      ...prev,
      playerName: template.name,
      playerAge: template.age,
      playerOccupation: template.occupation,
      playerHometown: template.hometown,
      playerBio: template.bio,
      selectedTraits: template.traits,
      avatarUrl: template.imageUrl,
      templateId: template.id
    }));
    // Skip customization, go directly to cast review
    handlePlayerCreationWithTemplate(template);
  };

  // Handle customizing a template
  const handleTemplateCustomize = (template: CharacterTemplate) => {
    setSelectedTemplate(template);
    setPlayerFormData(prev => ({
      ...prev,
      playerName: template.name,
      playerAge: template.age,
      playerOccupation: template.occupation,
      playerHometown: template.hometown,
      playerBio: template.bio,
      selectedTraits: template.traits,
      avatarUrl: template.imageUrl,
      templateId: template.id
    }));
    setStep(2);
  };

  // Handle creating custom character (no template)
  const handleCreateCustom = () => {
    setSelectedTemplate(null);
    setPlayerFormData(prev => ({
      ...prev,
      avatarUrl: undefined,
      templateId: undefined
    }));
    setStep(2);
  };

  // Create player from template and generate NPCs
  const handlePlayerCreationWithTemplate = (template: CharacterTemplate) => {
    const playerGuest = createHouseguest(
      uuidv4(),
      template.name,
      template.age,
      template.occupation,
      template.hometown,
      template.bio,
      template.imageUrl,
      template.traits,
      {},
      true
    );

    // Get other character templates as NPCs (excluding selected one)
    const availableNPCs = characterTemplates.filter(t => t.id !== template.id);
    const shuffled = [...availableNPCs]
      .sort(() => 0.5 - Math.random())
      .slice(0, playerFormData.houseguestCount - 1);

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
        {},
        false
      )
    );

    const allHouseguests = [playerGuest, ...npcs];
    setFinalHouseguests(allHouseguests);
    setStep(3);
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
      houseguestCount,
      avatarUrl,
      avatarConfig
    } = playerFormData;
    
    const playerGuest = createHouseguest(
      uuidv4(),
      playerName,
      playerAge,
      playerOccupation,
      playerHometown,
      playerBio,
      avatarUrl || '/placeholder.svg',
      selectedTraits,
      stats,
      true,
      avatarConfig // Pass the avatar config with profilePhotoUrl
    );
    
    // Use character templates for NPCs
    const availableNPCs = selectedTemplate
      ? characterTemplates.filter(t => t.id !== selectedTemplate.id)
      : characterTemplates;
    
    const shuffled = [...availableNPCs]
      .sort(() => 0.5 - Math.random())
      .slice(0, houseguestCount - 1);
      
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
        {},
        false,
        guest.avatar3DConfig // Pass NPC avatar config too
      )
    );
    
    const allHouseguests = [playerGuest, ...npcs];
    setFinalHouseguests(allHouseguests);
    setStep(3);
  };
  
  const startGame = () => {
    dispatch({ 
      type: 'START_GAME', 
      payload: finalHouseguests
    });
    
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

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        <motion.div 
          key="step1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          <AvatarSelector
            onSelect={handleTemplateSelect}
            onCustomize={handleTemplateCustomize}
            onCreateCustom={handleCreateCustom}
          />
        </motion.div>
      ) : step === 2 ? (
        <motion.div 
          key="step2"
          className="min-h-screen bg-background relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-surveillance-pattern opacity-[0.02]" />
            <div className="absolute inset-0 bg-gradient-to-br from-bb-blue/[0.03] via-transparent to-bb-gold/[0.03]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-bb-blue/10 via-transparent to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial from-bb-gold/10 via-transparent to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative container max-w-2xl mx-auto py-8 px-4">
            <PlayerForm 
              formData={playerFormData}
              personalityTraits={personalityTraits}
              onFormDataChange={handleFormDataChange}
              onStatsChange={handleStatsChange}
              onToggleTrait={toggleTrait}
              onSubmit={handlePlayerCreation}
              onBack={() => setStep(1)}
              selectedTemplate={selectedTemplate}
              onAvatarChange={(url) => handleFormDataChange('avatarUrl', url)}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="step3"
          className="min-h-screen bg-background relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-surveillance-pattern opacity-[0.02]" />
            <div className="absolute inset-0 bg-gradient-to-br from-bb-blue/[0.03] via-transparent to-bb-gold/[0.03]" />
          </div>

          <div className="relative container max-w-4xl mx-auto py-8 px-4">
            <HouseguestList 
              finalHouseguests={finalHouseguests}
              onBack={() => setStep(selectedTemplate ? 1 : 2)}
              onStartGame={startGame}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameSetup;
