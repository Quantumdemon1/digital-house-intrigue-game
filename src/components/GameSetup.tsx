
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Houseguest, PersonalityTrait, createHouseguest, HouseguestStats } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { v4 as uuidv4 } from 'uuid';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';

// Default houseguests for the game
const defaultHouseguests: Omit<Houseguest, 'id' | 'stats' | 'status' | 'isPlayer' | 'isHoH' | 'isPovHolder' | 'isNominated' | 'nominations' | 'competitionsWon'>[] = [
  {
    name: 'Alex Chen',
    age: 28,
    occupation: 'Marketing Executive',
    hometown: 'San Francisco, CA',
    bio: 'Strategic player who excels at social manipulation.',
    imageUrl: '/placeholder.svg',
    traits: ['Strategic', 'Social'],
  },
  {
    name: 'Morgan Lee',
    age: 26,
    occupation: 'Personal Trainer',
    hometown: 'Miami, FL',
    bio: 'Physical competitor who forms genuine alliances.',
    imageUrl: '/placeholder.svg',
    traits: ['Competitive', 'Loyal'],
  },
  {
    name: 'Jordan Taylor',
    age: 31,
    occupation: 'Sales Representative',
    hometown: 'Chicago, IL',
    bio: 'Charismatic and cunning, will do anything to win.',
    imageUrl: '/placeholder.svg',
    traits: ['Social', 'Sneaky'],
  },
  {
    name: 'Casey Wilson',
    age: 24,
    occupation: 'Bartender',
    hometown: 'New Orleans, LA',
    bio: 'Party-loving socialite with a surprising strategic mind.',
    imageUrl: '/placeholder.svg',
    traits: ['Social', 'Strategic'],
  },
  {
    name: 'Riley Johnson',
    age: 29,
    occupation: 'Software Engineer',
    hometown: 'Seattle, WA',
    bio: 'Analytical thinker who struggles with social game.',
    imageUrl: '/placeholder.svg',
    traits: ['Analytical', 'Strategic'],
  },
  {
    name: 'Jamie Roberts',
    age: 27,
    occupation: 'Nurse',
    hometown: 'Boston, MA',
    bio: 'Empathetic but not afraid to make big moves.',
    imageUrl: '/placeholder.svg',
    traits: ['Emotional', 'Strategic'],
  },
  {
    name: 'Quinn Martinez',
    age: 25,
    occupation: 'Social Media Influencer',
    hometown: 'Los Angeles, CA',
    bio: 'Fame-seeking and manipulative, plays for the cameras.',
    imageUrl: '/placeholder.svg',
    traits: ['Confrontational', 'Social'],
  },
  {
    name: 'Avery Thompson',
    age: 32,
    occupation: 'Police Officer',
    hometown: 'Dallas, TX',
    bio: 'Strong-willed and straightforward, values loyalty.',
    imageUrl: '/placeholder.svg',
    traits: ['Loyal', 'Competitive'],
  },
  {
    name: 'Taylor Kim',
    age: 27,
    occupation: 'Fitness Instructor',
    hometown: 'Portland, OR',
    bio: 'Competitive and disciplined, but has a short temper.',
    imageUrl: '/placeholder.svg',
    traits: ['Competitive', 'Confrontational'],
  },
  {
    name: 'Sam Williams',
    age: 34,
    occupation: 'Restaurant Owner',
    hometown: 'Nashville, TN',
    bio: 'Charismatic leader who builds strong alliances.',
    imageUrl: '/placeholder.svg',
    traits: ['Strategic', 'Loyal'],
  },
  {
    name: 'Blake Peterson',
    age: 26,
    occupation: 'Architect',
    hometown: 'Denver, CO',
    bio: 'Quiet observer who strikes at the perfect moment.',
    imageUrl: '/placeholder.svg',
    traits: ['Analytical', 'Sneaky'],
  },
];

const personalityTraits: PersonalityTrait[] = [
  'Strategic', 'Social', 'Competitive', 'Loyal',
  'Sneaky', 'Confrontational', 'Emotional', 'Analytical'
];

