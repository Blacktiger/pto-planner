# Data Layer

Persistence uses **Dexie** (IndexedDB) in `src/lib/db.ts`.

---

## Tables

### `entries`
PTO time-off records.

| Field | Type | Notes |
|-------|------|-------|
| `id` | auto-increment | Primary key |
| `startDate` | ISO date string | `yyyy-MM-dd` |
| `endDate` | ISO date string | Inclusive |
| `hoursPerDay` | number | Weekday deduction amount |
| `totalHours` | number | Precomputed weekdays × hoursPerDay |
| `description` | string? | Optional label |
| `isFullDay` | boolean | `hoursPerDay >= 8` at entry time |
| `createdAt` | number | Unix ms |

### `resets`
Balance anchor points.

| Field | Type | Notes |
|-------|------|-------|
| `id` | auto-increment | Primary key |
| `balance` | number | Hours on `asOfDate` |
| `asOfDate` | ISO date string | Projection starts here |
| `createdAt` | number | Unix ms |

### `settings`
App configuration (singleton in practice).

| Field | Type | Notes |
|-------|------|-------|
| `id` | auto-increment | Primary key |
| `accrualRate` | number | Hours per 1st/15th accrual |
| `maxBalance` | number | Cap in hours |

---

## Standardized Query Pattern

All database queries are wrapped in hooks under `src/data/` using a standardized reducer. This ensures UI components have consistent access to loading and error states.

### Query State
```typescript
export type QueryStatus = 'loading' | 'success' | 'error';

export interface QueryState<T> {
  status: QueryStatus;
  data: T | null;
  error: Error | null;
}
```

### Hooks Index

| Hook | Table | Query |
|------|-------|-------|
| `useSortedPtoEvents` | `entries` | `db.entries.orderBy('startDate').toArray()` |
| `useBalanceReset` | `resets` | `db.resets.orderBy('id').last()` |
| `useAppSettings` | `settings` | `db.settings.orderBy('id').last()` + `resolveSettings` |
| `useProjectedBalance` | multiple | Derived projection from resets, entries, and settings |

---

## Import / Export

The `ImportExport` feature writes/reads a JSON backup:

```json
{
  "entries": [ /* PTOEntry[] */ ],
  "resets": [ /* BalanceReset[] */ ],
  "settings": [ /* AppSettings[] */ ]
}
```

- **Export:** Downloads `pto-planner-backup-YYYY-MM-DD.json`.
- **Import:** Overwrites current data after user confirmation and reloads the application.

---

## Transactions

Mutations involving multiple tables (like Import or the planned Balance Reconciliation) must use Dexie transactions to ensure atomicity:

```typescript
await db.transaction('rw', db.entries, db.resets, db.settings, async () => {
  // logic here
});
```
