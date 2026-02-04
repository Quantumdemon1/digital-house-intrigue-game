
# Plan: Make All Player Stats Meaningful

## Overview

This plan adds meaningful mechanical effects for all 8 player stats, transforming them from decorative numbers into impactful gameplay modifiers. Each stat will influence specific game systems with clear, visible feedback.

---

## Current State Analysis

| Stat | Currently Used For | Player Impact |
|------|-------------------|---------------|
| Physical | HoH/PoV competitions (1.5x weight) | Working correctly |
| Mental | HoH/PoV competitions (1.5x weight) | Working correctly |
| Endurance | HoH/PoV competitions (1.5x weight) | Working correctly |
| Social | 10% relationship bonus per point over 5 | Partially working |
| Luck | Crapshoot competitions | Working correctly |
| Loyalty | NPC AI decisions only | **No player effect** |
| Strategic | NPC AI decisions only | **No player effect** |
| Competition | 0.2x tiny boost (mostly bypassed) | **Effectively unused** |

---

## Proposed Stat Effects

### 1. Social Stat - Interaction Success Chances

**Current Issue**: `requiredSocialStat` values exist in `InteractionOptions.tsx` but are never checked.

**Solution**: Add stat-based success calculation to eviction interactions.

- Each interaction shows success probability based on player's Social vs required stat
- Low Social = risky interactions may backfire (relationship penalty instead of bonus)
- High Social = unlock "Master Persuader" bonus effects (+50% relationship gains)

**Visible to Player**:
```text
+---------------------------------------------+
| [Heart] Appeal to emotions                  |
| Requires: Social 5 | Your Social: 7         |
| Success Chance: 85% | +15 relationship      |
+---------------------------------------------+
```

---

### 2. Strategic Stat - Information Reveals

**New Feature**: Higher Strategic stat reveals hidden information during key phases.

**Effects by Strategic Level**:
- **3+**: See relationship indicators on houseguest cards (likes you / neutral / dislikes you)
- **5+**: During nominations, see hints about who other houseguests would target
- **7+**: Before eviction votes, see "vote lean" predictions (likely voting for X)
- **9+**: See alliance memberships and who is in alliances together

**Visual Implementation**:
- Add eye icon with tooltip showing intel based on Strategic level
- Higher Strategic = more detailed intel revealed
- Creates meaningful information asymmetry

---

### 3. Loyalty Stat - Promise Effectiveness

**New Feature**: Loyalty stat affects promise impact and trustworthiness perception.

**Effects**:
- Promises made by player gain bonus relationship impact based on Loyalty
- Formula: `baseImpact * (1 + (Loyalty - 5) * 0.15)` = up to 75% bonus at Loyalty 10
- Low Loyalty: Others are skeptical of promises (reduced initial relationship boost)
- High Loyalty: Promises carry more weight, fulfilling them has amplified positive effect

**Broken Promise Penalty**:
- Low Loyalty players take less reputation damage when breaking promises (already expected)
- High Loyalty players take severe reputation damage (trusted betrayal hurts more)

---

### 4. Competition Stat - Clutch Performance Bonus

**Enhancement**: Competition stat provides a "clutch" bonus in elimination scenarios.

**Effects**:
- When player is nominated, Competition stat adds a flat bonus to PoV competition score
- Formula: `+0.5 points per Competition stat point when on the block`
- Creates comeback potential for players in danger
- Also applies a smaller bonus in Final HoH competitions

**Visible to Player**:
- Show "Clutch Bonus Active!" indicator when competing while nominated
- Display the bonus percentage in competition preview

---

### 5. Enhanced Social Phase Actions

**New Feature**: Stat requirements for social phase actions.

| Action | Required Stat | Threshold | Effect |
|--------|--------------|-----------|--------|
| Spread Rumor | Strategic | 6+ | Unlock spreading rumors about other houseguests |
| Form Alliance | Social | 5+ | Successfully propose alliances |
| Final 2 Deal | Loyalty | 6+ | Final 2 proposals taken seriously |
| Intimidate | Physical | 6+ | Intimidation attempts more effective |

---

## Implementation Details

### File: `src/components/game-phases/EvictionPhase/InteractionOptionButton.tsx`

