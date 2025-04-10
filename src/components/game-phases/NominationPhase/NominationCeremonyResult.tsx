
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';

interface NominationCeremonyResultProps {
  nominees: Houseguest[];
  hoh?: Houseguest | null;
  onContinue?: () => void;
}

const NominationCeremonyResult: React.FC<NominationCeremonyResultProps> = ({
  nominees,
  hoh,
  onContinue
}) => {
  return (
    <Card className="shadow-lg border-bb-red">
      <CardHeader className="bg-bb-red text-white">
        <CardTitle>Nomination Ceremony</CardTitle>
        <CardDescription className="text-white/80">
          Complete
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 rounded-full p-2 mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold">Nomination Ceremony Complete</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4 text-center">
            {hoh?.name} has nominated:
          </p>
          
          <div className="grid gap-2 text-center">
            {nominees.map((nominee, index) => (
              <div key={nominee.id} className="font-semibold text-lg">
                {nominee.name}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground mt-4 text-center">
            These houseguests will compete in the Power of Veto competition for a chance to save themselves.
          </div>
          
          {onContinue && (
            <Button 
              onClick={onContinue} 
              className="mt-6 bg-bb-red hover:bg-bb-red/90"
            >
              Continue to Power of Veto
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NominationCeremonyResult;
