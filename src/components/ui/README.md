# shadcn/ui components

This directory is the **configured install target** for [shadcn/ui](https://ui.shadcn.com) in this project.

`components.json` maps the `ui` alias to `src/components/ui`. Imports in app code use `@/components/ui/...` (TypeScript resolves `@/*` → `src/*`). That is the standard Vite + shadcn layout—not a custom move.

## Do not edit by hand

These files are generated/updated by the CLI:

```bash
npx shadcn@latest add <component>
```

Hand-edits are overwritten on add or upgrade.

## If the CLI creates a literal `@/` folder

A misconfigured CLI run can write to `@/components/ui/` at the **repo root** (a folder literally named `@`). That is a bug—delete that folder and re-run `add`, or move files into `src/components/ui/`. `components.json` uses explicit `src/...` paths so future installs land here.

## Customization

- Add new primitives with the CLI (into this directory).
- Customize behavior or styling in **`src/components/`** feature components or thin wrappers—not by forking files here.
- See [docs/STYLING.md](../../../docs/STYLING.md).
