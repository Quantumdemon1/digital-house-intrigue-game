/**
 * @file src/components/deals/DealObligationBanner.tsx
 * @description Warning banner showing active deal obligations during ceremonies
 */

import React from 'react';
import { AlertTriangle, Handshake } from 'lucide-react';
import { DealObligation } from '@/hooks/useDealObligations';
import { cn } from '@/lib/utils';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { useGame } from '@/contexts/GameContext';

interface DealObligationBannerProps {
  obligations: DealObligation[];
  compact?: boolean;
  className?: string;
}

const DealObligationBanner: React.FC<DealObligationBannerProps> = ({
  obligations,
  compact = false,
  className,
}) => {
  const { gameState } = useGame();
  
  if (obligations.length === 0) return null;
  
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
        'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700',
        className
      )}>
        <Handshake className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <span className="text-amber-800 dark:text-amber-200">
          {obligations.length} active deal{obligations.length !== 1 ? 's' : ''} may be affected
        </span>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      {obligations.map((obligation, index) => {
        const partner = gameState.houseguests.find(h => h.id === obligation.partnerId);
        
        return (
          <div
            key={`${obligation.deal.id}-${index}`}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border',
              obligation.severity === 'critical' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
            )}
          >
            {/* Icon */}
            <div className={cn(
              'p-1.5 rounded-full flex-shrink-0',
              obligation.severity === 'critical'
                ? 'bg-red-100 dark:bg-red-900/40'
                : 'bg-amber-100 dark:bg-amber-900/40'
            )}>
              <AlertTriangle className={cn(
                'h-4 w-4',
                obligation.severity === 'critical'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              )} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {partner && (
                  <StatusAvatar
                    name={partner.name}
                    avatarUrl={partner.avatarUrl}
                    size="sm"
                  />
                )}
                <span className={cn(
                  'font-medium text-sm',
                  obligation.severity === 'critical'
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-amber-800 dark:text-amber-200'
                )}>
                  {obligation.warningMessage}
                </span>
              </div>
              <p className={cn(
                'text-xs',
                obligation.severity === 'critical'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-amber-700 dark:text-amber-300'
              )}>
                {obligation.consequence}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DealObligationBanner;
