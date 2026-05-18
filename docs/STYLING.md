# Styling conventions

We use **Tailwind CSS utilities in TSX**, **shadcn/ui primitives**, and small **feature components** for reuse. This matches how Tailwind and shadcn are designed to work.

---

## Principles

### 1. Tailwind utilities in feature components

Use utility classes directly in `src/components/**/*.tsx` (outside `ui/`):

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
```

Use `cn()` from `@/lib/utils` to merge conditional classes:

```tsx
className={cn('text-sm', isActive && 'text-primary')}
```

### 2. shadcn/ui primitives (`src/components/ui/`)

- Installed via `npx shadcn@latest add <component>` into **`src/components/ui/`** (see `components.json` aliases).
- **Do not hand-edit** generated files; re-add or diff via CLI when updating.
- Compose primitives in feature code: `Card`, `Button`, `Alert`, `Tabs`, etc.

### 3. Reuse via React components, not CSS files

| Pattern | Use for |
|---------|---------|
| `StatCard`, `SectionCard` | Repeated card layouts |
| `cn()` | Conditional / merged classes |
| shadcn `Alert`, `AlertDialog` | Warnings and confirmations |
| `ThemeToggle` + `ThemeProvider` | Light / dark / system |

Avoid separate `.css` files with `@apply` unless there is a strong reason.

### 4. Theming

- CSS variables in `src/index.css` (`:root` and `.dark`).
- `tailwind.config.js` uses `darkMode: ["class"]`.
- `next-themes` toggles the `class` on `<html>` via `ThemeProvider` in `main.tsx`.
- Prefer semantic tokens (`bg-background`, `text-muted-foreground`) over hard-coded colors so dark mode works automatically.

### 5. Confirmations

Use **`AlertDialog`** instead of `window.confirm()` for destructive actions.

---

## Adding a shadcn component

```bash
npx shadcn@latest add <name>
```

Ensure `components.json` uses explicit paths (`src/components/ui`, not `@/components/ui`) so the CLI does not create a literal `@/` folder at the repo root.

---

## File layout

```
src/
  index.css              # Tailwind + theme variables
  components/
    ui/                  # shadcn generated — do not edit
    stat-card.tsx        # shared feature components
    section-card.tsx
    theme-provider.tsx
    theme-toggle.tsx
    Dashboard.tsx        # feature screens
```

---

## Related

- [ARCHITECTURE.md](./ARCHITECTURE.md)
