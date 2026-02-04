import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'success' | 'gold' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  pulse?: boolean;
  glow?: boolean;
  className?: string;
  delay?: number;
}

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 15 
    } 
  },
};

const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

const variantStyles = {
  primary: 'bg-bb-blue/15 text-bb-blue border-bb-blue/30',
  danger: 'bg-bb-red/15 text-bb-red border-bb-red/30',
  success: 'bg-bb-green/15 text-bb-green border-bb-green/30',
  gold: 'bg-bb-gold/15 text-bb-gold border-bb-gold/30',
  muted: 'bg-muted text-muted-foreground border-border',
};

const glowStyles = {
  primary: 'shadow-glow-primary',
  danger: 'shadow-glow-danger',
  success: 'shadow-glow-success',
  gold: 'shadow-glow-gold',
  muted: '',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  variant = 'muted',
  size = 'md',
  icon: Icon,
  pulse = false,
  glow = false,
  className,
  delay = 0,
}) => {
  return (
    <motion.span
      className={cn(
        'inline-flex items-center rounded-full font-semibold border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        glow && glowStyles[variant],
        className
      )}
      variants={badgeVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      <motion.span
        className="inline-flex items-center gap-inherit"
        variants={pulse ? pulseVariants : undefined}
        animate={pulse ? 'pulse' : undefined}
      >
        {Icon && <Icon className={cn(
          size === 'sm' && 'w-2.5 h-2.5',
          size === 'md' && 'w-3 h-3',
          size === 'lg' && 'w-4 h-4'
        )} />}
        {children}
      </motion.span>
    </motion.span>
  );
};

export default AnimatedBadge;
