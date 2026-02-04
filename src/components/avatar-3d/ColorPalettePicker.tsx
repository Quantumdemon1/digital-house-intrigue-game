/**
 * @file avatar-3d/ColorPalettePicker.tsx
 * @description Swatch-based color picker for avatar customization
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
  label,
  columns = 6
}) => {
  const config = sizeConfig[size];

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div 
        className="flex flex-wrap gap-2"
        style={{ maxWidth: `${(parseInt(config.swatch.split('-')[1]) * 4 + 8) * columns}px` }}
      >
        {colors.map((color, index) => {
          const isSelected = value === color;
          return (
            <motion.button
              key={`${color}-${index}`}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                config.swatch,
                'rounded-full relative transition-all duration-200',
                'ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
            >
              {isSelected && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <Check 
                    className={cn(
                      config.check,
                      'drop-shadow-md',
                      // Determine text color based on background brightness
                      isLightColor(color) ? 'text-gray-800' : 'text-white'
                    )} 
                  />
                </motion.div>
              )}
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-black/20 pointer-events-none" />
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
