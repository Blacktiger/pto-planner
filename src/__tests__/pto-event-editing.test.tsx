// Feature: pto-event-editing, Property 3: Total hours preview is always consistent with inputs
// Feature: pto-event-editing, Property 1: Edit form pre-population

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { eachDayOfInterval, isWeekend, parseISO } from 'date-fns';
import { calculateTotalHours } from '@/utils/pto-calc';
import { render, screen } from '@testing-library/react';
import { EditPTOEntryForm } from '@/components/EditPTOEntryForm';
import type { PTOEntry } from '@/types/pto';

// Mock @/lib/db to avoid IndexedDB errors in the test environment
vi.mock('@/lib/db', () => ({
  db: {
    entries: {
      update: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

/**
 * Reference implementation: count weekday days in [startDate, endDate].
 * Used as the ground-truth in the property test.
 */
function countWeekdays(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return eachDayOfInterval({ start, end }).filter(d => !isWeekend(d)).length;
}

/**
 * Arbitrary that generates a valid ISO date string (yyyy-MM-dd)
 * within a reasonable range (2020-01-01 to 2030-12-31).
 */
const isoDateArb = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() })
  .map(ms => {
    const d = new Date(ms);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

/**
 * Arbitrary that generates a valid hoursPerDay value in [0.5, 8] in 0.5 increments.
 * There are 16 valid values: 0.5, 1.0, 1.5, ..., 8.0
 */
const hoursPerDayArb = fc
  .integer({ min: 1, max: 16 })
  .map(n => n * 0.5);

describe('PTO Event Editing', () => {
  /**
   * **Validates: Requirements 2.1**
   *
   * Property 3: Total hours preview is always consistent with inputs.
   *
   * For any valid startDate, endDate (end >= start), and hoursPerDay in [0.5, 8]
   * (multiples of 0.5), calculateTotalHours must equal weekday-count x hoursPerDay.
   */
  it('Property 3: calculateTotalHours equals weekday-count x hoursPerDay for all valid inputs', () => {
    fc.assert(
      fc.property(
        isoDateArb,
        isoDateArb,
        hoursPerDayArb,
        (dateA, dateB, hoursPerDay) => {
          // Ensure end >= start by sorting the two dates
          const startDate = dateA <= dateB ? dateA : dateB;
          const endDate = dateA <= dateB ? dateB : dateA;

          const expected = countWeekdays(startDate, endDate) * hoursPerDay;
          const actual = calculateTotalHours(startDate, endDate, hoursPerDay);

          expect(actual).toBeCloseTo(expected, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 1.2**
   *
   * Property 1: Edit form pre-population.
   *
   * For any PTOEntry, rendering EditPTOEntryForm with that entry should result in
   * each form field (startDate, endDate, hoursPerDay, description) having a value
   * that matches the entry's stored values exactly.
   *
   * hoursPerDay is stored as a number but rendered as a string in the input.
   * description may be undefined in PTOEntry -- the form initializes it to ''.
   */
  it('Property 1: EditPTOEntryForm pre-populates all fields from the entry', () => {
    // Arbitrary for a PTOEntry with valid field values
    const ptoEntryArb = fc.record<PTOEntry>({
      id: fc.integer({ min: 1, max: 100000 }),
      startDate: isoDateArb,
      endDate: isoDateArb,
      hoursPerDay: hoursPerDayArb,
      totalHours: fc.float({ min: 0, max: 400, noNaN: true }),
      description: fc.option(fc.string({ maxLength: 255 }), { nil: undefined }),
      isFullDay: fc.boolean(),
      createdAt: fc.integer({ min: 0, max: Date.now() }),
    }).map(entry => ({
      ...entry,
      // Ensure endDate >= startDate so the form renders without date-order issues
      endDate: entry.startDate <= entry.endDate ? entry.endDate : entry.startDate,
    }));

    fc.assert(
      fc.property(ptoEntryArb, (entry) => {
        const { unmount } = render(
          <EditPTOEntryForm
            entry={entry}
            onSuccess={vi.fn()}
            onCancel={vi.fn()}
          />
        );

        // startDate input
        const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
        expect(startDateInput.value).toBe(entry.startDate);

        // endDate input
        const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
        expect(endDateInput.value).toBe(entry.endDate);

        // hoursPerDay input -- stored as number, rendered as string
        const hoursInput = screen.getByLabelText(/hours per day/i) as HTMLInputElement;
        expect(hoursInput.value).toBe(String(entry.hoursPerDay));

        // description input -- undefined in PTOEntry maps to '' in the form
        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        expect(descriptionInput.value).toBe(entry.description ?? '');

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
