
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Shield, AlertTriangle, Calendar, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Promise, PromiseStatus, PromiseType } from '@/models/promise';
import { useGame } from '@/contexts/GameContext';

interface PromiseCardProps {
  promise: Promise;
  className?: string;
}

const PromiseCard: React.FC<PromiseCardProps> = ({
  promise,
  className
}) => {
  const { gameState } = useGame();
  
  // Get houseguest names
  const fromName = gameState?.houseguests?.find(h => h.id === promise.fromId)?.name || 'Unknown';
  const toName = gameState?.houseguests?.find(h => h.id === promise.toId)?.name || 'Unknown';
  
  // Status configurations
  const statusConfig = {
    fulfilled: {
      icon: <CheckCircle size={18} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Fulfilled',
      description: 'This promise was kept'
    },
    broken: {
      icon: <XCircle size={18} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Broken',
      description: 'This promise was broken'
    },
    pending: {
      icon: <Clock size={18} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Pending',
      description: 'Waiting to be fulfilled'
    },
    active: {
      icon: <Clock size={18} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Active',
      description: 'This promise is currently active'
    },
    expired: {
      icon: <AlertTriangle size={18} />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'Expired',
      description: 'This promise is no longer relevant'
    }
  };
  
  const config = statusConfig[promise.status];
  
  // Type labels
  const typeLabels: Record<PromiseType, string> = {
    'safety': 'Safety Promise',
    'vote': 'Vote Promise',
    'final_2': 'Final 2 Deal',
    'alliance_loyalty': 'Alliance Loyalty',
    'information': 'Information Sharing'
  };
  
  // Type descriptions
  const typeDescriptions: Record<PromiseType, string> = {
    'safety': 'A promise not to nominate someone',
    'vote': 'A promise to vote in a certain way',
    'final_2': 'A promise to take someone to the final 2',
    'alliance_loyalty': 'A promise to stay loyal to an alliance',
    'information': 'A promise to share information'
  };
  
  // Impact labels
  const impactLabels: Record<string, { label: string, color: string }> = {
    'low': { label: 'Low Impact', color: 'text-green-600' },
    'medium': { label: 'Medium Impact', color: 'text-amber-600' },
    'high': { label: 'High Impact', color: 'text-red-600' }
  };
  
  const impactInfo = impactLabels[promise.impactLevel];
  
  return (
    <Card 
      className={cn(
        "border shadow-md", 
        config.borderColor, 
        config.bgColor,
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            {typeLabels[promise.type]}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn("font-medium", config.color)}
          >
            <span className="flex items-center gap-1.5">
              {config.icon}
              {config.label}
            </span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm font-medium">{promise.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <User size={16} className="text-muted-foreground" />
            <span>From: <span className="font-medium">{fromName}</span></span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <User size={16} className="text-muted-foreground" />
            <span>To: <span className="font-medium">{toName}</span></span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-muted-foreground" />
            <span>Made: Week {promise.week}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={16} className="text-muted-foreground" />
            <span>Impact: <span className={impactInfo.color}>{impactInfo.label}</span></span>
          </div>
        </div>
        
        <div className="rounded-md bg-muted p-2 text-xs">
          <p className="font-medium mb-1">{typeLabels[promise.type]}</p>
          <p className="text-muted-foreground">{typeDescriptions[promise.type]}</p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t text-xs text-muted-foreground">
        <div className="w-full flex justify-between">
          <span>ID: {promise.id.substring(0, 8)}...</span>
          <span>Updated: {new Date(promise.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PromiseCard;
