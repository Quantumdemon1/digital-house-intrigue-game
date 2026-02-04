

# Plan: Avatar Selector with AI-Generated Character Templates

## Overview

Create a character selection system inspired by the Survivor game reference image, featuring premade houseguest templates with AI-generated realistic portraits. Players can browse through pre-designed characters in a visually appealing carousel/grid interface, select one as their template, and then customize the details.

---

## Part 1: AI Image Generation Service

### New File: `src/services/avatar-generator.ts`

Create a service to generate realistic character portraits using the Lovable AI image generation API (Nano banana model):

```typescript
interface GeneratedAvatar {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
}

// Generate character portrait based on description
async function generateCharacterPortrait(
  description: string,
  style: 'realistic' | 'stylized'
): Promise<string>

// Batch generate multiple character portraits
async function generateHouseguestPortraits(
  count: number
): Promise<GeneratedAvatar[]>
```

The prompts will request:
- High quality, realistic portrait headshots
- Diverse ages, ethnicities, and appearances
- Professional lighting, neutral background
- Suitable for a reality TV game show contestant

---

## Part 2: Premade Character Templates

### Modify: `src/components/game-setup/defaultHouseguests.ts`

Expand the default houseguests with more detailed character profiles and placeholder avatar URLs that will be replaced with generated images:

```typescript
interface CharacterTemplate {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  bio: string;
  imageUrl: string;          // Will store generated image
  traits: PersonalityTrait[];
  
  // New fields for character selection
  archetype: 'strategist' | 'competitor' | 'socialite' | 'wildcard' | 'underdog';
  tagline: string;           // Short catchy description
  appearance: {              // For AI generation prompts
    gender: 'male' | 'female' | 'non-binary';
    ageRange: string;
    features: string;
  };
}
```

Create 16+ diverse character templates representing different archetypes:
- **Strategists**: Calculating, always planning
- **Competitors**: Physical threats, win competitions
- **Socialites**: Charm everyone, alliance builders
- **Wildcards**: Unpredictable, make big moves
- **Underdogs**: Quiet threats, fly under radar

---

## Part 3: Avatar Selection Component

### New File: `src/components/game-setup/AvatarSelector.tsx`

Create a visually striking avatar selection grid inspired by the Survivor reference:

**Visual Elements:**
- Circular portrait frames with decorative borders (like the reference)
- Gold/bronze ornate frame design around selected avatar
- Name plates below each character
- Smooth hover animations with scale and glow effects
- Selected state with animated ring pulse

**Layout:**
- Horizontal scrollable carousel on mobile
- 3x4 or 4x4 grid on desktop
- Large preview of selected character on the side

```typescript
interface AvatarSelectorProps {
  templates: CharacterTemplate[];
  selectedId: string | null;
  onSelect: (template: CharacterTemplate) => void;
  isLoading?: boolean;
}
```

### Component Structure:

```
+--------------------------------------------------+
|  Choose Your Houseguest                          |
+--------------------------------------------------+
|                                                  |
|  +--------+  +--------+  +--------+  +--------+  |
|  |  [img] |  |  [img] |  |  [img] |  |  [img] |  |
|  |  Alex  |  |  Morgan|  |  Jordan|  |  Casey |  |
|  +--------+  +--------+  +--------+  +--------+  |
|                                                  |
|  +--------+  +--------+  +--------+  +--------+  |
|  |  [img] |  |  [img] |  |  [img] |  |  [img] |  |
|  |  Riley |  |  Jamie |  |  Quinn |  |  Avery |  |
|  +--------+  +--------+  +--------+  +--------+  |
|                                                  |
|  [Generate New Characters]  [Create Custom]      |
+--------------------------------------------------+
```

---

## Part 4: Character Portrait Frame Component

### New File: `src/components/game-setup/CharacterFrame.tsx`

A decorative frame component matching the Survivor aesthetic:

**Visual Features:**
- Circular image container with gradient border
- Ornate frame decoration (gold/bronze metallic look)
- Name plate with styled background
- Status indicators (Selected, Locked, etc.)
- Hover state with glow effect
- Click animation

