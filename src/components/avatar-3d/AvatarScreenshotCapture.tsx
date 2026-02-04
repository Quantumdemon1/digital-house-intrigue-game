/**
 * @file avatar-3d/AvatarScreenshotCapture.tsx
 * @description Captures 3D avatar canvas as a profile photo
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AvatarScreenshotCaptureProps {
  canvasSelector?: string;
  onCapture: (dataUrl: string) => void;
  className?: string;
}

/**
 * Captures the Three.js canvas as a profile photo
 */
export const captureAvatarScreenshot = (
  canvas: HTMLCanvasElement,
  options?: { width?: number; height?: number; focusTop?: boolean }
): string | null => {
  try {
    const { width = 256, height = 256, focusTop = true } = options || {};
    
    // Create cropping canvas
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = width;
    cropCanvas.height = height;
    const ctx = cropCanvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Calculate crop region (square, centered, focus on upper half for face)
    const sourceSize = Math.min(canvas.width, canvas.height);
    const sx = (canvas.width - sourceSize) / 2;
    const sy = focusTop ? 0 : (canvas.height - sourceSize) / 2;
    
    // Fill with transparent background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);
    
    // Draw cropped region
    ctx.drawImage(
      canvas,
      sx, sy, sourceSize, sourceSize,  // Source crop
      0, 0, width, height               // Destination
    );
    
    return cropCanvas.toDataURL('image/webp', 0.85);
  } catch (error) {
    console.error('Failed to capture avatar screenshot:', error);
    return null;
  }
};

/**
 * Screenshot capture button with preview modal
 */
export const AvatarScreenshotCapture: React.FC<AvatarScreenshotCaptureProps> = ({
  canvasSelector = 'canvas',
  onCapture,
  className
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = useCallback(() => {
    setIsCapturing(true);
    
    // Small delay to ensure render is complete
    setTimeout(() => {
      const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;
      
      if (!canvas) {
        console.error('Canvas not found:', canvasSelector);
        setIsCapturing(false);
        return;
      }
      
      const dataUrl = captureAvatarScreenshot(canvas, { width: 256, height: 256 });
      
      if (dataUrl) {
        setPreviewUrl(dataUrl);
        setShowModal(true);
      }
      
      setIsCapturing(false);
    }, 100);
  }, [canvasSelector]);

  const handleConfirm = useCallback(() => {
    if (previewUrl) {
      onCapture(previewUrl);
    }
    setShowModal(false);
    setPreviewUrl(null);
  }, [previewUrl, onCapture]);

  const handleRetake = useCallback(() => {
    setPreviewUrl(null);
    setShowModal(false);
    // Re-capture after modal closes
    setTimeout(handleCapture, 200);
  }, [handleCapture]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPreviewUrl(null);
  }, []);

  return (
    <>
      <motion.button
        onClick={handleCapture}
        disabled={isCapturing}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-secondary text-secondary-foreground font-medium",
          "hover:bg-secondary/80 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Camera className={cn("w-4 h-4", isCapturing && "animate-pulse")} />
        {isCapturing ? 'Capturing...' : 'Take Profile Photo'}
      </motion.button>

      {/* Preview Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Profile Photo Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Photo Preview */}
            <AnimatePresence mode="wait">
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                    <img 
                      src={previewUrl} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Decorative ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" 
                       style={{ transform: 'scale(1.1)' }} />
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-sm text-muted-foreground text-center">
              This photo will be used for your profile picture in the game.
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleRetake}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              
              <Button
                variant="default"
                onClick={handleConfirm}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Use Photo
              </Button>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleCancel}
              size="sm"
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarScreenshotCapture;
