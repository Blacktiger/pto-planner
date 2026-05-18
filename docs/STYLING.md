# Styling conventions

How we style the app: **co-located CSS per component**, semantic class names, untouched shadcn primitives, and thin wrappers when we need customized UI kit behavior.

---

## Principles

### 1. No Tailwind utility strings in feature TSX

**Do not** put Tailwind class strings in application components (`src/App.tsx`, `src/components/**` outside `ui/`).

**Instead:** use **semantic class names** defined in a **CSS file beside the component** (e.g. `Dashboard.tsx` + `Dashboard.css`).

```tsx
// Dashboard.tsx
<main className="dashboard-grid">...</main>
```

```css
/* Dashboard.css */
@layer components {
  .dashboard-grid {
    @apply grid grid-cols-1 md:grid-cols-2 gap-4;
  }
}
```

**Exception:** `src/components/ui/**` — shadcn-generated components keep their Tailwind utilities. Do not edit those files.

### 2. One CSS file per component (co-located)

Each feature component has a sibling stylesheet:

```
src/components/
  Dashboard/
    Dashboard.tsx      # future folder layout
    Dashboard.css
  Dashboard.tsx          # current flat layout — css still beside tsx
  Dashboard.css
```

**Naming:** prefix classes with the feature (`dashboard-grid`, `timeline-row`), not generic globals (`grid`, `row`) unless shared.

**Shared styles** used by multiple features live in `src/styles/shared.css` (icons, form layout, `content-narrow`, etc.)—keep this file small.

### 3. Register new stylesheets

Co-located files are aggregated in `src/styles/index.css`, which is imported from `src/index.css` after the `@tailwind` directives. This ensures Tailwind processes `@apply` correctly.

When you add `MyFeature.css`:

1. Create `src/components/MyFeature.css` (or `src/components/MyFeature/MyFeature.css`).
2. Add `@import "../components/MyFeature.css";` to `src/styles/index.css`.

Do **not** import feature CSS directly from TSX today—standalone imports skip the Tailwind pipeline and break `@layer components`. Registration in `styles/index.css` is required until we adopt a different bundling approach.

### 4. Do not edit shadcn-generated components

Files under `src/components/ui/` are owned by the [shadcn/ui](https://ui.shadcn.com) CLI. Treat them as **vendor code**:

- **Do not** hand-edit them for project-specific styling or behavior.
- **Do** re-run `npx shadcn@latest add <component>` to add or refresh components.
- **Do** build **wrappers** in `src/components/app/` when you need different defaults or project-specific classes.

```tsx
// src/components/app/AppTabTrigger.tsx
import { TabsTrigger } from '@/components/ui/tabs';

export function AppTabTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
  return <TabsTrigger className={cn('app-tab-trigger', className)} {...props} />;
}
```

```css
/* src/App.css */
@layer components {
  .app-tab-trigger {
    @apply px-4 py-2 flex items-center gap-2 data-[state=active]:bg-muted;
  }
}
```

### 5. Wrappers vs. semantic classes

| Need | Approach |
|------|----------|
| Layout, feature sections, typography | Classes in `Feature.css` |
| Different default variant/size for shadcn | Wrapper in `components/app/` |
| Shared form/icon/layout primitives | `src/styles/shared.css` |
| New primitive from shadcn | `npx shadcn add` → wrap, do not fork `ui/` |

### 6. Conditional / state classes

Avoid template-literal Tailwind in TSX:

```tsx
// Prefer
className={cn('app-mobile-nav-item', active && 'app-mobile-nav-item--active')}
```

Define modifiers in the same CSS file as the base class (`App.css` for shell, etc.).

---

## File layout

```
src/
  index.css                 # @tailwind + @import styles/index.css
  App.tsx
  App.css
  styles/
    index.css               # registry of all feature stylesheets
    shared.css              # cross-feature primitives only
  components/
    Dashboard.tsx
    Dashboard.css
    ui/                     # shadcn — do not edit
    app/                    # shadcn wrappers
```

---

## Adding styles for a new component

1. Create `ComponentName.css` next to `ComponentName.tsx`.
2. Use `@layer components { .component-name-* { @apply ... } }`.
3. Register the file in `src/styles/index.css`.
4. Use only semantic class names in the TSX.
5. Run `npm run build` to verify Tailwind picks up the file.

---

## shadcn workflow

```bash
npx shadcn@latest add button
```

See `src/components/ui/README.md`.

---

## Migration status

Existing feature components still contain inline Tailwind. **New and touched code** should add/use co-located CSS. Refactor opportunistically.

| Area | Status |
|------|--------|
| `src/components/ui/*` | shadcn Tailwind (allowed, do not edit) |
| Co-located `*.css` files | Scaffolded for main features |
| Feature TSX using semantic classes | Migrate over time |

---

## Related

- [ARCHITECTURE.md](./ARCHITECTURE.md) — component layers and folder structure
