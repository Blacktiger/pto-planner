# Domain Rules

Pure business logic lives in `src/utils/pto-calc.ts`. It has no React or database dependencies.

---

## Settings

Resolved via `resolveSettings()` with defaults from `DEFAULT_SETTINGS`:

| Field | Default | Meaning |
|-------|---------|---------|
| `accrualRate` | `8.3333333333` | Hours added each accrual period |
| `maxBalance` | `240` | Maximum storable PTO hours |

**Fixed (not configurable):** Accruals occur on the **1st and 15th** of each month only.

---

## Balance Anchor (`resets`)

Projection starts from the latest balance reset:

- `balance` — hours available on `asOfDate`.
- **Initial Event:** Every projection begins with an `initial` event on the `asOfDate` to show the starting state.
- **Accrual Exclusion:** To prevent double-counting, any regular accrual scheduled for the *same day* as the `asOfDate` is excluded. Accruals only begin **strictly after** the reset date.

---

## Accrual Events

`generateAccrualEvents(startDate, endDate, settings)`:

1. Walk each month from `startOfMonth(startDate)` through `endDate`.
2. For each month, consider the 1st and the 15th (15th = start of month + 14 days).
3. Include a date if it is **strictly after** `startDate` and on or before `endDate`.
4. Each event adds `settings.accrualRate` hours.

---

## PTO Entries

Each `PTOEntry` represents a date range. For projection, each **weekday** in the range that falls after the reset date generates a deduction event of `hoursPerDay`.

**Weekends are skipped.** Holidays are not automatically modeled; users should adjust date ranges manually to account for them.

---

## Event Types & Ordering

| Type | Meaning |
|------|---------|
| `initial` | The starting balance on the reset date |
| `accrual` | Semi-monthly hours addition |
| `pto` | Hours deduction for a single day of time off |

**Ordering on the same date:** `accrual` events apply **before** `pto` deductions. This ensures that if you hit the cap on an accrual day but also take PTO, the cap loss is calculated correctly first.

---

## Cap Handling

When an accrual would push the balance above `settings.maxBalance`:
- The balance is clamped to the maximum.
- The overflow is recorded as `lostAmount`.

`forecastCapDate()` projects up to five years forward and returns the first date where balance would be lost to the cap.

---

## API Surface

| Function | Purpose |
|----------|---------|
| `calculateTotalHours` | Counts weekdays in a range |
| `generateAccrualEvents` | Returns accrual timeline slices |
| `calculateProjectedBalance` | Builds full timeline + final stats |
| `forecastCapDate` | Identifies first cap-loss date |
