
# Plan: Complete UI/UX Visual Revamp

## Overview

This plan transforms the game's visual identity from a generic look to a polished, immersive "Big Brother Digital House" experience with enhanced avatars, modern animations, a settings system with dark mode toggle, and a more dramatic aesthetic throughout.

---

## Part 1: Settings System with Dark Mode

### New File: `src/components/settings/SettingsProvider.tsx`

Create a settings context that persists preferences to localStorage:

```typescript
interface GameSettings {
  theme: 'light' | 'dark' | 'system';
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  showAIThoughts: boolean;
  compactMode: boolean;
}
```

### New File: `src/components/settings/SettingsDialog.tsx`

A modal dialog accessible from the header with:
- Dark/Light/System theme toggle with preview
- Animation speed control
- Sound toggle (for future use)
- AI thought bubble visibility toggle
- Compact mode toggle for mobile

### Modify: `src/App.tsx`

Wrap the app with `ThemeProvider` from `next-themes` to enable dark mode:

```typescript
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {/* existing providers */}
</ThemeProvider>
```

### Modify: `src/components/game-screen/GameHeader.tsx`

Add a settings gear icon button next to the profile button that opens the settings dialog.

---

## Part 2: Enhanced Avatar System

### New File: `src/components/houseguest/EnhancedAvatar.tsx`

Create a more visually striking avatar component:

- **Gradient Backgrounds**: Dynamic gradient based on houseguest personality traits
- **Status Rings**: Animated glowing rings for HoH (gold pulse), Nominee (red pulse), PoV (gold shimmer)
- **Initials with Style**: Better typography with text shadows and gradient fills
- **Hover Effects**: Scale + glow on hover with tooltip
- **Player Indicator**: Special "You" badge with green accent
- **Mood Indicator**: Small emoji or color dot showing current mood state

```typescript
interface EnhancedAvatarProps {
  houseguest: Houseguest;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showMood?: boolean;
  showStatus?: boolean;
  animated?: boolean;
  onClick?: () => void;
}
```

### Trait-Based Avatar Colors

Map personality traits to gradient color schemes:
- **Strategic**: Blue-purple gradient
- **Social**: Pink-orange gradient
- **Competitive**: Red-orange gradient
- **Loyal**: Green-teal gradient
- **Sneaky**: Purple-dark gradient
- **Emotional**: Pink-red gradient

### Modify: `src/components/ui/status-avatar.tsx`

Upgrade with:
- Framer Motion animations for status changes
- Particle effects on status badge
- Better shadow system with colored glows
- Smooth transitions between states

---

## Part 3: Animation System Overhaul

### Modify: `tailwind.config.ts`

Add new dramatic keyframes:

```typescript
keyframes: {
  // Dramatic entrance for key moments
  'dramatic-enter': {
    '0%': { opacity: '0', transform: 'scale(0.8) translateY(20px)', filter: 'blur(10px)' },
    '100%': { opacity: '1', transform: 'scale(1) translateY(0)', filter: 'blur(0)' }
  },
  
  // Glowing pulse for important elements
  'glow-pulse': {
    '0%, 100%': { boxShadow: '0 0 20px var(--glow-color)' },
    '50%': { boxShadow: '0 0 40px var(--glow-color), 0 0 60px var(--glow-color)' }
  },
  
  // Spotlight effect for reveals
  'spotlight': {
    '0%': { clipPath: 'circle(0% at 50% 50%)' },
    '100%': { clipPath: 'circle(100% at 50% 50%)' }
  },
  
  // Card flip for vote reveals
  'card-flip': {
    '0%': { transform: 'rotateY(180deg)', opacity: '0' },
    '100%': { transform: 'rotateY(0deg)', opacity: '1' }
  },
  
  // Shimmer effect for loading states
  'shimmer-sweep': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' }
  },
  
  // Bounce in for notifications
  'bounce-in': {
    '0%': { transform: 'scale(0)', opacity: '0' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)', opacity: '1' }
  }
}
```

