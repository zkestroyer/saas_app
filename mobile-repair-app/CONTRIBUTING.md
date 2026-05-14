# Contributing to Revivix

Thank you for your interest in contributing to Revivix! 🎉

---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/revivix.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run checks: `npx tsc --noEmit && npx jest`
7. Commit with a descriptive message
8. Push and create a Pull Request

---

## Development Guidelines

### Code Style
- **TypeScript**: All code must be TypeScript with strict mode
- **Naming**: PascalCase for components/types, camelCase for functions/variables
- **Files**: kebab-case for filenames (e.g., `auth-service.ts`)
- **Imports**: Absolute imports via `src/` path alias

### Architecture Rules
- All database operations go through the **service layer** (`src/services/`)
- State management follows the **Zustand + TanStack Query split** (ADR-004)
- All mutations must log to the **audit trail** (ADR-011)
- **Never hard-delete** records — use soft deletes with `deleted_at` (ADR-007)
- Invoice mutations must check **is_locked** before proceeding (ADR-008)

### Component Standards
- Use the **atomic design system** — atoms in `src/components/ui/`
- All interactive elements must have a `testID` prop
- Use **Reanimated** for animations, **Haptics** for feedback
- Follow the **glassmorphism** design language (ADR-013)

---

## Pull Request Process

1. Ensure TypeScript compiles with zero errors
2. Add/update tests for new functionality
3. Update documentation if adding new features
4. Fill out the PR template
5. Request review from at least one team member

---

## Commit Message Format

```
type(scope): description

Examples:
feat(auth): add forgot password screen
fix(invoice): prevent locked invoice modification
docs(adr): add ADR-015 for push notifications
chore(deps): update expo to 54.1
```

---

## Architecture Decision Records

If your change involves a significant architectural decision, create a new ADR in `docs/adr/` following the MADR template. See existing ADRs for reference.

---

## Questions?

- Open an issue for bugs or feature requests
- Email support@revivix.app for general questions
