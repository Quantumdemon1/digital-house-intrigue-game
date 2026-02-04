/**
 * @file avatar-3d/ColorPalettePicker.tsx
 * @description Sims-style swatch-based color picker for avatar customization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorPalettePickerProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  columns?: number;
}

const sizeConfig = {
  sm: { swatch: 'w-6 h-6', check: 'w-3 h-3' },
  md: { swatch: 'w-8 h-8', check: 'w-4 h-4' },
  lg: { swatch: 'w-10 h-10', check: 'w-5 h-5' }
};

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  colors,
  value,
  onChange,
  size = 'md',
  label
}) => {
  const config = sizeConfig[size];

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => {
          const isSelected = value === color;
          return (
            <motion.button
              key={`${color}-${index}`}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                config.swatch,
                'sims-swatch',
                isSelected && 'selected'
              )}
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.02,
                type: 'spring',
                stiffness: 400,
                damping: 20
              }}
            >
              {isSelected && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check 
                    className={cn(
                      config.check,
                      'drop-shadow-lg',
                      isLightColor(color) ? 'text-gray-800' : 'text-white'
                    )} 
                    strokeWidth={3}
                  />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// Helper to determine if a color is light or dark
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export default ColorPalettePicker;
