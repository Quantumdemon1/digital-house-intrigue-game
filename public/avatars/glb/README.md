# Placeholder directory for GLB avatars

This directory will contain Draco-compressed GLB format avatars.

## Sources for free GLB characters
- Mixamo (Adobe) - rigged humanoid characters
- Sketchfab CC0 collection
- Quaternius game assets (CC0)
- Custom creation in Blender

## Optimization Pipeline
1. Reduce polycount to 5K-15K triangles
2. Resize textures to 512x512 or 1024x1024
3. Convert textures to WebP format
4. Apply Draco compression via gltf-pipeline or Blender

## Target file sizes
- 0.5-2MB per optimized GLB file
