/**
 * @file ProfilePortraitCanvas.tsx
 * @description Dedicated head-focused canvas for capturing profile photos
 */

import React, { Suspense, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { cn } from '@/lib/utils';

// Lazy load the RPM avatar component
const RPMAvatar = React.lazy(() => 
  import('@readyplayerme/visage').then(mod => ({ default: mod.Avatar }))
);

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

  return (
    <div 
      style={{ width: size, height: size }} 
      className={cn('rounded-full overflow-hidden bg-gradient-to-b from-muted/50 to-muted', className)}
    >
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
      >
        {/* Lighting optimized for portraits */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 3]} intensity={0.9} />
        <directionalLight position={[-2, 1, 2]} intensity={0.4} />
        
        <Suspense fallback={null}>
          <group position={[0, -0.55, 0]}>
            <RPMAvatar 
              modelSrc={avatarUrl}
              halfBody={false}
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
