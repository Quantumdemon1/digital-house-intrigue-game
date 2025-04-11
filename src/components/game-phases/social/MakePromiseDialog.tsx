
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { CheckCircle, ShieldCheck, Vote, Users, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PromiseOption {
  type: string;
  description: string;
  icon: React.ReactNode;
  impact: 'low' | 'medium' | 'high';
}

interface MakePromiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  params: {
    targetId: string;
    targetName: string;
  };
}

const MakePromiseDialog: React.FC<MakePromiseDialogProps> = ({
  open,
  onOpenChange,
  params
}) => {
  const { dispatch } = useGame();
  const [selectedPromise, setSelectedPromise] = useState<string>('safety');
  const [status, setStatus] = useState<'selecting' | 'processing'>('selecting');

  const promiseOptions: PromiseOption[] = [
    {
      type: 'safety',
      description: `I promise not to nominate you next time I'm HoH.`,
      icon: <ShieldCheck />,
      impact: 'high'
    },
    {
      type: 'vote',
      description: `I promise to vote how you want this week.`,
      icon: <Vote />,
      impact: 'medium'
    },
    {
      type: 'final_2',
      description: `I promise to take you to the final 2 if I get the chance.`,
      icon: <Users />,
      impact: 'high'
    },
    {
      type: 'alliance_loyalty',
      description: `I promise to stay loyal to our alliance.`,
      icon: <Users />,
      impact: 'medium'
    },
    {
      type: 'information',
      description: `I promise to share any information I learn with you.`,
      icon: <Info />,
      impact: 'low'
    }
  ];

  const handleMakePromise = () => {
    setStatus('processing');
    
    // Find the selected promise details
    const promiseDetails = promiseOptions.find(p => p.type === selectedPromise);
    
    // Dispatch the action with promise details
    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        actionId: 'make_promise',
        params: {
          ...params,
          promiseType: selectedPromise,
          promiseDescription: promiseDetails?.description
        }
      }
    });
    
    // Close the dialog after a short delay
    setTimeout(() => {
      onOpenChange(false);
    }, 500);
  };

  const getImpactColor = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <Card className="shadow-lg border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="text-green-600" size={18} />
              Make a Promise
            </CardTitle>
            <CardDescription>
              Make a promise to {params.targetName}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4 pb-4">
            {status === 'selecting' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">What do you promise?</h3>
                  <RadioGroup 
                    value={selectedPromise} 
                    onValueChange={setSelectedPromise}
                    className="space-y-2"
                  >
                    {promiseOptions.map(option => (
                      <div key={option.type} className="flex items-center space-x-2 border rounded-md p-2">
                        <RadioGroupItem value={option.type} id={`promise-${option.type}`} />
                        <Label htmlFor={`promise-${option.type}`} className="flex-1">
                          <div className="font-medium">{option.description}</div>
                          <div className="flex items-center mt-1 text-xs">
                            <span className={`${getImpactColor(option.impact)} font-semibold mr-1`}>
                              {option.impact.toUpperCase()} IMPACT
                            </span>
                            <span className="text-muted-foreground"> - Breaking this promise will have consequences</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="text-sm text-muted-foreground border-t pt-2">
                  <p className="mb-2">
                    <span className="font-semibold">IMPORTANT:</span> Breaking promises will severely damage your relationships. Only make promises you intend to keep.
                  </p>
                  <p>
                    The game will track your promises and automatically determine if they're kept or broken based on your actions.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={handleMakePromise}
                    className="w-full"
                  >
                    Make This Promise
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p>Making promise to {params.targetName}...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default MakePromiseDialog;
