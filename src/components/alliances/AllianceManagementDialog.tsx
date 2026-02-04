/**
 * @file src/components/alliances/AllianceManagementDialog.tsx
 * @description Full alliance management interface with tabs for overview, members, and actions
 */

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Crown, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  UserPlus,
  MessageSquare,
  LogOut,
  Star
} from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Alliance } from '@/models/alliance';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AllianceMemberCard from './AllianceMemberCard';

interface AllianceManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AllianceManagementDialog: React.FC<AllianceManagementDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { game, gameState, getRelationship } = useGame();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const player = gameState.houseguests.find(h => h.isPlayer);
  
  // Get player's alliances
  const playerAlliances = useMemo(() => {
    if (!game?.allianceSystem || !player) return [];
    return game.allianceSystem.getAlliancesForHouseguest(player.id);
  }, [game?.allianceSystem, player]);
  
  // Get all active alliances (for visibility)
  const allAlliances = useMemo(() => {
    if (!game?.allianceSystem) return [];
    return game.allianceSystem.getAllActiveAlliances();
  }, [game?.allianceSystem]);
  
  const getStabilityColor = (stability: number) => {
    if (stability >= 70) return 'text-green-600 bg-green-100';
    if (stability >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };
  
  const getStabilityLabel = (stability: number) => {
    if (stability >= 80) return 'Strong';
    if (stability >= 60) return 'Stable';
    if (stability >= 40) return 'Shaky';
    return 'Critical';
  };
  
  const handleHoldMeeting = (alliance: Alliance) => {
    if (!game?.allianceSystem) return;
    
    game.allianceSystem.holdAllianceMeeting(alliance);
    toast.success(`Alliance meeting held! Stability and relationships boosted.`);
  };
  
  const handleLeaveAlliance = (alliance: Alliance) => {
    if (!game?.allianceSystem || !player) return;
    
    game.allianceSystem.removeMemberFromAlliance(
      alliance,
      player.id,
      'Left voluntarily'
    );
    toast.success(`You left "${alliance.name}"`);
  };
  
  const handleCreateAlliance = () => {
    if (game?.openAllianceProposalUI) {
      game.openAllianceProposalUI();
      onOpenChange(false);
    }
  };
  
  if (!player) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-bb-blue" />
            Alliance Management
          </DialogTitle>
          <DialogDescription>
            View and manage your alliances, hold meetings, and track stability.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {playerAlliances.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-1">No Alliances Yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Form alliances to strengthen your position in the game.
                  </p>
                  <Button onClick={handleCreateAlliance}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Alliance
                  </Button>
                </CardContent>
              </Card>
            ) : (
              playerAlliances.map(alliance => (
                <Card key={alliance.id} className="border-bb-blue/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-bb-gold" />
                        {alliance.name}
                      </CardTitle>
                      <Badge className={getStabilityColor(alliance.stability)}>
                        {getStabilityLabel(alliance.stability)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Formed Week {alliance.createdOnWeek} • {alliance.members.length} members
                      {alliance.founder.id === player.id && ' • You are the founder'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stability Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stability</span>
                        <span className={cn(
                          'font-medium',
                          alliance.stability >= 60 ? 'text-green-600' : 
                          alliance.stability >= 30 ? 'text-amber-600' : 'text-red-600'
                        )}>
                          {Math.round(alliance.stability)}%
                        </span>
                      </div>
                      <Progress 
                        value={alliance.stability} 
                        className="h-2"
                      />
                    </div>
                    
                    {/* Members Preview */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Members:</span>
                      <div className="flex -space-x-2">
                        {alliance.members.slice(0, 5).map(member => (
                          <StatusAvatar
                            key={member.id}
                            name={member.name}
                            avatarUrl={member.avatarUrl}
                            size="sm"
                            className="border-2 border-background"
                          />
                        ))}
                        {alliance.members.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                            +{alliance.members.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleHoldMeeting(alliance)}
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Hold Meeting
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSelectedTab('members')}
                      >
                        View Members
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {playerAlliances.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Join or create an alliance to see members.
              </p>
            ) : (
              playerAlliances.map(alliance => (
                <Card key={alliance.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-4 w-4 text-bb-gold" />
                      {alliance.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {alliance.members.map(member => (
                      <AllianceMemberCard
                        key={member.id}
                        member={member}
                        isFounder={member.id === alliance.founder.id}
                        isPlayer={member.id === player.id}
                        relationshipScore={
                          member.id !== player.id 
                            ? getRelationship(player.id, member.id) 
                            : undefined
                        }
                        canKick={alliance.founder.id === player.id && member.id !== player.id}
                        onKick={() => {
                          game?.allianceSystem?.removeMemberFromAlliance(
                            alliance,
                            member.id,
                            'Kicked by founder'
                          );
                          toast.success(`${member.name} was removed from the alliance`);
                        }}
                      />
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alliance Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleCreateAlliance}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Alliance
                </Button>
                
                {playerAlliances.map(alliance => (
                  <div key={alliance.id} className="space-y-2 border-t pt-3">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      {alliance.name}
                    </h4>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      size="sm"
                      onClick={() => handleHoldMeeting(alliance)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Hold Alliance Meeting (+3 relationship, +5 stability)
                    </Button>
                    
                    <Button 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLeaveAlliance(alliance)}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Alliance
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Alliance Tips */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Alliance Tips
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Hold regular meetings to maintain stability</li>
                  <li>• Keep your alliance small (3-4 members) for best stability</li>
                  <li>• High relationships between members increase stability</li>
                  <li>• Nominating an ally will damage alliance trust</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AllianceManagementDialog;
