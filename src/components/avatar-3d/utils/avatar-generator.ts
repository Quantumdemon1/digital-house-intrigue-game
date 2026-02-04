/**
 * @file avatar-3d/utils/avatar-generator.ts
 * @description Procedural mesh generation utilities for Sims-style avatars
 */

import * as THREE from 'three';
import { BodyType, HeightType, HeadShape, HairStyle } from '@/models/avatar-config';

// Body proportions based on type
const BODY_PROPORTIONS: Record<BodyType, { 
  torsoWidth: number; 
  torsoDepth: number; 
  shoulderWidth: number;
  armThickness: number;
  legThickness: number;
}> = {
  slim: { 
    torsoWidth: 0.22, 
    torsoDepth: 0.12, 
    shoulderWidth: 0.28,
    armThickness: 0.045,
    legThickness: 0.055
  },
  average: { 
    torsoWidth: 0.26, 
    torsoDepth: 0.14, 
    shoulderWidth: 0.32,
    armThickness: 0.05,
    legThickness: 0.065
  },
  athletic: { 
    torsoWidth: 0.28, 
    torsoDepth: 0.15, 
    shoulderWidth: 0.38,
    armThickness: 0.06,
    legThickness: 0.07
  },
  stocky: { 
    torsoWidth: 0.32, 
    torsoDepth: 0.18, 
    shoulderWidth: 0.36,
    armThickness: 0.065,
    legThickness: 0.08
  }
};

// Height multipliers
const HEIGHT_MULTIPLIERS: Record<HeightType, number> = {
  short: 0.88,
  average: 1.0,
  tall: 1.12
};

// Head shape parameters
const HEAD_SHAPES: Record<HeadShape, { 
  scaleX: number; 
  scaleY: number; 
  scaleZ: number 
}> = {
  round: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 },
  oval: { scaleX: 0.9, scaleY: 1.1, scaleZ: 0.95 },
  square: { scaleX: 1.05, scaleY: 0.95, scaleZ: 1.0 },
  heart: { scaleX: 0.95, scaleY: 1.05, scaleZ: 0.9 }
};

/**
 * Get body proportions for a given type
 */
export function getBodyProportions(bodyType: BodyType, height: HeightType) {
  const base = BODY_PROPORTIONS[bodyType];
  const heightMult = HEIGHT_MULTIPLIERS[height];
  
  return {
    ...base,
    heightMultiplier: heightMult
  };
}

/**
 * Create torso geometry - rounded capsule shape
 */
export function createTorsoGeometry(bodyType: BodyType, segments: number = 24): THREE.BufferGeometry {
  const props = BODY_PROPORTIONS[bodyType];
  
  // Create a capsule-like shape using a cylinder with sphere caps
  const geometry = new THREE.CylinderGeometry(
    props.torsoWidth * 0.9, // top radius (narrower at shoulders)
    props.torsoWidth,       // bottom radius
    0.4,                    // height
    segments,               // radial segments
    1,                      // height segments
    false                   // open ended
  );
  
  return geometry;
}

/**
 * Create arm geometry - tapered cylinder
 */
export function createArmGeometry(bodyType: BodyType, segments: number = 16): THREE.BufferGeometry {
  const props = BODY_PROPORTIONS[bodyType];
  
  const geometry = new THREE.CylinderGeometry(
    props.armThickness * 0.8, // wrist
    props.armThickness,       // shoulder
    0.35,                     // length
    segments
  );
  
  return geometry;
}

/**
 * Create leg geometry
 */
export function createLegGeometry(bodyType: BodyType, segments: number = 16): THREE.BufferGeometry {
  const props = BODY_PROPORTIONS[bodyType];
  
  const geometry = new THREE.CylinderGeometry(
    props.legThickness * 0.9, // ankle
    props.legThickness,       // hip
    0.45,                     // length
    segments
  );
  
  return geometry;
}

/**
 * Create head geometry with shape variations
 */
export function createHeadGeometry(headShape: HeadShape, segments: number = 32): THREE.BufferGeometry {
  const shape = HEAD_SHAPES[headShape];
  
  const geometry = new THREE.SphereGeometry(0.18, segments, segments);
  
  // Apply shape scaling
  geometry.scale(shape.scaleX, shape.scaleY, shape.scaleZ);
  
  return geometry;
}

/**
 * Create hand geometry - mitten style spheres
 */
