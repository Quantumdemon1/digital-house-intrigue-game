
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface GameCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'danger' | 'gold' | 'success' | 'glass';
  hoverable?: boolean;
  animated?: boolean;
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

const variantClasses = {
  default: 'bg-card/95 backdrop-blur-sm border-border/50',
  primary: 'bg-card/95 backdrop-blur-sm border-bb-blue/50 shadow-glow-primary',
  danger: 'bg-card/95 backdrop-blur-sm border-bb-red/50 shadow-glow-danger',
  gold: 'bg-card/95 backdrop-blur-sm border-bb-gold/50 shadow-glow-gold',
  success: 'bg-card/95 backdrop-blur-sm border-bb-green/50 shadow-glow-success',
  glass: 'bg-white/5 dark:bg-black/10 backdrop-blur-lg border-white/10 dark:border-white/5'
};

export const GameCard: React.FC<GameCardProps> = ({
  children,
  className,
  variant = 'default',
  hoverable = true,
  animated = true
}) => {
  const CardWrapper = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    whileHover: hoverable ? { y: -4, transition: { duration: 0.2 } } : undefined
  } : {};

  return (
    <CardWrapper
      className={cn(
        'game-card relative overflow-hidden rounded-xl border transition-all duration-300 max-w-full',
        variantClasses[variant],
        hoverable && !animated && 'hover-lift',
        className
      )}
      {...animationProps}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none" />
      <div className="relative">
        {children}
      </div>
    </CardWrapper>
  );
};

export const GameCardHeader: React.FC<GameCardHeaderProps> = ({
  children,
  className,
  variant = 'default',
  icon: Icon,
  iconClassName
}) => {
  const headerVariantClasses = {
    default: 'bg-card border-b border-border',
    primary: 'bg-gradient-to-r from-bb-blue to-bb-blue-light text-white border-0',
    danger: 'bg-gradient-to-r from-bb-red to-bb-red-light text-white border-0',
    gold: 'bg-gradient-to-r from-bb-gold to-bb-gold-light text-white border-0',
    success: 'bg-gradient-to-r from-bb-green to-bb-green-light text-white border-0'
  };

  return (
    <div className={cn('p-3 sm:p-4 md:p-6 relative overflow-hidden', headerVariantClasses[variant], className)}>
      {/* Shimmer effect for colored headers */}
      {variant !== 'default' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
      )}
      <div className="relative">
        {Icon ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              variant === 'default' ? 'bg-muted' : 'bg-white/20'
            )}>
              <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', iconClassName)} />
            </div>
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
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
  <div className={cn('game-card-footer p-3 sm:p-4 md:p-6 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap bg-muted/30', className)}>
    {children}
  </div>
);

export default GameCard;
