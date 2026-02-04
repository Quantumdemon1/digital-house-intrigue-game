/**
 * @file avatar-3d/index.ts
 * @description Exports for 3D avatar system (RPM-only)
 */

// Main components
export { SimsAvatar } from './SimsAvatar';
export { AvatarCanvas } from './AvatarCanvas';
export { AvatarCustomizer } from './AvatarCustomizer';
export { ColorPalettePicker } from './ColorPalettePicker';
export { AvatarOptionSelector } from './AvatarOptionSelector';
export * from './SimsIcons';

// Ready Player Me components
export { AvatarLoader, AvatarSkeleton, preloadAvatar } from './AvatarLoader';
export type { AvatarSize } from './AvatarLoader';

// RPM Creator components
export { RPMAvatarCreator } from './RPMAvatarCreator';
export { RPMAvatarCreatorPanel } from './RPMAvatarCreatorPanel';
export { RPMAvatarGallery } from './RPMAvatarGallery';
export { RPMAvatar } from './RPMAvatar';

// Thumbnail and screenshot utilities
export { AvatarThumbnail, captureAvatarThumbnail, ThumbnailCapture, useAvatarThumbnail } from './AvatarThumbnail';
export { AvatarScreenshotCapture, captureAvatarScreenshot } from './AvatarScreenshotCapture';
export { AvatarProfilePicture } from './AvatarProfilePicture';

// Body parts (for legacy/Sims avatar)
export { AvatarBody } from './AvatarBody';
export { AvatarHead } from './AvatarHead';
export { AvatarHair } from './AvatarHair';
export { AvatarClothing } from './AvatarClothing';
export { AvatarAnimations, AnimatedAvatarGroup, useAvatarAnimations } from './AvatarAnimations';

// Hooks
export { useIdleAnimation, useHeadIdleAnimation, useBlinkAnimation } from './hooks/useIdleAnimation';
export { useMoodBodyAnimation, useMoodFaceAnimation, getMoodExpression, getMouthCurve } from './hooks/useMoodAnimation';
export { useStatusAnimation, usePlayerHighlight, getStatusGlowColor, getStatusParams } from './hooks/useStatusAnimation';
export { useAvatarPreloader, useAvatarUrlPreloader, preloadRPMModel, preloadRPMModels, extractRPMUrls } from './hooks/useAvatarPreloader';

// Utilities
export * from './utils/avatar-generator';
export * from './utils/color-palettes';

// Types
export type { AvatarCanvasSize } from './AvatarCanvas';
