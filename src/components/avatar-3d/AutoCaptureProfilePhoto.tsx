/**
 * @file avatar-3d/AutoCaptureProfilePhoto.tsx
 * @description Automatically captures a profile photo when avatar loads
 */

import { useEffect, useRef, useCallback } from 'react';
import { captureAvatarScreenshot } from './AvatarScreenshotCapture';

interface AutoCaptureProfilePhotoProps {
  canvasSelector: string;
  enabled: boolean;
  avatarUrl?: string;
  delay?: number;
  onCapture: (dataUrl: string) => void;
}

/**
 * AutoCaptureProfilePhoto - Invisible component that auto-captures after avatar loads
 */
export const AutoCaptureProfilePhoto: React.FC<AutoCaptureProfilePhotoProps> = ({
  canvasSelector,
  enabled,
  avatarUrl,
  delay = 2000,
  onCapture,
}) => {
  const capturedUrlRef = useRef<string | null>(null);
  const captureAttemptRef = useRef(0);

  const attemptCapture = useCallback(() => {
    const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;
    
    if (!canvas) {
      console.warn('Canvas not found for auto-capture:', canvasSelector);
      return false;
    }

    // Check if canvas has content (not just black/empty)
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const dataUrl = captureAvatarScreenshot(canvas, {
      width: 256,
      height: 256,
      focusTop: true,
      zoomFactor: 1.3, // Zoom in more for face focus
      verticalOffset: 0.05, // Offset up slightly for better head framing
    });

    if (dataUrl && dataUrl.length > 1000) { // Basic check for non-empty image
      onCapture(dataUrl);
      return true;
    }

    return false;
  }, [canvasSelector, onCapture]);

  useEffect(() => {
    if (!enabled || !avatarUrl) {
      capturedUrlRef.current = null;
      return;
    }

    // Don't re-capture for the same URL
    if (capturedUrlRef.current === avatarUrl) {
      return;
    }

    captureAttemptRef.current = 0;

    // Initial delay to let the avatar load and render
    const initialTimer = setTimeout(() => {
      const tryCapture = () => {
        if (captureAttemptRef.current >= 3) {
          console.warn('Auto-capture failed after 3 attempts');
          return;
        }

        const success = attemptCapture();
        if (success) {
          capturedUrlRef.current = avatarUrl;
        } else {
          captureAttemptRef.current++;
          // Retry after a short delay
          setTimeout(tryCapture, 500);
        }
      };

      tryCapture();
    }, delay);

    return () => clearTimeout(initialTimer);
  }, [enabled, avatarUrl, delay, attemptCapture]);

  return null; // Invisible component
};

export default AutoCaptureProfilePhoto;
