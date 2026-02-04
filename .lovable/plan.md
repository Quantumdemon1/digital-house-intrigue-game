
# Plan: Add Real CC0 Avatar Assets to the Project

## Current State

The avatar system has placeholder directories with no actual 3D model files:
- `/public/avatars/vrm/` - Contains only README.md
- `/public/avatars/glb/` - Contains only README.md

All preset entries in both `preset-vrm-avatars.ts` and `preset-glb-avatars.ts` are marked as `isPlaceholder: true`.

---

## Challenge: File Size Limits

VRM and GLB avatar files are typically **5-20MB each**. Lovable cannot directly create binary 3D model files - these need to be:
1. Downloaded from external sources
2. Uploaded to the project manually by you

---

## Recommended CC0 Avatar Sources

### For VRM (Anime) Avatars

**OpenGameArt VRoid Studio CC0 Collection** (Best option)
- URL: https://opengameart.org/content/vroid-studio-cc0-models
- **11 official CC0 VRM avatars** from VRoid/pixiv
- Files available:
  - `avatarsample_d.zip` (13.6 MB)
  - `avatarsample_d_darkness.zip` (17.2 MB) 
  - `avatarsample_e.zip` (15 MB)
  - `avatarsample_f.zip` (11.2 MB)
  - `avatarsample_g.zip` (12.2 MB)
  - `base_female.zip` (13.1 MB)
  - `base_male.zip` (14.8 MB)
  - `hairsample_female.zip` (14.3 MB)
  - `hairsample_male.zip` (15.5 MB)
  - `sakurada_fumiriya.zip` (15.9 MB)
  - `sendagaya_shino.zip` (11.7 MB)

### For GLB (Realistic) Avatars

**Quaternius Universal Base Characters** (Best option)
- URL: https://quaternius.com/packs/universalbasecharacters.html
- **26 game-ready character models** in glTF/GLB format
- Includes male/female in Superhero, Regular, and Teen body types
- License: CC0 (completely free, no attribution required)

---

## Implementation Steps

### Step 1: Download VRM Avatars (Manual Action Required)

1. Go to https://opengameart.org/content/vroid-studio-cc0-models
2. Download at least 5 zip files (recommended: avatarsample_d through g, base_male, base_female)
3. Extract the .vrm files from each zip
4. Rename files to match existing preset structure:
   - `AvatarSample_D.vrm` → `sakura.vrm`
   - `AvatarSample_E.vrm` → `haruto.vrm`
   - `AvatarSample_F.vrm` → `yuki.vrm`
   - `AvatarSample_G.vrm` → `ren.vrm`
   - `base_male.vrm` → `kai.vrm`
   - `base_female.vrm` → `miku.vrm`
   - etc.

### Step 2: Download GLB Avatars (Manual Action Required)

1. Go to https://quaternius.com/packs/universalbasecharacters.html
2. Click download and extract the pack
3. Locate the `.glb` files in the glTF folder
4. Rename to match preset structure:
   - `Male_Regular.glb` → `marcus.glb`
   - `Female_Regular.glb` → `elena.glb`
   - `Male_Superhero.glb` → `tyler.glb`
   - `Female_Superhero.glb` → `sophia.glb`
   - etc.

### Step 3: Upload Assets to Project

**Option A: Direct Upload (Recommended for smaller sets)**
1. Use Lovable's file upload feature (Plus button → Attach)
2. Upload each .vrm and .glb file to the chat
3. I'll move them to the correct `/public/avatars/` directories

**Option B: Lovable Cloud Storage (Better for larger sets)**
1. Create a storage bucket for avatars
2. Upload files to cloud storage
3. Update preset URLs to point to storage bucket

### Step 4: Update Preset Data Files

Once files are uploaded, I'll update the data files:

**Changes to `preset-vrm-avatars.ts`:**
- Set `isPlaceholder: false` for avatars with real files
- Update names/descriptions to match actual character appearances
- Update author attribution

**Changes to `preset-glb-avatars.ts`:**
- Set `isPlaceholder: false` for avatars with real files
- Update style/bodyType to match Quaternius model types
- Update names/descriptions

### Step 5: Generate Thumbnails

For each uploaded model, generate 256x256 WebP thumbnails:
- Either capture screenshots from the 3D preview
- Or I can create a thumbnail generation utility that renders avatars to canvas

---

## Alternative: Use Cloud-Hosted Free Avatars

If downloading/uploading is too much effort, I can update the preset URLs to point to **publicly hosted CC0 avatars** from CDNs:

**Example cloud-hosted VRM:**
```typescript
{
  id: 'vrm-sample-d',
  name: 'Sample D',
  url: 'https://cdn.jsdelivr.net/gh/example/vrm-avatars@main/sample_d.vrm',
  isPlaceholder: false
}
```

However, this introduces external dependencies and potential CORS issues.

---

## Recommended Minimal Set

To get the avatar system working with **real avatars**, I recommend starting with:

| Type | Count | Source | File Size |
|------|-------|--------|-----------|
| VRM | 5 | OpenGameArt VRoid CC0 | ~60 MB total |
| GLB | 5 | Quaternius Universal | ~15 MB total |

This gives 10 functional avatars across both "Realistic" and "Anime" modes.

---

## Next Steps

To proceed, please:

1. **Download VRM files** from https://opengameart.org/content/vroid-studio-cc0-models
2. **Download GLB files** from https://quaternius.com/packs/universalbasecharacters.html
3. **Upload the files** to this chat (I can accept multiple at once)

Once you upload the avatar files, I'll:
- Move them to the correct directories
- Update the preset data files to mark them as non-placeholder
- Update names/descriptions to match the actual models
- The avatar selector will immediately start working

---

## Technical Notes

- VRM files can be renamed from `.vrm` to `.glb` and loaded as standard glTF if needed
- The existing `VRMAvatar.tsx` component uses `@pixiv/three-vrm` which handles VRM 0.x and 1.0 formats
- Quaternius GLB models include armatures compatible with basic idle animations
- File sizes: VRM ~10-20MB each, optimized GLB ~1-3MB each
