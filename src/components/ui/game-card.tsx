
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface GameCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'danger' | 'gold' | 'success' | 'glass';
  hoverable?: boolean;
}

interface GameCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'danger' | 'gold' | 'success';
  icon?: LucideIcon;
  iconClassName?: string;
}

interface GameCardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface GameCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  children,
  className,
  variant = 'default',
  hoverable = true
}) => {
  const variantClasses = {
    default: 'bg-card border-border',
    primary: 'bg-card border-bb-blue',
    danger: 'bg-card border-bb-red',
    gold: 'bg-card border-bb-gold',
    success: 'bg-card border-bb-green',
    glass: 'glass-card'
  };

  return (
    <div
      className={cn(
        'game-card relative overflow-hidden rounded-xl border transition-all duration-300 max-w-full',
        variantClasses[variant],
        hoverable && 'hover-lift',
        className
      )}
    >
      {children}
    </div>
  );
};

export const GameCardHeader: React.FC<GameCardHeaderProps> = ({
  children,
  className,
  variant = 'default',
  icon: Icon,
  iconClassName
}) => {
  const variantClasses = {
    default: 'bg-card border-b border-border',
    primary: 'game-card-header primary',
    danger: 'game-card-header danger',
    gold: 'game-card-header gold',
    success: 'game-card-header success'
  };

  return (
    <div className={cn('p-3 sm:p-4 md:p-6', variantClasses[variant], className)}>
      {Icon ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', iconClassName)} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export const GameCardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h3 className={cn('text-xl font-bold tracking-tight', className)}>
    {children}
  </h3>
);

export const GameCardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <p className={cn('text-sm opacity-80 mt-1', className)}>
    {children}
  </p>
);

export const GameCardContent: React.FC<GameCardContentProps> = ({
  children,
  className
}) => (
  <div className={cn('game-card-content p-3 sm:p-4 md:p-6', className)}>
    {children}
  </div>
);

export const GameCardFooter: React.FC<GameCardFooterProps> = ({
  children,
  className
}) => (
  <div className={cn('game-card-footer p-3 sm:p-4 md:p-6 border-t border-border flex items-center justify-between gap-2 flex-wrap', className)}>
    {children}
  </div>
);

export default GameCard;
