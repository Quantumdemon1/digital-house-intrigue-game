/**
 * @file src/components/social-network/StatusIcons.tsx
 * @description Custom Big Brother-themed SVG status icons for HoH, PoV, and Nominee
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

/**
 * Head of Household Icon - Golden star with "H" 
 */
export const HoHIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none">
    <defs>
      <linearGradient id="hohGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="30%" stopColor="#FFF7B0" />
        <stop offset="60%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <filter id="hohGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.5" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Crown/Star shape */}
    <path 
      d="M12 1L14.5 7.5L21.5 8.5L16.5 13.5L18 21L12 17.5L6 21L7.5 13.5L2.5 8.5L9.5 7.5L12 1Z"
      fill="url(#hohGoldGradient)"
      stroke="#8B6914"
      strokeWidth="0.75"
      filter="url(#hohGlow)"
    />
    {/* Inner crown points */}
    <path 
      d="M12 4L13.5 8L17 8.5L14.5 11L15.5 15L12 13L8.5 15L9.5 11L7 8.5L10.5 8L12 4Z"
      fill="none"
      stroke="#8B6914"
      strokeWidth="0.3"
      strokeOpacity="0.5"
    />
    {/* H letter */}
    <text 
      x="12" 
      y="13.5" 
      textAnchor="middle" 
      fontSize="6" 
      fontWeight="900" 
      fontFamily="Arial, sans-serif"
      fill="#654321"
    >
      H
    </text>
  </svg>
);

/**
 * Power of Veto Icon - Golden octagonal medallion with "V"
 */
export const PoVIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none">
    <defs>
      <radialGradient id="povVetoGradient" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FFF7B0" />
        <stop offset="40%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </radialGradient>
      <filter id="povGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.5" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Outer octagonal ring */}
    <polygon 
      points="12,1.5 18,4.5 21.5,10.5 21.5,14.5 18,19.5 12,22.5 6,19.5 2.5,14.5 2.5,10.5 6,4.5"
      fill="url(#povVetoGradient)"
      stroke="#8B6914"
      strokeWidth="0.75"
      filter="url(#povGlow)"
    />
    {/* Inner ring */}
    <polygon 
      points="12,4.5 16,6.5 18.5,11 18.5,14 16,17.5 12,19.5 8,17.5 5.5,14 5.5,11 8,6.5"
      fill="none"
      stroke="#8B6914"
      strokeWidth="0.5"
      strokeOpacity="0.4"
    />
    {/* V letter */}
    <text 
      x="12" 
      y="14" 
      textAnchor="middle" 
      fontSize="8" 
      fontWeight="900" 
      fontFamily="Arial, sans-serif"
      fill="#654321"
    >
      V
    </text>
  </svg>
);

/**
 * Nominee Icon - Red target/crosshairs
 */
export const NomineeIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none">
    <defs>
      <radialGradient id="nomineeRedGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="60%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </radialGradient>
      <filter id="nomineeGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.5" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Outer red circle */}
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      fill="url(#nomineeRedGradient)" 
      stroke="#7F1D1D"
      strokeWidth="0.5"
      filter="url(#nomineeGlow)"
    />
    {/* Middle ring */}
    <circle 
      cx="12" 
      cy="12" 
      r="6.5" 
      fill="none" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeOpacity="0.9"
    />
    {/* Inner bullseye */}
    <circle 
      cx="12" 
      cy="12" 
      r="3" 
      fill="white" 
      fillOpacity="0.95"
    />
    {/* Crosshair lines */}
    <line x1="12" y1="1" x2="12" y2="5.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" strokeLinecap="round" />
    <line x1="12" y1="18.5" x2="12" y2="23" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" strokeLinecap="round" />
    <line x1="1" y1="12" x2="5.5" y2="12" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" strokeLinecap="round" />
    <line x1="18.5" y1="12" x2="23" y2="12" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" strokeLinecap="round" />
  </svg>
);

/**
 * Player indicator - Blue star with "YOU" styling
 */
export const PlayerIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 32 16" className={cn("w-8 h-4", className)} fill="none">
    <defs>
      <linearGradient id="playerBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <rect 
      x="1" 
      y="1" 
      width="30" 
      height="14" 
      rx="7" 
      fill="url(#playerBlueGradient)"
      stroke="#1D4ED8"
      strokeWidth="0.5"
    />
    <text 
      x="16" 
      y="11" 
      textAnchor="middle" 
      fontSize="8" 
      fontWeight="800" 
      fontFamily="Arial, sans-serif"
      fill="white"
    >
      YOU
    </text>
  </svg>
);

export default { HoHIcon, PoVIcon, NomineeIcon, PlayerIcon };
