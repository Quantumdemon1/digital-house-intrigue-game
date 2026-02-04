/**
 * @file avatar-3d/index.ts
 * @description Exports for 3D avatar system
 */

// Main components
export { SimsAvatar } from './SimsAvatar';
export { AvatarCanvas } from './AvatarCanvas';
export { AvatarBody } from './AvatarBody';
export { AvatarHead } from './AvatarHead';
export { AvatarHair } from './AvatarHair';
export { AvatarClothing } from './AvatarClothing';
export { AvatarAnimations, AnimatedAvatarGroup, useAvatarAnimations } from './AvatarAnimations';

// Hooks
export { useIdleAnimation, useHeadIdleAnimation, useBlinkAnimation } from './hooks/useIdleAnimation';
export { useMoodBodyAnimation, useMoodFaceAnimation, getMoodExpression, getMouthCurve } from './hooks/useMoodAnimation';
export { useStatusAnimation, usePlayerHighlight, getStatusGlowColor, getStatusParams } from './hooks/useStatusAnimation';

// Utilities
export * from './utils/avatar-generator';
export * from './utils/color-palettes';

// Types
export type { AvatarCanvasSize } from './AvatarCanvas';
