/**
 * @file avatar-3d/index.ts
 * @description Exports for 3D avatar system (RPM-only)
 */

// Main components
export { AvatarCanvas } from './AvatarCanvas';
export { AvatarCustomizer } from './AvatarCustomizer';
export { ColorPalettePicker } from './ColorPalettePicker';
export { AvatarOptionSelector } from './AvatarOptionSelector';
export * from './SimsIcons';

// Ready Player Me components (PRIMARY)
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
export type { ScreenshotOptions } from './AvatarScreenshotCapture';
export { AutoCaptureProfilePhoto } from './AutoCaptureProfilePhoto';
export { AvatarProfilePicture } from './AvatarProfilePicture';

// House Scene components (3D environment)
export { HouseScene } from './HouseScene';
 export { CircularHouseScene } from './CircularHouseScene';
export { 
  HouseFloor, Couch, CoffeeTable, Plant, LightFixture,
  TVStand, BarStool, KitchenArea, DiaryRoomDoor, WallPanel 
} from './HouseFurniture';
export { CharacterCarousel } from './CharacterCarousel';

// Hooks
export { useAvatarPreloader, useAvatarUrlPreloader, preloadRPMModel, preloadRPMModels, extractRPMUrls } from './hooks/useAvatarPreloader';

// Utilities
export * from './utils/avatar-generator';
export * from './utils/color-palettes';

// Types
export type { AvatarCanvasSize } from './AvatarCanvas';
