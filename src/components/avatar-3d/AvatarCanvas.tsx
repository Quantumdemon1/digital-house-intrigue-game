/**
 * @file avatar-3d/AvatarCanvas.tsx
 * @description Canvas wrapper for 3D avatar rendering with size presets
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { cn } from '@/lib/utils';

export type AvatarCanvasSize = 'sm' | 'md' | 'lg' | 'xl';

interface SizeConfig {
  width: number;
  height: number;
  cameraZ: number;
  cameraY: number;
}

const SIZE_CONFIG: Record<AvatarCanvasSize, SizeConfig> = {
  sm: { width: 40, height: 40, cameraZ: 2.2, cameraY: 0.2 },
  md: { width: 56, height: 56, cameraZ: 2.0, cameraY: 0.25 },
  lg: { width: 80, height: 80, cameraZ: 1.8, cameraY: 0.3 },
  xl: { width: 112, height: 112, cameraZ: 1.6, cameraY: 0.35 }
};

interface AvatarCanvasProps {
  size?: AvatarCanvasSize;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Fallback component while 3D content loads
 */
const LoadingFallback: React.FC<{ size: AvatarCanvasSize }> = ({ size }) => {
  const config = SIZE_CONFIG[size];
  return (
    <div 
      className="flex items-center justify-center bg-muted/30 animate-pulse rounded-full"
      style={{ width: config.width, height: config.height }}
    >
      <div className="w-1/3 h-1/3 rounded-full bg-muted/50" />
    </div>
  );
};

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  size = 'md',
  children,
  className,
  style
}) => {
  const config = SIZE_CONFIG[size];
  
  return (
    <div 
      className={cn(
        'relative rounded-full overflow-hidden',
        'bg-gradient-to-b from-slate-800/50 to-slate-900/50',
        className
      )}
      style={{ 
        width: config.width, 
        height: config.height,
        ...style 
      }}
    >
      <Canvas
        camera={{ 
          position: [0, config.cameraY, config.cameraZ], 
          fov: 40,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AvatarCanvas;
