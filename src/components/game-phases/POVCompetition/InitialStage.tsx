
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Houseguest } from '@/models/houseguest';

interface InitialStageProps {
  povPlayers: Houseguest[];
  week: number;
  startCompetition: () => void;
  nominees: Houseguest[];
  hoh: Houseguest | null;
}

const InitialStage: React.FC<InitialStageProps> = ({ 
  povPlayers, 
  week, 
  startCompetition,
  nominees,
  hoh
}) => {
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2" /> Power of Veto Competition
          </CardTitle>
          <Badge variant="outline" className="bg-white/10">
            {povPlayers.length} Competitors
          </Badge>
        </div>
        <CardDescription className="text-white/80">
          Week {week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Competition Time</h3>
          <p>
            The Power of Veto competition is ready to begin. Six houseguests will compete,
            and the winner will have the power to save one of the nominees from eviction.
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">PoV Competitors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-muted/20 p-4 rounded-lg">
            {povPlayers.map(player => (
              <div key={player.id} className="flex items-center gap-2 bg-white/10 p-2 rounded-md">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                  {player.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{player.name}</span>
                  <span className="text-xs opacity-70">
                    {player.id === hoh?.id ? "HoH" : 
                     nominees.some(n => n.id === player.id) ? "Nominee" : 
                     "Random Draw"}
                  </span>
                </div>
                {player.isPlayer && <span className="text-xs text-green-400 ml-1">(You)</span>}
              </div>
            ))}
            
            {/* Show placeholder cards if less than 6 competitors */}
            {Array.from({ length: Math.max(0, 6 - povPlayers.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-2 bg-white/5 p-2 rounded-md opacity-50">
                <div className="w-8 h-8 rounded-full bg-gray-300/30 flex items-center justify-center text-gray-400">
                  ?
                </div>
                <span className="text-sm">Not Selected</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 bg-[#005a9a]">
        <div className="w-full">
          <Button 
            onClick={startCompetition} 
            disabled={povPlayers.length === 0} 
            className="w-full"
          >
            Start Power of Veto Competition
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InitialStage;
