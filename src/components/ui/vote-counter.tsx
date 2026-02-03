
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VoteCounterProps {
  count: number;
  maxVotes?: number;
  label?: string;
  variant?: 'default' | 'danger' | 'success';
  className?: string;
  animate?: boolean;
}

export const VoteCounter: React.FC<VoteCounterProps> = ({
  count,
  maxVotes,
  label,
  variant = 'default',
  className,
  animate = true
}) => {
  const [displayCount, setDisplayCount] = useState(animate ? 0 : count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!animate) {
      setDisplayCount(count);
      return;
    }

    if (count !== displayCount) {
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setTimeout(() => setIsAnimating(false), 300);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [count, displayCount, animate]);

  const variantClasses = {
    default: 'text-foreground',
    danger: 'text-bb-red',
    success: 'text-bb-green'
  };

  return (
    <div className={cn('vote-counter flex flex-col items-center', className)}>
      <div 
        className={cn(
          'vote-counter-number font-display',
          variantClasses[variant],
          isAnimating && 'animating'
        )}
      >
        {displayCount}
      </div>
      {maxVotes !== undefined && (
        <div className="text-sm text-muted-foreground mt-1">
          of {maxVotes} votes
        </div>
      )}
      {label && (
        <div className="text-sm font-medium mt-2">
          {label}
        </div>
      )}
    </div>
  );
};

// Versus display for eviction votes
interface VersusVoteDisplayProps {
  nominee1: {
    name: string;
    votes: number;
  };
  nominee2: {
    name: string;
    votes: number;
  };
  totalVotes: number;
  className?: string;
}

export const VersusVoteDisplay: React.FC<VersusVoteDisplayProps> = ({
  nominee1,
  nominee2,
  totalVotes,
  className
}) => {
  const nominee1Percent = totalVotes > 0 ? (nominee1.votes / totalVotes) * 100 : 50;
  const nominee2Percent = totalVotes > 0 ? (nominee2.votes / totalVotes) * 100 : 50;

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex justify-between items-end">
        <div className="text-center">
          <VoteCounter 
            count={nominee1.votes} 
            variant={nominee1.votes > nominee2.votes ? 'danger' : 'default'}
          />
          <div className="font-semibold mt-2">{nominee1.name}</div>
        </div>
        
        <div className="font-display text-2xl text-muted-foreground px-4">
          VS
        </div>
        
        <div className="text-center">
          <VoteCounter 
            count={nominee2.votes} 
            variant={nominee2.votes > nominee1.votes ? 'danger' : 'default'}
          />
          <div className="font-semibold mt-2">{nominee2.name}</div>
        </div>
      </div>

      {/* Vote bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-bb-red transition-all duration-500 ease-out"
          style={{ width: `${nominee1Percent}%` }}
        />
        <div 
          className="absolute right-0 top-0 h-full bg-bb-blue transition-all duration-500 ease-out"
          style={{ width: `${nominee2Percent}%` }}
        />
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-background -translate-x-1/2" />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
      </div>
    </div>
  );
};

export default VoteCounter;
