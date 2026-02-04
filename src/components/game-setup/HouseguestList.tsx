
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import { Camera, ArrowLeft, Play, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainer, cardVariants } from '@/lib/motion-variants';

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
  const navigate = useNavigate();
  
  const handleStartGame = () => {
    onStartGame();
    navigate('/game', { replace: true });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-amber-500/30 shadow-xl bg-card/50 backdrop-blur overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          <div className="relative flex items-center">
            <Camera className="w-8 h-8 mr-3" />
            <div>
              <CardTitle className="text-2xl font-bold">Big Brother: The Digital House</CardTitle>
              <CardDescription className="text-white/90">Season 1 Cast</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {finalHouseguests.map((guest, i) => (
              <motion.div
                key={guest.id}
                variants={cardVariants}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'flex flex-col items-center p-3 rounded-xl',
                  'bg-gradient-to-br from-slate-800/50 to-slate-900/50',
                  'border-2 transition-all duration-300',
                  guest.isPlayer 
                    ? 'border-bb-green shadow-lg shadow-bb-green/20' 
                    : 'border-amber-500/20 hover:border-amber-500/40'
                )}
              >
                {/* Avatar frame */}
                <div className="relative">
                  <div className={cn(
                    'w-20 h-20 rounded-full overflow-hidden',
                    'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
                    'p-0.5 shadow-lg'
                  )}>
                    <div className="w-full h-full rounded-full overflow-hidden ring-1 ring-amber-200/30">
                      {(() => {
                        // Get the best available avatar image
                        const avatarImage = guest.avatarConfig?.profilePhotoUrl 
                          || guest.avatarUrl 
                          || guest.imageUrl;
                        
                        return avatarImage && avatarImage !== '/placeholder.svg' ? (
                          <img
                            src={avatarImage}
                            alt={guest.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">
                              {guest.name.charAt(0)}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Player badge */}
                  {guest.isPlayer && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-bb-green text-white text-xs font-bold shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      YOU
                    </motion.div>
                  )}
                </div>

                {/* Name and info */}
                <div className="text-center mt-3">
                  <p className="font-bold text-foreground">{guest.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {guest.age} • {guest.occupation}
                  </p>
                </div>

                {/* Traits */}
                <div className="flex gap-1 mt-2 flex-wrap justify-center">
                  {guest.traits.slice(0, 2).map((trait) => (
                    <span
                      key={trait}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-amber-500/20 p-4 bg-gradient-to-r from-slate-900/50 via-transparent to-slate-900/50">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={handleStartGame} 
            variant="glow"
            size="lg"
            className="gap-2 bg-gradient-to-r from-bb-green to-emerald-500"
          >
            <Play className="w-4 h-4" />
            Enter the House
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default HouseguestList;
