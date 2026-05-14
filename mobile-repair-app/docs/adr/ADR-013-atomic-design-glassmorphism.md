# ADR-013: Atomic Design System with Glassmorphism Theme

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** UI Architecture & Design System

---

## Context

Per **SaaS Blueprint §2**: "The UI must feel high-end, modern, and trust-inspiring. If the design looks like a basic MVP, it is considered a failure." Per **Master Guidelines Phase 3**: "Aesthetics drive adoption. We deliver pixel-perfect, premium user experiences." The implementation plan specifies Atomic Design methodology from `Architecture.md`.

The application serves 3 distinct user roles, each requiring a visually differentiated but cohesive experience.

## Decision

Implement an **Atomic Design System** (Atoms → Molecules → Organisms → Pages) with a **dark-mode glassmorphism theme** and **role-based color palettes**.

### Design Tokens

```typescript
// Color Palette (Dark Mode First)
background: '#0F1117'
surface: '#1A1D2E'
surfaceElevated: '#242842'
textPrimary: '#F4F6FA'
textSecondary: '#9BA3AE'
textMuted: '#5C6370'

// Role-Specific Accents
customer:   { primary: '#206BC4', accent: '#4A8EEC', gradient: ['#206BC4', '#4A8EEC'] }
technician: { primary: '#D97706', accent: '#F59E0B', gradient: ['#D97706', '#F59E0B'] }
tenant:     { primary: '#7C3AED', accent: '#A78BFA', gradient: ['#7C3AED', '#8B5CF6', '#A78BFA'] }

// Spacing Scale (4-point grid)
xxs: 2, xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48

// Typography (Inter font family)
h1: 28px/700, h2: 24px/700, h3: 20px/600, h4: 17px/600
body: 15px/400, bodySmall: 13px/400, caption: 11px/500, overline: 10px/700
```

### Component Hierarchy (Atomic Design)

```
ATOMS (src/components/ui/)
├── button.tsx          — Animated press with variants (primary, secondary, ghost, danger)
├── input.tsx           — Styled input with label, error state, validation
├── badge.tsx           — Status badges (success, warning, info, danger, neutral)
├── stat-card.tsx       — Analytics metric card with trend indicator
├── glass-view.tsx      — Glassmorphism container (blur + transparency)
├── haptic-press.tsx    — Pressable with haptic feedback wrapper
└── shimmer.tsx         — Loading skeleton placeholder

MOLECULES (composed from atoms)
├── form-field.tsx      — Label + Input + Error message
├── job-card.tsx        — Job summary with status badge + priority
├── invoice-line-item.tsx — Editable row with description, qty, price
└── step-indicator.tsx  — Multi-step progress dots

ORGANISMS (composed from molecules)
├── booking-form.tsx    — Complete multi-step booking
├── repair-timeline.tsx — Job progress timeline with pulse
└── invoice-editor.tsx  — Full invoice builder with add/remove/lock

PAGES (app/ directory)
├── login.tsx, register.tsx
├── customer/index.tsx, booking.tsx, track/[id].tsx, invoices.tsx
├── technician/index.tsx, job/[id].tsx, invoice/[id].tsx
└── tenant/index.tsx, technicians.tsx, jobs.tsx
```

### Glassmorphism Implementation

```typescript
// GlassView component — frosted glass effect
<BlurView intensity={20} tint="dark">
  <View style={{
    backgroundColor: 'rgba(26, 29, 46, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  }}>
    {children}
  </View>
</BlurView>
```

### Micro-Animations

All interactive elements use `react-native-reanimated` for 60fps native-thread animations:
- **FadeInDown/FadeInUp** — Screen entry animations with spring physics
- **Layout animations** — Smooth item reordering in lists
- **Pulse animation** — Live status indicator on tracking screen
- **Haptic feedback** — Every tap provides tactile confirmation via `expo-haptics`

## Consequences

### Benefits
- **Premium feel** — Dark mode + glassmorphism + micro-animations creates a high-end user experience.
- **Role differentiation** — Color palettes instantly communicate which role is active (blue=customer, amber=tech, purple=tenant).
- **Consistency** — Atomic design enforces reuse. All buttons, inputs, cards share the same visual DNA.
- **Testability** — Per SaaS Blueprint §6, every component has `data-testid` attributes for Playwright automation.

### Risks & Mitigations
- **Performance** — Blur effects and animations can cause frame drops on low-end devices. Mitigated by conditional blur (fall back to solid background on older hardware).
- **Dark mode only** — No light mode currently. Mitigated by designing a light theme variant for V2 using the same token system.

## References
- SaaS Blueprint — §2: Premium Aesthetics
- Master Guidelines — Phase 3: UI/UX Engineering & Design Systems
- Implementation Plan — §2: Design System (Atomic: Atoms)