```typescript
interface CharacterFrameProps {
  template: CharacterTemplate;
  isSelected: boolean;
  isHovered?: boolean;
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  showName?: boolean;
  showTraits?: boolean;
}
```

**Styling Details:**
- Frame border: Gradient from amber-500 to orange-600
- Selected state: Animated gold glow pulse
- Name plate: Dark background with contrasting text
- Trait badges below name

---

## Part 5: Character Detail Panel

### New File: `src/components/game-setup/CharacterDetailPanel.tsx`

Shows expanded details of the selected character:

```
+----------------------------------+
|     [Large Portrait Image]       |
|                                  |
|     "ALEX CHEN"                  |
|     The Mastermind               |
|                                  |
|     Age: 28                      |
|     Occupation: Marketing Exec   |
|     Hometown: San Francisco, CA  |
|                                  |
|     "Strategic player who        |
|      excels at social            |
|      manipulation."              |
|                                  |
|     [Strategic] [Social]         |
|                                  |
|     Stats Preview:               |
|     Mental: ████████░░  8/10     |
|     Social: ███████░░░  7/10     |
|     Physical: █████░░░░  5/10    |
|                                  |
|     [Select This Character]      |
+----------------------------------+
```

---

## Part 6: Integrate into Game Setup Flow

### Modify: `src/components/GameSetup.tsx`

Add a new step before the player form for character selection:

**Updated Flow:**
1. **Step 1 (NEW)**: Avatar Selection - Choose a premade character template
2. **Step 2**: Customize Character - Modify name, bio, traits, stats
3. **Step 3**: Review Cast - See all houseguests before entering

```typescript
const [step, setStep] = useState<1 | 2 | 3>(1);
const [selectedTemplate, setSelectedTemplate] = useState<CharacterTemplate | null>(null);

// When template selected, pre-fill form data
const handleTemplateSelect = (template: CharacterTemplate) => {
  setSelectedTemplate(template);
  setPlayerFormData({
    ...playerFormData,
    playerName: template.name,
    playerAge: template.age,
    playerOccupation: template.occupation,
    playerHometown: template.hometown,
    playerBio: template.bio,
    selectedTraits: template.traits,
  });
  setStep(2);
};
```

### Modify: `src/components/game-setup/PlayerForm.tsx`

Update to show the selected avatar image instead of just initials:
- Display the generated portrait in the avatar preview
- Allow "Change Avatar" to go back to selection
- Keep all customization options available

---

## Part 7: Generate Character Portraits on Demand

### New File: `src/hooks/useAvatarGeneration.ts`

Hook to manage avatar generation state:

```typescript
interface UseAvatarGenerationResult {
  avatars: GeneratedAvatar[];
  isGenerating: boolean;
  error: string | null;
  generateAvatars: (count: number) => Promise<void>;
  regenerateAvatar: (id: string) => Promise<void>;
}
```

**Generation Strategy:**
1. Start with placeholder images initially
2. "Generate New Looks" button triggers AI generation
3. Generated images are stored in state
4. Option to regenerate individual characters
5. Loading states with skeleton UI

---

## Part 8: Character Template Data

### New File: `src/data/character-templates.ts`

Comprehensive character template data:

```typescript
export const characterTemplates: CharacterTemplate[] = [
  {
    id: 'strategist-1',
    name: 'Alex Chen',
    archetype: 'strategist',
    tagline: 'The Mastermind',
    age: 28,
    occupation: 'Marketing Executive',
    hometown: 'San Francisco, CA',
    bio: 'Strategic player who excels at social manipulation and long-term planning.',
    traits: ['Strategic', 'Social'],
    appearance: {
      gender: 'male',
      ageRange: '25-30',
      features: 'East Asian, confident expression, professional look'
    },
    imageUrl: '/placeholder.svg'
  },
  // ... 15 more diverse characters
];
```

**Character Diversity:**
- Mix of genders, ages, ethnicities
- Various occupations and backgrounds
- Different play style archetypes
- Unique personality combinations

