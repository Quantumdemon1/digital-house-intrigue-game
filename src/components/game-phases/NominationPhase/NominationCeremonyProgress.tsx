
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface NominationCeremonyProgressProps {
  hohName?: string;
  isNominating?: boolean;
  ceremonyComplete?: boolean;
}

const NominationCeremonyProgress: React.FC<NominationCeremonyProgressProps> = ({ 
  hohName,
  isNominating,
  ceremonyComplete 
}) => {
  return (
    <Card className="shadow-lg border-bb-red">
      <CardHeader className="bg-bb-red text-white">
        <CardTitle>Nomination Ceremony</CardTitle>
        <CardDescription className="text-white/80">
          In progress...
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="animate-pulse">
            <Target className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-bold mt-4">Nomination Ceremony in Progress...</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {hohName} is revealing their nominations
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NominationCeremonyProgress;
