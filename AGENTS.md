# PTO Planner — Project Instructions

This project is an offline-first, personal Progressive Web App (PWA) built with React and Vite for tracking and forecasting Paid Time Off (PTO).

## Project Overview
- **Tech Stack:** React (TypeScript), Vite, Tailwind CSS, shadcn/ui, Dexie.js (IndexedDB).
- **Core Purpose:** Forecast PTO balances up to 5 years forward using semi-monthly accruals, scheduled PTO, and a configurable hours cap.
- **Data Persistence:** Local storage only via IndexedDB. Data portability is handled through JSON import/export.

## Architecture
The app follows a strict **3-layer architecture**. Maintain this separation when adding new features:

1.  **Domain Layer (`src/utils/pto-calc.ts`):**
    - Pure TypeScript logic. No React or Dexie imports.
    - Responsible for accrual generation, weekday math, and balance projections.
2.  **Data Layer (`src/data/`):**
    - Standardized hooks for IndexedDB queries using `useLiveQuery` and a `queryReducer` (`status`, `data`, `error`).
    - Standard pattern: `useLiveQuery` + `useReducer(queryReducer)`.
3.  **Integration Layer (`src/components/<Feature>/use<Feature>.ts`):**
    - Orchestrates data hooks and domain logic.
    - Manages complex UI state using `useReducer(uiReducer)`.
4.  **Presentation Layer (`src/components/`):**
    - Pure presentation components.
    - **Rule:** Every major feature MUST be in its own folder with an `index.ts`, a `<Feature>.tsx` component, and a `use<Feature>.ts` hook.

## Building and Running
- `npm install`: Install dependencies.
- `npm run dev`: Start the development server.
- `npm run build`: Production build.
- `npm run test`: Run the Vitest suite.
- `npm run lint`: Run ESLint.

## Development Conventions
- **Colocation:** Keep feature-specific hooks, types, and tests within the feature's directory (`src/components/<Feature>/`).
- **State Management:** Use `useReducer` for complex state. Separate Query state from UI state.
- **Styling:** Use Tailwind CSS. Follow [STYLING.md](./docs/STYLING.md) for UI primitives (shadcn/ui).
- **Date Math:** Use `date-fns`.
- **Invariants:**
    - Accruals happen on the 1st and 15th only.
    - PTO deductions exclude weekends.
    - Balance never exceeds the configured cap.

## Testing Strategy
- **Domain Logic:** Unit test pure functions in `src/__tests__/pto-calc.test.ts`.
- **Integration Hooks:** Test hooks in `src/components/<Feature>/__tests__/*.test.tsx` using `react-testing-library`.
- **In-Memory DB:** Use a fresh or in-memory IndexedDB for integration tests to ensure isolation.

Refer to the `docs/` directory for detailed information:
- [Architecture](./docs/ARCHITECTURE.md)
- [Domain Rules](./docs/DOMAIN.md)
- [Data Layer](./docs/DATA.md)
- [Testing](./docs/TESTING.md)