---

## Part 9: Custom Avatar Creation Mode

### New File: `src/components/game-setup/CustomAvatarCreator.tsx`

For players who want fully custom characters:

**Features:**
- Text input for appearance description
- "Generate My Look" button to create custom portrait
- Regenerate option if not satisfied
- Fallback to gradient avatar if generation fails

```typescript
interface CustomAvatarCreatorProps {
  onAvatarGenerated: (imageUrl: string) => void;
  onCancel: () => void;
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/avatar-generator.ts` | AI image generation service |
| `src/components/game-setup/AvatarSelector.tsx` | Main avatar selection grid |
| `src/components/game-setup/CharacterFrame.tsx` | Decorative portrait frame |
| `src/components/game-setup/CharacterDetailPanel.tsx` | Selected character details |
| `src/components/game-setup/CustomAvatarCreator.tsx` | Custom avatar generation |
| `src/hooks/useAvatarGeneration.ts` | Avatar generation hook |
| `src/data/character-templates.ts` | Premade character data |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/GameSetup.tsx` | Add character selection step |
| `src/components/game-setup/PlayerForm.tsx` | Show selected avatar, add change button |
| `src/components/game-setup/AvatarPreview.tsx` | Support showing generated images |
| `src/components/game-setup/defaultHouseguests.ts` | Enhanced character data |
| `src/components/game-setup/HouseguestList.tsx` | Display generated portraits |
| `src/components/game-setup/types.ts` | Add avatar URL to form data |
| `src/config.ts` | Add avatar generation settings |

---

## Technical Details

### AI Image Generation Prompts

For generating realistic character portraits:

```typescript
const generatePrompt = (character: CharacterTemplate) => `
  Professional headshot portrait of a ${character.appearance.ageRange} year old 
  ${character.appearance.gender} for a reality TV show contestant.
  ${character.appearance.features}.
  High quality, studio lighting, neutral gray background.
  Confident, friendly expression. Shoulders and face visible.
  Photorealistic style, 4K quality.
`;
```

### Character Frame Styling

```css
.character-frame {
  /* Ornate border gradient */
  background: linear-gradient(135deg, 
    hsl(36 100% 50%) 0%, 
    hsl(28 100% 45%) 50%, 
    hsl(36 100% 40%) 100%
  );
  
  /* Metallic effect */
  box-shadow: 
    inset 0 2px 4px rgba(255,255,255,0.3),
    inset 0 -2px 4px rgba(0,0,0,0.2),
    0 4px 12px rgba(0,0,0,0.3);
}

.character-frame.selected {
  animation: glow-pulse-ring 2s ease-in-out infinite;
}
```

### Form Data Type Update

```typescript
interface PlayerFormData {
  // ... existing fields
  avatarUrl?: string;        // Generated or selected avatar URL
  templateId?: string;       // ID of selected template
}
```

---

## UI/UX Flow

```text
App Start
    |
    v
[Character Selection Screen]
    |
    +---> Browse premade characters
    |
    +---> Click character to see details
    |
    +---> Select character or "Create Custom"
    |
    v
[Customization Screen]
    |
    +---> Modify name, bio, traits
    |
    +---> Adjust stats with point allocation
    |
    +---> "Change Avatar" returns to selection
    |
    v
[Cast Review Screen]
    |
    +---> See all houseguests with portraits
    |
    +---> "Enter the House"
    |
    v
[Game Begins]
```

---

## Expected Visual Result

The avatar selector will feature:
- **Decorative circular frames** with gold/bronze metallic borders
- **High-quality portraits** generated by AI (realistic style)
- **Stylish name plates** below each character
- **Smooth hover animations** with scale and glow
- **Selected state** with animated pulsing ring
- **Character archetype badges** (Strategist, Competitor, etc.)
- **Large detail panel** showing full character info
- **Generate buttons** to create new character looks

This matches the Survivor reference with its circular portrait frames, name plates, and polished game show aesthetic, but adapted for the Big Brother theme with the existing blue/gold color scheme.

