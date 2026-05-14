# ADR-002: Adopt React Native + Expo Managed Workflow

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Mobile Framework

---

## Context

The Revivix platform requires a cross-platform mobile application serving 3 user roles (Customer, Technician, Tenant Owner) on both iOS and Android. Per **Master Guidelines Phase 2**, mobile applications should use either React Native or Flutter for "seamless cross-platform native iOS/Android delivery."

Key requirements:
- Cross-platform code sharing (single codebase → iOS + Android)
- Native device capabilities: camera, haptics, geolocation, push notifications
- Premium UI with smooth animations (60fps)
- File-based routing for clean navigation architecture
- Rapid build and distribution pipeline (EAS Build)
- Team familiarity with React/TypeScript ecosystem

## Decision

Adopt **React Native** with **Expo SDK 54** in **managed workflow** mode as the mobile framework.

### Specific Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Expo SDK 54 (managed) | No native code ejection required; full access to Expo modules |
| Navigation | expo-router v6 | File-based routing aligned with modern web conventions |
| Animations | react-native-reanimated v4 | 60fps native-thread animations |
| Gestures | react-native-gesture-handler v2 | Native gesture system for swipes, pans |
| Lists | @shopify/flash-list v2 | Performant virtualized lists for job/invoice feeds |
| Images | expo-image | Efficient image loading with caching |
| Camera | expo-image-picker | Photo capture for device damage documentation |
| Haptics | expo-haptics | Tactile feedback for premium UX |

## Consequences

### Benefits
- **Single codebase** — ~95% code sharing between iOS and Android, reducing development time by approximately 40% vs. native dual-platform development.
- **Expo managed workflow** — No Xcode/Android Studio configuration. Builds are handled by EAS Build cloud infrastructure.
- **OTA updates** — Non-native changes can be pushed via `expo-updates` without App Store resubmission.
- **TypeScript-first** — Full type safety across the entire codebase (strict mode enabled).
- **Ecosystem alignment** — Supabase JS SDK, Zustand, TanStack Query all have first-class React support.

### Risks & Mitigations
- **Native module limitations** — Some advanced native features (e.g., Bluetooth, custom native views) require ejection to bare workflow. Current feature set is fully supported by Expo modules. Mitigated by continuous evaluation of the Expo module ecosystem.
- **Bundle size** — React Native bundles are larger than native apps (~15-25MB). Mitigated by tree-shaking, code splitting, and lazy loading screens.
- **Build times** — EAS cloud builds take 15-25 minutes. Mitigated by using development builds locally during development.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Flutter** | Master Guidelines Phase 2 lists Flutter as the primary mobile choice. However, the team's existing expertise is in React/TypeScript. Flutter would require Dart ramp-up time. Additionally, Supabase's JS SDK is more mature than the Dart SDK. Decision may be revisited for future projects. |
| **React Native (bare workflow)** | Adds complexity of managing native iOS/Android project files. Not justified given current feature requirements are fully met by Expo managed workflow. |
| **Native iOS (Swift) + Native Android (Kotlin)** | Double development effort, double maintenance cost, no code sharing. Rejected per cost-efficiency requirements. |
| **Progressive Web App (PWA)** | Lacks native capabilities (haptics, push notifications, camera access) critical for technician field workflows. |

## References
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- Master Guidelines — Phase 2: Solution Architecture & Tech Stack Matrix
- Master Guidelines — Phase 3: UI/UX Engineering & Design Systems
- SaaS Blueprint — §5: Technology Stack & Architecture
