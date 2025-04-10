
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { Camera } from 'lucide-react';

interface HouseguestListProps {
  finalHouseguests: Houseguest[];
  onBack: () => void;
  onStartGame: () => void;
}

const HouseguestList: React.FC<HouseguestListProps> = ({ 
  finalHouseguests,
  onBack,
  onStartGame
}) => {
  return (
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
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={onStartGame} 
          className="bg-bb-green hover:bg-bb-green/90 text-bb-dark"
        >
          Enter the House
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HouseguestList;
