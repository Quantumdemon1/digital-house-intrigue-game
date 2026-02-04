import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PersonalityTrait, TRAIT_STAT_BOOSTS } from '@/models/houseguest';
import { PlayerFormData } from './types';
import { Camera, AlertCircle, HelpCircle, Info, Sparkles, ArrowRight } from 'lucide-react';
import PersonalityTraitSelector from './PersonalityTraitSelector';
import StatsSelector from './StatsSelector';
import AvatarPreview from './AvatarPreview';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GameCard, GameCardHeader, GameCardTitle, GameCardDescription, GameCardContent, GameCardFooter } from '@/components/ui/game-card';

interface PlayerFormProps {
  formData: PlayerFormData;
  personalityTraits: PersonalityTrait[];
  onFormDataChange: (field: keyof PlayerFormData, value: any) => void;
  onStatsChange: (stat: keyof PlayerFormData["stats"], value: number) => void;
  onToggleTrait: (trait: PersonalityTrait) => void;
  onSubmit: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({
  formData,
  personalityTraits,
  onFormDataChange,
  onStatsChange,
  onToggleTrait,
  onSubmit
}) => {
  const {
    playerName,
    playerAge,
    playerBio,
    playerHometown,
    playerOccupation,
    selectedTraits,
    houseguestCount,
    stats,
    remainingPoints
  } = formData;

  return (
    <GameCard variant="primary" className="border-2" hoverable={false}>
      <GameCardHeader variant="primary" icon={Camera}>
        <GameCardTitle className="text-xl sm:text-2xl">Big Brother: The Digital House</GameCardTitle>
        <GameCardDescription className="text-white/80">Create Your Houseguest</GameCardDescription>
      </GameCardHeader>
      
      <GameCardContent className="space-y-6">
        {/* Two column layout on larger screens */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left column: Form fields */}
          <div className="space-y-5">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="name" className="text-sm font-semibold">Your Name</Label>
              <Input 
                id="name" 
                value={playerName} 
                onChange={e => onFormDataChange('playerName', e.target.value)} 
                placeholder="Enter your houseguest name" 
                className="bg-background/50 border-border/50 focus:border-primary transition-colors"
              />
            </motion.div>
            
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Label htmlFor="age" className="flex justify-between">
                <span>Age</span>
                <span className="text-muted-foreground">{playerAge}</span>
              </Label>
              <Slider 
                id="age" 
                min={21} 
                max={60} 
                step={1} 
                value={[playerAge]} 
                onValueChange={values => onFormDataChange('playerAge', values[0])} 
                className="py-2"
              />
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-2">
                <Label htmlFor="hometown">Hometown</Label>
                <Input 
                  id="hometown" 
                  value={playerHometown} 
                  onChange={e => onFormDataChange('playerHometown', e.target.value)} 
                  placeholder="Your hometown" 
                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input 
                  id="occupation" 
                  value={playerOccupation} 
                  onChange={e => onFormDataChange('playerOccupation', e.target.value)} 
                  placeholder="Your job" 
                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Label htmlFor="bio">Short Bio</Label>
              <Input 
                id="bio" 
                value={playerBio} 
                onChange={e => onFormDataChange('playerBio', e.target.value)} 
                placeholder="Describe yourself in a sentence..." 
                className="bg-background/50 border-border/50 focus:border-primary transition-colors"
              />
            </motion.div>
          </div>
          
          {/* Right column: Avatar Preview */}
          <motion.div 
            className="flex items-center justify-center lg:border-l lg:pl-6 border-border/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AvatarPreview formData={formData} />
          </motion.div>
        </div>
        
        {/* Personality Traits */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold">Personality Traits (Choose 2)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-muted-foreground cursor-help hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    <span>About traits</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-md glass-card">
                  <p className="font-semibold mb-2">Each trait boosts specific stats:</p>
                  <ul className="text-xs space-y-1">
                    {personalityTraits.slice(0, 6).map(trait => (
                      <li key={trait} className="flex justify-between gap-4">
                        <span className="font-medium">{trait}:</span>
                        <span className="text-muted-foreground">
                          +2 {TRAIT_STAT_BOOSTS[trait].primary}, +1 {TRAIT_STAT_BOOSTS[trait].secondary}
                        </span>
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <PersonalityTraitSelector 
            selectedTraits={selectedTraits} 
            onToggleTrait={onToggleTrait} 
            personalityTraits={personalityTraits} 
          />
        </motion.div>
        
        {/* Stats */}
        <motion.div 
          className="space-y-3 p-4 rounded-xl border border-border/30 bg-muted/30 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-semibold">Your Stats</Label>
            <motion.div 
              className="text-sm px-3 py-1.5 bg-primary/10 text-primary rounded-full flex items-center gap-1.5 font-medium"
              animate={{ scale: remainingPoints > 0 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Points: {remainingPoints}</span>
            </motion.div>
          </div>
          <StatsSelector stats={stats} onStatsChange={onStatsChange} remainingPoints={remainingPoints} />
        </motion.div>
        
        {/* Houseguest Count */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Label htmlFor="houseguestCount" className="flex justify-between">
            <span>Number of Houseguests</span>
            <span className="text-muted-foreground">{houseguestCount}</span>
          </Label>
          <Slider 
            id="houseguestCount" 
            min={4} 
            max={12} 
            step={1} 
            value={[houseguestCount]} 
            onValueChange={values => onFormDataChange('houseguestCount', values[0])} 
            className="py-2"
          />
          <p className="text-sm text-muted-foreground">
            You and {houseguestCount - 1} AI houseguests will compete for the grand prize
          </p>
        </motion.div>
      </GameCardContent>
      
      <GameCardFooter>
        <div className="text-sm text-muted-foreground">
          {selectedTraits.length < 2 && (
            <motion.div 
              className="flex items-center text-bb-red"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Please select 2 personality traits</span>
            </motion.div>
          )}
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={!playerName || selectedTraits.length !== 2} 
          variant="dramatic"
          size="lg"
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Enter the House
          <ArrowRight className="w-4 h-4" />
        </Button>
      </GameCardFooter>
    </GameCard>
  );
};

export default PlayerForm;
