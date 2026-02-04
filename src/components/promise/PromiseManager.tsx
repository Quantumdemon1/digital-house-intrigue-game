
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Promise } from '@/models/promise';

const PromiseManager: React.FC = () => {
  const { gameState } = useGame();
  const [activePromises, setActivePromises] = useState<Promise[]>([]);
  const [expiredPromises, setExpiredPromises] = useState<Promise[]>([]);
  const [showExpiredPromises, setShowExpiredPromises] = useState(false);
  
  // Helper to get houseguest by ID from reducer state
  const getHouseguestById = (id: string) => {
    return gameState.houseguests.find(h => h.id === id);
  };
  
  useEffect(() => {
    if (!gameState?.promises) return;
    
    // Filter promises based on status
    setActivePromises(
      gameState.promises.filter(p => p.status === 'pending' || p.status === 'active')
    );
    
    setExpiredPromises(
      gameState.promises.filter(p => p.status === 'expired' || p.status === 'broken' || p.status === 'fulfilled')
    );
  }, [gameState?.promises]);
  
  if (!gameState?.promises || activePromises.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <Shield className="h-4 w-4 mr-2 text-green-500" /> Promises
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">No active promises.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md flex items-center">
            <Shield className="h-4 w-4 mr-2 text-green-500" /> Promises
          </CardTitle>
          {activePromises.length > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {activePromises.length} Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {activePromises.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No active promises.</p>
        ) : (
          <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2">
            {activePromises.map(promise => {
              const promiser = getHouseguestById(promise.fromId);
              const promisee = getHouseguestById(promise.toId);
              
              return (
                <div 
                  key={promise.id}
                  className="bg-green-50/50 border border-green-100 rounded-md p-2 text-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      {promiser?.name} → {promisee?.name}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        promise.status === 'active' ? "bg-blue-50 text-blue-700" : "bg-yellow-50 text-yellow-700"
                      )}
                    >
                      {promise.status === 'active' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{promise.description}</p>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Section for expired/completed promises */}
        {expiredPromises.length > 0 && (
          <div className="pt-1 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowExpiredPromises(!showExpiredPromises)}
              className="w-full justify-center text-xs h-8"
            >
              {showExpiredPromises ? (
                <span className="flex items-center text-muted-foreground">
                  <X className="h-3 w-3 mr-1" /> Hide completed promises
                </span>
              ) : (
                <span className="flex items-center text-muted-foreground">
                  <Check className="h-3 w-3 mr-1" /> Show completed promises ({expiredPromises.length})
                </span>
              )}
            </Button>
            
            {showExpiredPromises && (
              <div className="max-h-[120px] overflow-y-auto mt-2 space-y-2">
                {expiredPromises.map(promise => {
                  const promiser = getHouseguestById(promise.fromId);
                  const promisee = getHouseguestById(promise.toId);
                  
                  return (
                    <div 
                      key={promise.id}
                      className={cn(
                        "border rounded-md p-2 text-sm",
                        promise.status === 'fulfilled' ? 
                          "bg-green-50/30 border-green-100" : 
                          "bg-red-50/30 border-red-100"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                          {promiser?.name} → {promisee?.name}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            promise.status === 'fulfilled' ? 
                              "bg-green-50 text-green-700" : 
                              promise.status === 'broken' ? 
                                "bg-red-50 text-red-700" : 
                                "bg-gray-50 text-gray-700"
                          )}
                        >
                          {promise.status.charAt(0).toUpperCase() + promise.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{promise.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromiseManager;
