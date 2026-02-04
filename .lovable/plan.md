
# Implementation Plan: Enhanced Social, Deals & Alliances System

## Executive Summary

This plan enhances the game's social systems with 5 major improvements:
1. **Conversation Topics System** - Replace generic "Talk" with meaningful choices
2. **Alliance Management UI** - Give players control over their alliances
3. **Relationship Milestones** - Visual celebration of friendship tiers
4. **Deal Obligation Reminders** - Highlight relevant deals during ceremonies
5. **Counter-Offer System** - NPCs can propose alternative deals

---

## Phase 1: Conversation Topics System

### Current State
- "Talk to [Name]" action gives a flat +3-7 relationship boost
- No player choice about conversation type
- All conversations feel identical

### Enhancement
Add 5 conversation topic choices when clicking "Talk":

| Topic | Risk | Reward | Effect |
|-------|------|--------|--------|
| Small Talk | None | +3-5 | Safe relationship building |
| Personal Chat | Low | +5-8 | Share personal info, builds trust |
| Discuss the Game | Medium | +4-10 | Strategic talk, trait-dependent |
| Vent About Houseguest | High | +8-15 OR -10 | Gossip - risky if they're allied |
| Share a Secret | High | +10-18 OR -15 | High trust builder OR betrayal risk |

### Files to Create/Modify

**Create: `src/components/dialogs/ConversationTopicDialog.tsx`**
- Modal that appears after clicking "Talk to [Name]"
- Shows 5 topic cards with risk/reward indicators
- Displays target's likely reaction based on traits

**Modify: `src/game-states/social/handlers/talkHandler.ts`**
- Accept `conversationType` parameter
- Calculate relationship change based on topic + traits
- Add betrayal logic for risky topics

**Modify: `src/contexts/reducers/reducers/player-action-reducer.ts`**
- Handle new `talk_to` with topic parameter
- Calculate outcomes based on:
  - Target's traits (e.g., "Sneaky" NPCs love gossip)
  - Existing relationship level
  - Whether gossip target is allied with conversation partner

---

## Phase 2: Alliance Management UI

### Current State
- Alliances exist in system but player has no management interface
- No way to name alliances, invite members, or track stability
- Alliance tab in DealsPanel shows minimal info

### Enhancement
Create dedicated Alliance Management interface:

**Features:**
- **Create Alliance**: Name it, select founding members (min 2)
- **Invite Members**: Propose new member to existing alliance
- **View Stability**: See stability score (0-100) with breakdown
- **Hold Meeting**: Action to boost all member relationships +3 and stability +5
- **Leave/Kick**: Remove yourself or vote to kick a member

### Files to Create/Modify

**Create: `src/components/alliances/AllianceManagementDialog.tsx`**
- Full alliance management interface
- Tabs: Overview | Members | Stability | Actions

**Create: `src/components/alliances/CreateAllianceWizard.tsx`**
- Step 1: Name your alliance
- Step 2: Select founding members (shows relationship scores)
- Step 3: Confirm creation

**Create: `src/components/alliances/AllianceMemberCard.tsx`**
- Shows member avatar, relationship to you, role in alliance
- "Kick" button if you're founder

**Modify: `src/game-states/SocialInteractionState.ts`**
- Add alliance management actions:
  - `create_alliance`
  - `invite_to_alliance`
  - `hold_alliance_meeting`
  - `leave_alliance`

**Modify: `src/systems/alliance-system.ts`**
- Add `proposeKickMember()` method
- Add `inviteMember()` with NPC acceptance logic
- Improve `holdAllianceMeeting()` to give visual feedback

---

## Phase 3: Relationship Milestones

### Current State
- `checkRelationshipMilestones()` exists in npc-deal-proposals.ts
- Triggers NPC proposals at 25, 50, 75 thresholds
- No visual celebration or player notification

### Enhancement
Add visual feedback when crossing friendship tiers:

| Threshold | Tier Name | Visual | Unlock |
|-----------|-----------|--------|--------|
| 25+ | Acquaintance → Friend | Toast + badge | Info sharing deals |
| 50+ | Friend → Close Friend | Celebration + badge | Safety pact deals |
| 75+ | Close Friend → Ally | Confetti + badge | Partnership/F2 deals |

### Files to Create/Modify

**Create: `src/components/feedback/RelationshipMilestoneToast.tsx`**
- Animated toast with tier icon and NPC avatar
- "You and [Name] are now Close Friends!"
- Confetti effect for 75+ threshold

**Create: `src/components/houseguest/RelationshipTierBadge.tsx`**
- Small badge shown next to relationship score
- Tiers: Stranger | Acquaintance | Friend | Close Friend | Ally | Rival | Enemy

**Modify: `src/contexts/reducers/reducers/relationship-reducer.ts`**
- After relationship update, check for milestone crossing
- Emit `relationship_milestone` event via GameEventBus
- Store milestone achievements in state

**Modify: `src/components/houseguest/HouseguestDialog.tsx`**
- Display RelationshipTierBadge next to score
- Show "milestone unlocked" if crossed during session

---

## Phase 4: Deal Obligation Reminders

### Current State
- Active deals exist but player can accidentally break them
- No visual reminder during ceremonies
- Trust score suffers with no warning

### Enhancement
Show relevant deal obligations during key game moments:

**Reminder Contexts:**
- **Nomination Ceremony**: "You have a Safety Pact with Morgan - nominating them will break this deal!"
- **Veto Decision**: "You promised to use the Veto on Alex if they're on the block"
- **Voting**: "You have a Voting Block deal with Sam - vote with them to keep the deal"
- **Final Selection**: "Your Final Two deal with Jordan - take them to honor it"

### Files to Create/Modify

