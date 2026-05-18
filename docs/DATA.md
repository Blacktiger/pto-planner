# Data layer

Persistence uses **Dexie** (IndexedDB) in `src/lib/db.ts`. Database name: `PTODatabase`, schema version **1**.

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

Indexes: `++id`, `startDate`, `endDate`

### `resets`

Balance anchor points.

| Field | Type | Notes |
|-------|------|-------|
| `id` | auto-increment | Primary key |
| `balance` | number | Hours on `asOfDate` |
| `asOfDate` | ISO date string | Projection starts here |
| `createdAt` | number | Unix ms |

Indexes: `++id`, `asOfDate`

**Usage today:** Components use `orderBy('id').last()` as the active reset.

### `settings`

App configuration (singleton in practice).

| Field | Type | Notes |
|-------|------|-------|
| `id` | auto-increment | Primary key |
| `accrualRate` | number | Hours per 1st/15th accrual |
| `maxBalance` | number | Cap in hours |

Indexes: `++id`

**Usage today:** `clear()` + `add()` on save—only the latest row matters.

---

## Import / export

`ImportExport` component writes/reads JSON:

```json
{
  "entries": [ /* PTOEntry[] */ ],
  "resets": [ /* BalanceReset[] */ ],
  "settings": [ /* AppSettings[] */ ]
}
```

- **Export:** Downloads `pto-planner-backup-YYYY-MM-DD.json`
- **Import:** Confirms overwrite, clears all three tables, `bulkAdd`s file contents, reloads page

No schema version field in backup files yet—add when migrations exist.

---

## Migrations

None beyond v1. When schema changes:

1. Bump `this.version(n)` in `PTODatabase`
2. Document upgrade path in this file
3. Consider backup version field in export JSON

---

## Planned: balance reconciliation writes

When implemented (see [ARCHITECTURE.md](./ARCHITECTURE.md)):

1. Insert or replace active `resets` row with new balance + `asOfDate`
2. `DELETE` from `entries` where `endDate < asOfDate` (exact predicate TBD in code review)
3. Leave entries with `endDate >= asOfDate` unchanged

Run in a Dexie transaction for atomicity.

---

## Data hook conventions (target)

| Hook | Query |
|------|--------|
| `useSortedPtoEvents` | `db.entries.orderBy('startDate').toArray()` |
| `usePtoEntries` | `db.entries.toArray()` |
| `useBalanceReset` | `db.resets.orderBy('id').last()` |
| `useAppSettings` | `db.settings.orderBy('id').last()` → `resolveSettings` |

Return `undefined` from `useLiveQuery` while loading; components/integration hooks treat `undefined` vs `null` consistently.
