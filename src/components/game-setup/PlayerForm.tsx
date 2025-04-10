
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PersonalityTrait } from '@/models/houseguest';
import { PlayerFormData } from './types';
import { Camera, AlertCircle } from 'lucide-react';
import PersonalityTraitSelector from './PersonalityTraitSelector';
import StatsSelector from './StatsSelector';

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
    stats 
  } = formData;

  return (
    <Card className="border-2 border-bb-blue shadow-lg">
      <CardHeader className="bg-bb-blue text-white">
        <div className="flex items-center">
          <Camera className="w-8 h-8 mr-2" />
          <div>
            <CardTitle className="text-2xl">Big Brother: The Digital House</CardTitle>
            <CardDescription className="text-white/80">Create Your Player</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input 
            id="name" 
            value={playerName} 
            onChange={e => onFormDataChange('playerName', e.target.value)} 
            placeholder="Enter your name"
            className="border-bb-blue"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Age: {playerAge}</Label>
          <Slider 
            id="age" 
            min={21} 
            max={60} 
            step={1} 
            value={[playerAge]} 
            onValueChange={values => onFormDataChange('playerAge', values[0])} 
            className="py-4"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hometown">Hometown</Label>
            <Input 
              id="hometown" 
              value={playerHometown} 
              onChange={e => onFormDataChange('playerHometown', e.target.value)} 
              placeholder="Your hometown"
              className="border-bb-blue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input 
              id="occupation" 
              value={playerOccupation} 
              onChange={e => onFormDataChange('playerOccupation', e.target.value)} 
              placeholder="Your job"
              className="border-bb-blue"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Short Bio</Label>
          <Input 
            id="bio" 
            value={playerBio} 
            onChange={e => onFormDataChange('playerBio', e.target.value)} 
            placeholder="Describe yourself in a sentence..."
            className="border-bb-blue"
          />
        </div>
        
        <PersonalityTraitSelector
          selectedTraits={selectedTraits}
          onToggleTrait={onToggleTrait}
          personalityTraits={personalityTraits}
        />
        
        <StatsSelector 
          stats={stats} 
          onStatsChange={onStatsChange} 
        />
        
        <div className="space-y-2">
          <Label htmlFor="houseguestCount">Number of Houseguests: {houseguestCount}</Label>
          <Slider 
            id="houseguestCount" 
            min={4} 
            max={12} 
            step={1} 
            value={[houseguestCount]} 
            onValueChange={values => onFormDataChange('houseguestCount', values[0])} 
            className="py-4"
          />
          <p className="text-sm text-muted-foreground">
            You and {houseguestCount - 1} AI houseguests
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          {selectedTraits.length < 2 && (
            <div className="flex items-center text-bb-red">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Please select 2 personality traits</span>
            </div>
          )}
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={!playerName || selectedTraits.length !== 2}
          className="bg-bb-blue hover:bg-bb-blue/90"
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlayerForm;