**Create: `src/components/deals/DealObligationBanner.tsx`**
- Warning banner shown during relevant ceremonies
- Yellow/amber styling with deal icon
- Shows deal type, partner name, consequence of breaking

**Create: `src/hooks/useDealObligations.ts`**
- Returns relevant active deals for current game phase
- Filters by deal type matching phase context
- Example: During Eviction phase, return `vote_together` deals

**Modify: `src/components/game-phases/NominationPhase.tsx`**
- Import and render DealObligationBanner
- Pass nominees-to-be for conflict checking

**Modify: `src/components/game-phases/VetoMeetingPhase.tsx`**
- Show veto_use obligation if applicable

**Modify: `src/components/game-phases/eviction/PlayerEvictionVoting.tsx`**
- Show vote_together obligation during vote casting

---

## Phase 5: Counter-Offer System

### Current State
- NPC either accepts or declines player deals
- Binary response with reasoning text
- No negotiation possible

### Enhancement
NPCs can propose alternative deals when declining:

**Counter-Offer Logic:**
1. Player proposes Final Two deal
2. NPC declines (relationship too low)
3. NPC counter-offers: "I'm not ready for that, but how about a Safety Pact instead?"
4. Player can accept counter-offer or walk away

**Counter-Offer Mapping:**
| Proposed | Counter-Offer Options |
|----------|----------------------|
| Final Two | Partnership, Safety Pact |
| Partnership | Safety Pact, Information Sharing |
| Target Agreement | Vote Together (this week) |
| Veto Use | Safety Pact |
| Alliance Invite | Partnership |

### Files to Create/Modify

**Modify: `src/systems/deal-system.ts`**
- Add `generateCounterOffer()` method
- Returns alternative deal type if NPC would decline original
- Considers relationship gap needed

**Modify: `src/components/deals/ProposeDealDialog.tsx`**
- Add `counter_offer` status state
- Show counter-offer UI with NPC's alternative
- Buttons: "Accept Counter" | "Decline & Leave"

**Modify: `src/models/deal.ts`**
- Add counter-offer type definitions
- Add `counterOfferFor` field to track original proposal

---

## Technical Architecture

### Event Flow for Milestones

```text
Player Action (Talk) 
    → player-action-reducer 
    → UPDATE_RELATIONSHIPS 
    → relationship-reducer 
    → Check milestone crossing 
    → Emit 'relationship_milestone' event 
    → GameEventBus 
    → UI subscribes → Show toast/confetti
```

### Deal Obligation Detection

```text
Phase Changes to Nomination 
    → useDealObligations hook 
    → Filter deals where:
        - type = 'safety_agreement'
        - partner in potential nominees
    → Return obligation warnings 
    → DealObligationBanner renders
```

---

## File Summary

### New Files (10)
| File | Purpose |
|------|---------|
| `src/components/dialogs/ConversationTopicDialog.tsx` | Topic selection for talk actions |
| `src/components/alliances/AllianceManagementDialog.tsx` | Full alliance management UI |
| `src/components/alliances/CreateAllianceWizard.tsx` | Alliance creation flow |
| `src/components/alliances/AllianceMemberCard.tsx` | Individual member display |
| `src/components/feedback/RelationshipMilestoneToast.tsx` | Milestone celebration toast |
| `src/components/houseguest/RelationshipTierBadge.tsx` | Tier indicator badge |
| `src/components/deals/DealObligationBanner.tsx` | Ceremony obligation warnings |
| `src/hooks/useDealObligations.ts` | Obligation detection logic |
| `src/models/conversation-topic.ts` | Topic type definitions |
| `src/models/relationship-tier.ts` | Tier definitions and thresholds |

### Modified Files (12)
| File | Changes |
|------|---------|
| `src/game-states/social/handlers/talkHandler.ts` | Add topic parameter support |
| `src/game-states/SocialInteractionState.ts` | Add alliance management actions |
| `src/systems/alliance-system.ts` | Add invite, kick, improved meeting logic |
| `src/systems/deal-system.ts` | Add counter-offer generation |
| `src/contexts/reducers/reducers/player-action-reducer.ts` | Handle topic-based talk, alliance actions |
| `src/contexts/reducers/reducers/relationship-reducer.ts` | Milestone detection and event emission |
| `src/components/deals/ProposeDealDialog.tsx` | Counter-offer UI flow |
| `src/components/houseguest/HouseguestDialog.tsx` | Add tier badge display |
| `src/components/game-phases/NominationPhase.tsx` | Add obligation banner |
| `src/components/game-phases/VetoMeetingPhase.tsx` | Add obligation banner |
| `src/components/game-phases/eviction/PlayerEvictionVoting.tsx` | Add obligation banner |
| `src/components/game-phases/social-interaction/sections/ConversationsSection.tsx` | Open topic dialog |

---

## Implementation Order

1. **Phase 3: Relationship Milestones** (2-3 changes)
   - Quickest win, adds visual polish
   - Foundation for other features

2. **Phase 4: Deal Obligation Reminders** (4 changes)
   - High value for gameplay clarity
   - Prevents accidental betrayals

3. **Phase 1: Conversation Topics** (4 changes)
   - Core social improvement
   - Adds meaningful choice

4. **Phase 5: Counter-Offers** (3 changes)
   - Enhances deal negotiation
   - Builds on existing deal UI

5. **Phase 2: Alliance Management** (5 changes)
   - Largest feature
   - Complete social system overhaul

---

## Success Metrics

- Players have 3+ conversation topic choices per houseguest
- Relationship milestone toasts appear at 25/50/75 thresholds
- Deal obligations shown during 100% of relevant ceremonies
- NPCs offer counter-deals in ~40% of declined proposals
- Alliance management available with create/invite/meeting actions
