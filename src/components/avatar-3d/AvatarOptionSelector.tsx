/**
 * @file avatar-3d/AvatarOptionSelector.tsx
 * @description Visual option selector grid for avatar customization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface AvatarOptionSelectorProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  label?: string;
  getLabel?: (option: T) => string;
  getIcon?: (option: T) => React.ReactNode;
}

export function AvatarOptionSelector<T extends string>({
  options,
  value,
  onChange,
  columns = 4,
  label,
  getLabel = (option) => option.charAt(0).toUpperCase() + option.slice(1),
  getIcon
}: AvatarOptionSelectorProps<T>) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div 
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {options.map((option, index) => {
          const isSelected = value === option;
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                'relative px-3 py-2 rounded-lg text-sm font-medium',
                'transition-all duration-200',
                'border-2',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="flex flex-col items-center gap-1">
                {getIcon && (
                  <span className="text-lg">{getIcon(option)}</span>
                )}
                <span className="capitalize">{getLabel(option)}</span>
              </div>
              
              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default AvatarOptionSelector;
