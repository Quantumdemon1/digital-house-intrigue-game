/**
 * @file avatar-3d/index.ts
 * @description Exports for 3D avatar system
 */

// Main components
export { SimsAvatar } from './SimsAvatar';
export { AvatarCanvas } from './AvatarCanvas';
export { AvatarCustomizer } from './AvatarCustomizer';
export { ColorPalettePicker } from './ColorPalettePicker';
export { AvatarOptionSelector } from './AvatarOptionSelector';
export * from './SimsIcons';

// Ready Player Me components - loaded lazily to avoid build issues
// Import directly from './RPMAvatar' or './RPMAvatarCreator' if needed
// export { RPMAvatar, RPMAvatarWithSuspense, preloadRPMAvatar } from './RPMAvatar';
// export { RPMAvatarCreator, RPMAvatarCreatorInline } from './RPMAvatarCreator';
export { AvatarLoader, AvatarSkeleton, preloadAvatar } from './AvatarLoader';
export type { AvatarSize } from './AvatarLoader';

// VRM and Preset avatar components
export { VRMAvatar, preloadVRM } from './VRMAvatar';
export { PresetAvatar, preloadPresetAvatars, preloadAllPresets, getPresetById, getPresetUrl } from './PresetAvatar';
export { PresetAvatarSelector } from './PresetAvatarSelector';
export type { PresetSource } from './PresetAvatarSelector';
export { AvatarThumbnail, captureAvatarThumbnail, ThumbnailCapture, useAvatarThumbnail } from './AvatarThumbnail';
export { AvatarScreenshotCapture, captureAvatarScreenshot } from './AvatarScreenshotCapture';
export { AvatarProfilePicture } from './AvatarProfilePicture';

// Body parts
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