export function createHandGeometry(bodyType: BodyType, segments: number = 12): THREE.BufferGeometry {
  const props = BODY_PROPORTIONS[bodyType];
  const handSize = props.armThickness * 1.3;
  
  return new THREE.SphereGeometry(handSize, segments, segments);
}

/**
 * Create foot geometry - rounded box
 */
export function createFootGeometry(bodyType: BodyType): THREE.BufferGeometry {
  const props = BODY_PROPORTIONS[bodyType];
  const footWidth = props.legThickness * 1.5;
  const footLength = props.legThickness * 2;
  
  const geometry = new THREE.BoxGeometry(footWidth, 0.05, footLength);
  geometry.translate(0, -0.025, footLength * 0.2);
  
  return geometry;
}

/**
 * Create hair geometry based on style
 */
export function createHairGeometry(hairStyle: HairStyle, headShape: HeadShape, segments: number = 24): THREE.BufferGeometry | null {
  const headParams = HEAD_SHAPES[headShape];
  const baseRadius = 0.19;
  
  switch (hairStyle) {
    case 'bald':
      return null;
      
    case 'buzz': {
      // Thin layer over head
      const geometry = new THREE.SphereGeometry(baseRadius * 1.02, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.6);
      geometry.scale(headParams.scaleX, headParams.scaleY * 0.95, headParams.scaleZ);
      return geometry;
    }
    
    case 'short': {
      // Fuller coverage
      const geometry = new THREE.SphereGeometry(baseRadius * 1.08, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.65);
      geometry.scale(headParams.scaleX * 1.05, headParams.scaleY, headParams.scaleZ * 1.05);
      return geometry;
    }
    
    case 'medium': {
      // Extends below ears
      const geometry = new THREE.SphereGeometry(baseRadius * 1.12, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.75);
      geometry.scale(headParams.scaleX * 1.08, headParams.scaleY * 1.05, headParams.scaleZ * 1.1);
      return geometry;
    }
    
    case 'long': {
      // Long flowing hair
      const geometry = new THREE.CylinderGeometry(
        baseRadius * 1.1,  // top
        baseRadius * 0.7,  // bottom (tapered)
        0.5,               // length
        segments,
        4,
        true
      );
      geometry.translate(0, -0.15, 0);
      return geometry;
    }
    
    case 'ponytail': {
      // Base + ponytail extension
      const base = new THREE.SphereGeometry(baseRadius * 1.06, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.6);
      // Note: In actual implementation, we'd combine with a tail mesh
      return base;
    }
    
    case 'bun': {
      // Base + bun on top
      const geometry = new THREE.SphereGeometry(baseRadius * 1.05, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.55);
      geometry.scale(headParams.scaleX, headParams.scaleY * 1.1, headParams.scaleZ);
      return geometry;
    }
    
    case 'curly': {
      // Voluminous curly hair
      const geometry = new THREE.SphereGeometry(baseRadius * 1.25, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.7);
      geometry.scale(headParams.scaleX * 1.15, headParams.scaleY * 1.1, headParams.scaleZ * 1.2);
      return geometry;
    }
    
    default:
      return null;
  }
}

/**
 * Create eye geometry
 */
export function createEyeGeometry(segments: number = 16): {
  eyeWhite: THREE.BufferGeometry;
  pupil: THREE.BufferGeometry;
  iris: THREE.BufferGeometry;
} {
  return {
    eyeWhite: new THREE.SphereGeometry(0.032, segments, segments),
    iris: new THREE.SphereGeometry(0.022, segments, segments),
    pupil: new THREE.SphereGeometry(0.012, segments, segments)
  };
}

/**
 * Create nose geometry
 */
export function createNoseGeometry(noseType: 'small' | 'medium' | 'large' | 'button'): THREE.BufferGeometry {
  const sizes = {
    small: { radius: 0.02, height: 0.025 },
    medium: { radius: 0.025, height: 0.03 },
    large: { radius: 0.03, height: 0.04 },
    button: { radius: 0.022, height: 0.015 }
  };
  
  const { radius, height } = sizes[noseType];
  const geometry = new THREE.ConeGeometry(radius, height, 8);
  geometry.rotateX(Math.PI / 2);
  
  return geometry;
}

/**
 * Get polygon count for LOD based on size
 */
export function getSegmentsForSize(size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full'): number {
  const segments: Record<string, number> = {
    sm: 12,
    md: 20,
    lg: 28,
    xl: 36,
    xxl: 40,
    full: 48
  };
  return segments[size] || 24;
}
