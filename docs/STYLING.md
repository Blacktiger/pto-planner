# Styling Conventions

We use **Tailwind CSS utilities in TSX**, **shadcn/ui primitives**, and small **feature components** for reuse.

---

## Principles

### 1. Tailwind Utilities
Use utility classes directly in feature components. Use the `cn()` utility from `@/lib/utils` to merge conditional classes safely.

### 2. shadcn/ui Primitives
Installed via `npx shadcn@latest add <component>` into `src/components/ui/`. Compose these primitives in feature code (e.g., `Card`, `Button`, `Alert`).

### 3. Reuse via Components
Prefer React components over CSS files or `@apply`. Shared UI patterns like `StatCard` and `SectionCard` live in `src/components/`.

---

## Theming

- **Theme Engine:** `next-themes` manages the `class` on the `<html>` element.
- **Variables:** CSS variables in `src/index.css` define semantic tokens like `--background` and `--primary`.
- **Dark Mode:** Use Tailwind's `dark:` modifier or semantic tokens to ensure automatic dark mode support.

---

## File Layout

Features are colocated in folders. Shared UI primitives and wrappers are kept separate.

```
src/
  index.css              # Global styles + theme variables
  components/
    ui/                  # shadcn primitives (Alert, Button, etc.)
    Dashboard/           # Feature folder
      Dashboard.tsx      # Presentation
      useDashboard.ts    # Integration logic
    PTOList/             # Feature folder
      PTOList.tsx
      usePtoList.ts
    stat-card.tsx        # Shared layout wrapper
    section-card.tsx     # Shared layout wrapper
    theme-toggle.tsx     # Theme switcher
```

---

## Adding Components

When adding new UI primitives:
```bash
npx shadcn@latest add <name>
```

When creating new features, follow the **colocated folder pattern** with a dedicated integration hook.
