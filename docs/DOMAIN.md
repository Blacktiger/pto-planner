# Domain rules

Pure business logic lives in `src/utils/pto-calc.ts` (future home: `src/domain/`). It has no React or database dependencies.

---

## Settings

Resolved via `resolveSettings()` with defaults from `DEFAULT_SETTINGS`:

| Field | Default | Meaning |
|-------|---------|---------|
| `accrualRate` | `8.3333333333` | Hours added each accrual period |
| `maxBalance` | `240` | Maximum storable PTO hours |

Stored in IndexedDB `settings` table; edited in Settings UI.

**Fixed (not configurable):** Accruals occur on the **1st and 15th** of each month only.

---

## Balance anchor (`resets`)

Projection starts from the latest balance reset:

- `balance` — hours available on `asOfDate`
- Events before `asOfDate` are ignored when building the timeline from the reset forward

Today, initial setup clears and inserts one reset. **Planned:** reconciliation updates reset and prunes old entries (see [ARCHITECTURE.md](./ARCHITECTURE.md#4-balance-reconciliation-planned-feature)).

---

## Accrual events

`generateAccrualEvents(startDate, endDate, settings)`:

1. Walk each month from `startOfMonth(startDate)` through `endDate`.
2. For each month, consider the 1st and the 15th (15th = start of month + 14 days).
3. Include a date if it falls within `[startDate, endDate]` (inclusive).
4. Each event adds `settings.accrualRate` hours.

---

## PTO entries

Each `PTOEntry` has `startDate`, `endDate`, `hoursPerDay`, and precomputed `totalHours`.

For projection, each **weekday** in `[startDate, endDate]` that is on or after the reset date and on or before the target date generates a deduction event of `hoursPerDay` hours.

**Weekends are skipped.** Holidays are not modeled—narrow or shift date ranges manually if needed.

---

## Event ordering

All accrual and PTO events are sorted by date. On the **same date**, accruals run **before** PTO deductions.

This matters near the cap: accrual can push balance to the max and record `lostAmount` before PTO reduces balance the same day.

---

## Cap handling

When an accrual would push balance above `settings.maxBalance`:

- Balance is clamped to `maxBalance`
- `lostAmount` = overflow hours (counted in `totalLost`)
- Timeline event includes `lostAmount` for display

`forecastCapDate()` projects up to five years from the reset date and returns the first accrual date with `lostAmount > 0`, or `null`.

---

## API surface (functions)

| Function | Purpose |
|----------|---------|
| `generateAccrualEvents` | Accrual timeline slices |
| `calculateProjectedBalance` | Full timeline + `finalBalance` + `totalLost` |
| `forecastCapDate` | First cap-hit date |
| `resolveSettings` | Merge stored settings with defaults |

All projection functions accept optional `PTOCalcSettings` (default `DEFAULT_SETTINGS`).

---

## Dashboard warnings

UI uses `maxBalance - 10` as the “nearing cap” threshold. That constant is presentation policy, not domain—could move to settings later.