const GameSetup: React.FC = () => {
  const { dispatch } = useGame();
  const [step, setStep] = useState<1 | 2>(1);
  const [playerName, setPlayerName] = useState('');
  const [playerAge, setPlayerAge] = useState(25);
  const [playerBio, setPlayerBio] = useState('');
  const [playerHometown, setHometown] = useState('');
  const [playerOccupation, setOccupation] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<PersonalityTrait[]>([]);
  const [stats, setStats] = useState<HouseguestStats>({
    physical: 5,
    mental: 5,
    endurance: 5,
    social: 5,
    luck: 5,
  });
  const [finalHouseguests, setFinalHouseguests] = useState<Houseguest[]>([]);
  const [houseguestCount, setHouseguestCount] = useState(8);
  
  const handlePlayerCreation = () => {
    if (!playerName) return;
    
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
        {}, // random stats
        false // isPlayer = false
      )
    );
    
    // Combine player with NPCs
    const allHouseguests = [playerGuest, ...npcs];
    setFinalHouseguests(allHouseguests);
    setStep(2);
  };
  
  const startGame = () => {
    dispatch({ type: 'START_GAME', payload: finalHouseguests });
    
    // Log the start game event
    dispatch({ 
      type: 'LOG_EVENT', 
      payload: {
        week: 1,
        phase: 'Setup',
        type: 'GAME_START',
        description: `${playerName} and ${houseguestCount - 1} other houseguests entered the Big Brother house.`,
        involvedHouseguests: finalHouseguests.map(guest => guest.id),
      }
    });
  };

  const toggleTrait = (trait: PersonalityTrait) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else if (selectedTraits.length < 2) {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  if (step === 1) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
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
                onChange={e => setPlayerName(e.target.value)} 
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
                onValueChange={values => setPlayerAge(values[0])} 
                className="py-4"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hometown">Hometown</Label>
                <Input 
                  id="hometown" 
                  value={playerHometown} 
                  onChange={e => setHometown(e.target.value)} 
                  placeholder="Your hometown"
                  className="border-bb-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input 
                  id="occupation" 
                  value={playerOccupation} 
                  onChange={e => setOccupation(e.target.value)} 
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
                onChange={e => setPlayerBio(e.target.value)} 
                placeholder="Describe yourself in a sentence..."
                className="border-bb-blue"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Personality Traits (Choose 2)</Label>
              <div className="grid grid-cols-2 gap-2">
                {personalityTraits.map(trait => (
                  <Button
                    key={trait}
                    variant={selectedTraits.includes(trait) ? "default" : "outline"}
                    className={selectedTraits.includes(trait) ? "bg-bb-blue" : ""}
                    onClick={() => toggleTrait(trait)}
                  >
                    {trait}
                    {selectedTraits.includes(trait) && (
                      <CheckCircle className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Your Stats</Label>
              
              {(Object.keys(stats) as Array<keyof HouseguestStats>).map(stat => (
                <div key={stat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{stat}</span>
                    <span className="font-medium">{stats[stat]}/10</span>
                  </div>
                  <Slider 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={[stats[stat]]} 
                    onValueChange={values => {
                      setStats({...stats, [stat]: values[0]});
                    }} 
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="houseguestCount">Number of Houseguests: {houseguestCount}</Label>
              <Slider 
                id="houseguestCount" 
                min={4} 
                max={12} 
                step={1} 
                value={[houseguestCount]} 
                onValueChange={values => setHouseguestCount(values[0])} 
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
              onClick={handlePlayerCreation} 
              disabled={!playerName || selectedTraits.length !== 2}
              className="bg-bb-blue hover:bg-bb-blue/90"
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="border-2 border-bb-blue shadow-lg">
        <CardHeader className="bg-bb-blue text-white">
          <div className="flex items-center">
            <Camera className="w-8 h-8 mr-2" />
            <div>
              <CardTitle className="text-2xl">Big Brother: The Digital House</CardTitle>
              <CardDescription className="text-white/80">Season 1 Cast</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {finalHouseguests.map((guest) => (
              <div key={guest.id} className="flex flex-col items-center p-2 border rounded-lg">
                <div className={`camera-lens w-20 h-20 mb-2 ${guest.isPlayer ? 'border-bb-green' : ''}`}>
                  <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700">
                    {guest.name.charAt(0)}
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold">{guest.name} {guest.isPlayer && '(You)'}</p>
                  <p className="text-xs text-gray-500">{guest.age} • {guest.occupation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
          >
            Back
          </Button>
          <Button 
            onClick={startGame} 
            className="bg-bb-green hover:bg-bb-green/90 text-bb-dark"
          >
            Enter the House
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameSetup;
