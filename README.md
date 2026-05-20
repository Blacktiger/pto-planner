# PTO Planner

An offline-first, personal Progressive Web App (PWA) for tracking and forecasting Paid Time Off.

## Key Features
- **Deterministic Projections:** Forecasts your PTO balance up to 5 years forward based on your specific accrual rate and scheduled time off.
- **Offline First:** Data is stored locally in your browser using IndexedDB (Dexie). No accounts or cloud sync required.
- **Data Portability:** Easy JSON import and export for backups or moving data between devices.
- **Cap Forecasting:** Automatically identifies when you will hit your PTO cap and how many hours you might lose.

## Tech Stack
- **Frontend:** React (TypeScript) + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Persistence:** Dexie.js (IndexedDB)
- **Date Math:** date-fns

## Documentation
- [Architecture](./docs/ARCHITECTURE.md) — 3-layer pattern and state management
- [Domain Rules](./docs/DOMAIN.md) — How accruals and projections work
- [Data Layer](./docs/DATA.md) — Schema and query hooks
- [Testing](./docs/TESTING.md) — Our testing strategy

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Scripts
- `npm run dev`: Start dev server
- `npm run build`: Production build
- `npm run test`: Run Vitest suite
- `npm run lint`: Run ESLint