### New Framer Motion Variants

Create reusable animation variants for consistent motion:

```typescript
// src/lib/motion-variants.ts
export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const dramaticReveal = {
  hidden: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0)', transition: { duration: 0.6, ease: 'easeOut' } }
};
```

---

## Part 4: Component Visual Upgrades

### Modify: `src/components/ui/game-card.tsx`

Enhanced game cards with:
- Glassmorphism effect option
- Gradient borders
- Animated hover states using Framer Motion
- Inner glow effects
- Better shadow layering

```typescript
const variantClasses = {
  default: 'bg-card/95 backdrop-blur-sm border-border/50',
  glass: 'bg-white/10 dark:bg-black/20 backdrop-blur-lg border-white/20 dark:border-white/10',
  primary: 'bg-gradient-to-br from-bb-blue to-bb-blue-dark border-bb-blue/50',
  danger: 'bg-gradient-to-br from-bb-red to-bb-red-dark border-bb-red/50',
  gold: 'bg-gradient-to-br from-bb-gold to-amber-600 border-bb-gold/50',
  success: 'bg-gradient-to-br from-bb-green to-emerald-600 border-bb-green/50'
};
```

### Modify: `src/components/ui/button.tsx`

Add new button variants:
- `glow`: Button with animated glow effect
- `gradient`: Gradient background button
- `glass`: Glassmorphism button
- `dramatic`: Extra large with shadow and animation

### New File: `src/components/ui/animated-badge.tsx`

Badges with entrance animations and optional pulse effects for status indicators.

---

## Part 5: Auth Page Redesign

### Modify: `src/components/auth/AuthPage.tsx`

Transform from generic form to immersive entry:
- Full-screen gradient background with animated particles
- "Big Brother eye" logo animation
- Glassmorphism card for login/signup
- Animated text effects for title
- Subtle surveillance camera scan animation in background
- Smooth tab transitions with Framer Motion

---

## Part 6: Game Setup Screen Redesign

### Modify: `src/components/GameSetup.tsx` and `src/components/game-setup/PlayerForm.tsx`

Major visual overhaul:
- Step indicator with animated progress
- Character creation with live avatar preview
- Trait selection as interactive cards with hover effects
- Stats displayed as animated circular progress or radar chart
- "Enter the House" dramatic button with glow effect
- Background with subtle animated grid pattern

### New Component: `src/components/game-setup/AvatarPreview.tsx`

Live preview of the player's avatar that updates as they select traits:
- Shows initials with trait-based gradient
- Displays selected traits as small badges
- Animated stats display around the avatar

---

## Part 7: Game Screen Polish

### Modify: `src/components/game-screen/GameScreen.tsx`

- Animated background patterns that subtly shift
- Better spacing and visual hierarchy
- Smoother transitions between phases

### Modify: `src/components/game-screen/GameHeader.tsx`

- More dramatic title treatment with gradient text
- Animated week counter with flip effect
- Settings button with gear icon
- Better responsive design for mobile

### Modify: `src/components/game-screen/GameSidebar.tsx`

- Collapsible sections with smooth animations
- Better status card designs
- Houseguest list with staggered entrance animations
- Visual improvements for power holders display

---

## Part 8: Phase-Specific Visual Enhancements

### Competition Phases (HoH, PoV)

- Dramatic title card entrance
- Competitor cards with animated borders
- Winner reveal with confetti and spotlight animation
- Progress bars with gradient fills

### Nomination Phase

- Key ceremony animation (keys turning/clicking)
- Dramatic nominee reveal with red glow
- Tension-building visual effects

### Eviction Phase

- Vote counter with flip animation for each vote
- Split-screen nominee comparison
- Evicted houseguest grayscale transition
- "Goodbye" message fade effect

### Social Phase

- Location cards with ambient animations
- Houseguest cards with relationship color borders
- Action buttons with hover glow effects
- NPC activity feed with smooth entry animations

