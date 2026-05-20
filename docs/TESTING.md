# Testing Strategy

We prioritize testing business logic and orchestration to ensure the accuracy of PTO projections and the stability of the application state.

---

## 1. Domain Logic (Unit Tests)
**Location:** `src/__tests__/pto-calc.test.ts`

The domain layer contains the "math" of the application. Since these functions are pure (no side effects, no React), they are tested with standard Vitest unit tests.

- **Focus:** Accrual generation, weekday counting, projection accuracy, and cap forecasting.
- **Goal:** Exhaustive coverage of edge cases (e.g., reset date on the 15th, entries spanning multiple years, hitting the cap exactly).

---

## 2. Integration Layer (Hook Tests)
**Location:** `src/components/<Feature>/__tests__/*.test.tsx`

We test integration hooks using `react-testing-library` and a mocked or in-memory IndexedDB. These tests verify how the UI logic responds to data changes and user actions.

- **Focus:** Reducer transitions, submission lifecycles, and error handling.
- **Example:** Verify that deleting a PTO entry calls the database and updates the local state correctly.

---

## 3. Data Layer (Persistence Tests)
**Focus:** Ensuring Dexie schemas and query hooks behave as expected.
- **Pattern:** Use a temporary database name for each test suite to avoid data pollution.

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## Invariants to Test
- PTO deductions never happen on weekends.
- Accruals only happen on the 1st and 15th.
- Balance never exceeds the configured maximum.
- Initial balance reset date excludes accruals for that specific day.