Add success chance display and stat requirement check:
- Show success probability based on player Social vs required stat
- Disable or mark as "risky" interactions where player stat is too low
- Add visual indicator for guaranteed success / risky / likely failure

### File: `src/components/game-phases/EvictionPhase/InteractionResults.tsx`

Add stat-based outcome calculation:
- Roll against success chance to determine if interaction succeeds
- Failed interactions apply negative relationship change instead
- Show "Your Social stat helped you succeed!" on lucky saves

### File: `src/systems/promise/promise-effects.ts`

Modify `getPromiseImpact` to factor in Loyalty stat:
- Lookup player's Loyalty stat when calculating promise impact
- Apply multiplier based on Loyalty level
- Increase/decrease broken promise reputation spread based on Loyalty

### File: `src/systems/competition/competition-runner.ts`

Add clutch performance bonus:
- Check if participant is nominated before competition
- If nominated, add Competition stat bonus to their score
- Log the clutch bonus application

### File: `src/components/houseguest/HouseguestCard.tsx` (or new component)

Add Strategic-based information reveals:
- Check player's Strategic stat
- Conditionally render relationship indicators, vote predictions, alliance info
- Use tooltip or subtle icon indicators

### File: `src/components/game-phases/NominationPhase/NomineeSelector.tsx`

Add Strategic intel hints:
- For Strategic 5+, show threat level indicators on eligible nominees
- Display subtle hints about house sentiment toward each houseguest

### New File: `src/utils/stat-checks.ts`

Create utility functions for stat-based checks:
- `calculateSuccessChance(playerStat, requiredStat)`: Returns 0-100% chance
- `rollStatCheck(playerStat, requiredStat)`: Returns success boolean
- `getStrategicIntelLevel(strategicStat)`: Returns intel tier (none/basic/advanced/master)
- `getLoyaltyMultiplier(loyaltyStat)`: Returns promise impact multiplier
- `getClutchBonus(competitionStat, isNominated)`: Returns competition bonus

---

## UI/UX Enhancements

### Stats Selector Tooltips

Update tooltip text to explain actual gameplay effects:

| Stat | New Tooltip Text |
|------|------------------|
| Physical | "Boosts performance in Physical competitions. High Physical unlocks Intimidation tactics." |
| Mental | "Boosts performance in Mental competitions and Final HoH Part 2." |
| Endurance | "Boosts performance in Endurance competitions and Final HoH Part 1." |
| Social | "Increases relationship gains and unlocks advanced persuasion options. Affects interaction success rates." |
| Loyalty | "Amplifies the impact of promises you make and keep. High Loyalty = trusted ally; low = flexible player." |
| Strategic | "Reveals hidden information about other houseguests' relationships, alliances, and voting intentions." |
| Luck | "Boosts performance in Crapshoot (random) competitions. May influence tiebreakers." |
| Competition | "Provides a clutch performance bonus when competing while nominated. Comeback potential." |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/stat-checks.ts` | **NEW** - Create stat check utility functions |
| `src/components/game-phases/EvictionPhase/InteractionOptionButton.tsx` | Add success chance display, stat requirement warnings |
| `src/components/game-phases/EvictionPhase/InteractionResults.tsx` | Add stat-based success/failure roll |
| `src/systems/promise/promise-effects.ts` | Factor Loyalty stat into promise impact calculation |
| `src/systems/competition/competition-runner.ts` | Add Competition stat clutch bonus for nominated players |
| `src/components/houseguest/HouseguestCard.tsx` | Add Strategic-based intel displays |
| `src/components/game-setup/StatsSelector.tsx` | Update tooltips to describe actual effects |
| `src/components/game-phases/NominationPhase/NomineeSelector.tsx` | Add Strategic intel hints on nominees |

---

## Summary of New Stat Effects

| Stat | New Player Mechanic |
|------|---------------------|
| **Social** | Success chance on interactions; unlock advanced persuasion |
| **Strategic** | Reveal relationship indicators, vote predictions, alliance info |
| **Loyalty** | Promise impact multiplier (both positive and negative) |
| **Competition** | Clutch bonus when competing while nominated |

These changes transform stats from background numbers into active gameplay decisions, where players must weigh stat allocation against their intended playstyle (competition beast, social butterfly, strategic mastermind, or loyal ally).
