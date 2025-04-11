import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PersonalityTrait, TRAIT_STAT_BOOSTS } from '@/models/houseguest';
import { PlayerFormData } from './types';
import { Camera, AlertCircle, HelpCircle, Info } from 'lucide-react';
import PersonalityTraitSelector from './PersonalityTraitSelector';
import StatsSelector from './StatsSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  return <Card className="border-2 border-bb-blue shadow-lg">
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
          <Input id="name" value={playerName} onChange={e => onFormDataChange('playerName', e.target.value)} placeholder="Enter your name" className="border-bb-blue" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Age: {playerAge}</Label>
          <Slider id="age" min={21} max={60} step={1} value={[playerAge]} onValueChange={values => onFormDataChange('playerAge', values[0])} className="py-4" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hometown">Hometown</Label>
            <Input id="hometown" value={playerHometown} onChange={e => onFormDataChange('playerHometown', e.target.value)} placeholder="Your hometown" className="border-bb-blue" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input id="occupation" value={playerOccupation} onChange={e => onFormDataChange('playerOccupation', e.target.value)} placeholder="Your job" className="border-bb-blue" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Short Bio</Label>
          <Input id="bio" value={playerBio} onChange={e => onFormDataChange('playerBio', e.target.value)} placeholder="Describe yourself in a sentence..." className="border-bb-blue" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Personality Traits (Choose 2)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-muted-foreground cursor-help">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    <span>About traits</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <p>Each trait boosts specific stats:</p>
                  <ul className="text-xs mt-1 space-y-1">
                    {personalityTraits.map(trait => <li key={trait} className="flex justify-between">
                        <span className="font-medium">{trait}:</span>
                        <span>
                          +2 {TRAIT_STAT_BOOSTS[trait].primary}, 
                          +1 {TRAIT_STAT_BOOSTS[trait].secondary}
                        </span>
                      </li>)}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <PersonalityTraitSelector selectedTraits={selectedTraits} onToggleTrait={onToggleTrait} personalityTraits={personalityTraits} />
        </div>
        
        <div className="space-y-2 p-4 rounded-lg border border-gray-100 bg-slate-950">
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm text-muted-foreground">Your Stats</Label>
            <div className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-md flex items-center">
              <Info className="h-3.5 w-3.5 mr-1" />
              <span>Points remaining: {remainingPoints}</span>
            </div>
          </div>
          <StatsSelector stats={stats} onStatsChange={onStatsChange} remainingPoints={remainingPoints} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="houseguestCount">Number of Houseguests: {houseguestCount}</Label>
          <Slider id="houseguestCount" min={4} max={12} step={1} value={[houseguestCount]} onValueChange={values => onFormDataChange('houseguestCount', values[0])} className="py-4" />
          <p className="text-sm text-muted-foreground">
            You and {houseguestCount - 1} AI houseguests
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          {selectedTraits.length < 2 && <div className="flex items-center text-bb-red">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Please select 2 personality traits</span>
            </div>}
        </div>
        <Button onClick={onSubmit} disabled={!playerName || selectedTraits.length !== 2} className="bg-bb-blue hover:bg-bb-blue/90">
          Continue
        </Button>
      </CardFooter>
    </Card>;
};
export default PlayerForm;