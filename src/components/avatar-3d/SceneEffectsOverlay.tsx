 /**
  * @file SceneEffectsOverlay.tsx
  * @description CSS-based visual effects overlay for 3D scenes (bloom, vignette)
  * Replaces @react-three/postprocessing due to version incompatibility
  */
 
 import React from 'react';
 import { useIsMobile } from '@/hooks/use-mobile';
 
 interface SceneEffectsOverlayProps {
   /** Enable bloom glow effect (disabled on mobile by default) */
   enableBloom?: boolean;
   /** Enable vignette darkening effect */
   enableVignette?: boolean;
   /** Bloom intensity (0-1) */
   bloomIntensity?: number;
   /** Vignette intensity (0-1) */
   vignetteIntensity?: number;
 }
 
 export const SceneEffectsOverlay: React.FC<SceneEffectsOverlayProps> = ({
   enableBloom = true,
   enableVignette = true,
   bloomIntensity = 0.35,
   vignetteIntensity = 0.4,
 }) => {
   const isMobile = useIsMobile();
   
   // Disable bloom on mobile for performance
   const showBloom = enableBloom && !isMobile;
   
   return (
     <>
       {/* Vignette effect - darkens edges */}
       {enableVignette && (
         <div
           className="absolute inset-0 pointer-events-none z-10"
           style={{
             background: `radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, ${vignetteIntensity}) 100%)`,
           }}
           aria-hidden="true"
         />
       )}
       
       {/* Bloom effect - subtle glow enhancement */}
       {showBloom && (
         <div
           className="absolute inset-0 pointer-events-none z-[5] mix-blend-screen"
           style={{
             filter: `brightness(${1 + bloomIntensity * 0.15}) contrast(${1 + bloomIntensity * 0.05})`,
             backdropFilter: `blur(${bloomIntensity * 0.5}px)`,
             opacity: bloomIntensity,
           }}
           aria-hidden="true"
         />
       )}
     </>
   );
 };
 
 export default SceneEffectsOverlay;