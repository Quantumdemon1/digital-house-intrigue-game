/**
 * @file ProfilePortraitCanvas.tsx
 * @description Dedicated head-focused canvas for capturing profile photos
 */

import React, { Suspense, useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avatar } from '@readyplayerme/visage';
import { cn } from '@/lib/utils';
import { User, Loader2 } from 'lucide-react';

// Camera settings optimized for head portrait
const PORTRAIT_CAMERA = {
  position: [0, 0.6, 1.3] as [number, number, number],
  fov: 25
};

export interface ProfilePortraitCanvasRef {
  capture: () => string | null;
}

interface ProfilePortraitCanvasProps {
  avatarUrl: string;
  size?: number;
  className?: string;
}

export const ProfilePortraitCanvas = forwardRef<ProfilePortraitCanvasRef, ProfilePortraitCanvasProps>(({
  avatarUrl,
  size = 128,
  className
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset states when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Set loaded after a delay to allow model to render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [avatarUrl]);

  // Expose capture function to parent
  useImperativeHandle(ref, () => ({
    capture: () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.warn('Portrait canvas not found for capture');
        return null;
      }
      
      try {
        const dataUrl = canvas.toDataURL('image/webp', 0.9);
        return dataUrl;
      } catch (error) {
        console.error('Failed to capture portrait:', error);
        return null;
      }
    }
  }), []);

  if (hasError) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={cn('rounded-full overflow-hidden bg-muted flex items-center justify-center', className)}
      >
        <User className="w-1/3 h-1/3 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div 
      style={{ width: size, height: size }} 
      className={cn('rounded-full overflow-hidden bg-gradient-to-b from-muted/50 to-muted relative', className)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      <Canvas
        ref={canvasRef}
        camera={{
          position: PORTRAIT_CAMERA.position,
          fov: PORTRAIT_CAMERA.fov,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true
        }}
        style={{ background: 'transparent' }}
        onCreated={() => {
          // Canvas created successfully
        }}
      >
        {/* Lighting optimized for portraits */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 3]} intensity={0.9} />
        <directionalLight position={[-2, 1, 2]} intensity={0.4} />
        
        <Suspense fallback={null}>
          <group position={[0, -0.55, 0]}>
            <Avatar 
              modelSrc={avatarUrl}
              halfBody={false}
              onLoaded={() => setIsLoading(false)}
            />
          </group>
        </Suspense>
        
        {/* Disable controls for static portrait view */}
        <OrbitControls enabled={false} />
      </Canvas>
    </div>
  );
});

ProfilePortraitCanvas.displayName = 'ProfilePortraitCanvas';

export default ProfilePortraitCanvas;