---

## Part 9: Color System Enhancement

### Modify: `src/index.css`

Enhanced color palette for dark mode with better contrast:

```css
.dark {
  /* Richer dark background */
  --background: 222 47% 6%;
  --foreground: 210 40% 96%;
  
  /* Enhanced card surfaces */
  --card: 222 47% 10%;
  --card-foreground: 210 40% 96%;
  
  /* Brighter accent colors for dark mode */
  --bb-blue: 210 100% 55%;
  --bb-red: 6 100% 65%;
  --bb-gold: 36 100% 55%;
  --bb-green: 145 100% 45%;
  
  /* Stronger glows */
  --shadow-glow-primary: 0 0 30px hsl(210 100% 55% / 0.6);
  --shadow-glow-gold: 0 0 30px hsl(36 100% 55% / 0.6);
}
```

Add CSS custom properties for glow colors that can be used in animations:

```css
:root {
  --glow-primary: hsl(var(--bb-blue) / 0.5);
  --glow-danger: hsl(var(--bb-red) / 0.5);
  --glow-gold: hsl(var(--bb-gold) / 0.5);
  --glow-success: hsl(var(--bb-green) / 0.5);
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/settings/SettingsProvider.tsx` | Settings context with persistence |
| `src/components/settings/SettingsDialog.tsx` | Settings modal UI |
| `src/components/settings/index.ts` | Exports |
| `src/components/houseguest/EnhancedAvatar.tsx` | New avatar component |
| `src/components/game-setup/AvatarPreview.tsx` | Live avatar preview |
| `src/lib/motion-variants.ts` | Reusable Framer Motion variants |
| `src/components/ui/animated-badge.tsx` | Animated badge component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add ThemeProvider wrapper |
| `src/index.css` | Enhanced dark mode colors, new utility classes |
| `tailwind.config.ts` | New keyframes and animations |
| `src/components/ui/game-card.tsx` | Glassmorphism, better variants |
| `src/components/ui/button.tsx` | New glow/gradient variants |
| `src/components/ui/status-avatar.tsx` | Framer Motion animations |
| `src/components/auth/AuthPage.tsx` | Full redesign with animations |
| `src/components/GameSetup.tsx` | Visual overhaul |
| `src/components/game-setup/PlayerForm.tsx` | Enhanced styling |
| `src/components/game-screen/GameHeader.tsx` | Settings button, polish |
| `src/components/game-screen/GameScreen.tsx` | Background improvements |
| `src/components/game-screen/GameSidebar.tsx` | Animation polish |
| `src/components/houseguest/HouseguestCard.tsx` | Use EnhancedAvatar |

---

## Technical Considerations

### Performance
- Use CSS animations where possible for performance
- Implement `AnimatePresence` with exit animations only where needed
- Lazy load heavy animation components
- Respect `prefers-reduced-motion` media query

### Accessibility
- Ensure color contrast meets WCAG AA standards
- Provide motion alternatives for users who prefer reduced motion
- Maintain keyboard navigation
- Add proper ARIA labels

### Responsive Design
- All animations scale appropriately for mobile
- Settings dialog works on small screens
- Avatar sizes adapt to container

---

## Summary of Visual Changes

| Area | Before | After |
|------|--------|-------|
| Theme | Light only | Light/Dark/System with toggle |
| Avatars | Simple initials | Gradient backgrounds, glowing rings, mood indicators |
| Cards | Flat borders | Glassmorphism, gradient borders, hover glows |
| Animations | Basic fades | Dramatic reveals, stagger effects, card flips |
| Auth Page | Generic form | Immersive full-screen experience |
| Setup Page | Standard form | Interactive character creator with preview |
| Colors | Muted | Vibrant with proper dark mode contrast |
| Buttons | Standard | Glow effects, gradient options |
| Status Indicators | Static badges | Animated pulses and shimmer effects |
