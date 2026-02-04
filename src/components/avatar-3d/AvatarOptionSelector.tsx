/**
 * @file avatar-3d/AvatarOptionSelector.tsx
 * @description Sims-style visual option selector grid for avatar customization
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
    <div className="space-y-3">
      {label && (
        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
      )}
      <div 
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {options.map((option, index) => {
          const isSelected = value === option;
          const icon = getIcon?.(option);
          
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                'sims-option-card',
                isSelected && 'selected'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {/* Icon/Silhouette */}
              {icon && (
                <div className={cn(
                  "text-white/60 mb-1 transition-colors",
                  isSelected && "text-emerald-400"
                )}>
                  {icon}
                </div>
              )}
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium capitalize transition-colors",
                isSelected ? "text-emerald-400" : "text-white/70"
              )}>
                {getLabel(option)}
              </span>
              
              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="w-3 h-3 text-white" />
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
