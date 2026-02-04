/**
 * @file ProfilePortraitCanvas.tsx
 * @description Profile photo preview and capture helper (no separate Canvas)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { User, Loader2 } from 'lucide-react';

interface ProfilePortraitPreviewProps {
  profilePhotoUrl?: string;
  isLoading?: boolean;
  size?: number;
  className?: string;
}

/**
 * Shows the captured profile photo or a placeholder
 * The actual capture is done from the main AvatarLoader canvas
 */
export const ProfilePortraitPreview: React.FC<ProfilePortraitPreviewProps> = ({
  profilePhotoUrl,
  isLoading = false,
  size = 80,
  className
}) => {
  if (isLoading) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={cn('rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/30', className)}
      >
        <Loader2 className="w-1/3 h-1/3 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (profilePhotoUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={cn('rounded-full overflow-hidden border-2 border-primary/30 shadow-lg', className)}
      >
        <img 
          src={profilePhotoUrl} 
          alt="Profile photo" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div 
      style={{ width: size, height: size }} 
      className={cn('rounded-full overflow-hidden bg-gradient-to-b from-muted/50 to-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30', className)}
    >
      <User className="w-1/3 h-1/3 text-muted-foreground/50" />
    </div>
  );
};

/**
 * Captures a head-focused screenshot from a canvas element
 * Crops to focus on the upper portion (head area)
 */
export const captureHeadPortrait = (canvas: HTMLCanvasElement): string | null => {
  try {
    const sourceWidth = canvas.width;
    const sourceHeight = canvas.height;
    
    // Focus on upper 60% of the canvas (head area in full-body view)
    const cropHeight = sourceHeight * 0.6;
    const cropWidth = sourceWidth * 0.7; // Slightly narrower for portrait
    const cropX = (sourceWidth - cropWidth) / 2;
    const cropY = sourceHeight * 0.05; // Start slightly below top
    
    // Create output canvas
    const outputSize = 256;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Fill with gradient background
    const gradient = ctx.createRadialGradient(
      outputSize / 2, outputSize / 2, 0,
      outputSize / 2, outputSize / 2, outputSize / 2
    );
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16162a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, outputSize, outputSize);
    
    // Draw cropped head region, scaled to fill output
    ctx.drawImage(
      canvas,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, outputSize, outputSize
    );
    
    return outputCanvas.toDataURL('image/webp', 0.9);
  } catch (error) {
    console.error('Failed to capture head portrait:', error);
    return null;
  }
};

export default ProfilePortraitPreview;
