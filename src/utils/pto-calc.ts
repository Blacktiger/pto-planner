import { 
  parseISO, 
  format, 
  addMonths, 
  isBefore, 
  isAfter, 
  isSameDay, 
  startOfMonth,
  addDays,
  isWeekend,
  eachDayOfInterval
} from 'date-fns';
import type { TimelineEvent, BalanceReset, PTOEntry, AppSettings } from '../types/pto';

/**
 * Calculates the total PTO hours for a date range by counting weekday days
 * and multiplying by hoursPerDay.
 *
 * @param startDate - ISO date string (yyyy-MM-dd)
 * @param endDate   - ISO date string (yyyy-MM-dd)
 * @param hoursPerDay - Hours of PTO taken per working day
 * @returns Total hours, or 0 if the range is invalid or contains no weekdays
 */
export function calculateTotalHours(
  startDate: string,
  endDate: string,
  hoursPerDay: number
): number {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (end < start) return 0;
    let workDays = 0;
    eachDayOfInterval({ start, end }).forEach(date => {
      if (!isWeekend(date)) workDays++;
    });
    return workDays * hoursPerDay;
  } catch {
    return 0;
  }
}

export type PTOCalcSettings = Pick<AppSettings, 'accrualRate' | 'maxBalance'>;

export const DEFAULT_SETTINGS: PTOCalcSettings = {
  accrualRate: 8.3333333333,
  maxBalance: 240,
};

/** @deprecated Use DEFAULT_SETTINGS.accrualRate */
export const ACCRUAL_RATE = DEFAULT_SETTINGS.accrualRate;
/** @deprecated Use DEFAULT_SETTINGS.maxBalance */
export const MAX_BALANCE = DEFAULT_SETTINGS.maxBalance;

export function resolveSettings(settings?: Partial<PTOCalcSettings> | null): PTOCalcSettings {
  return {
    accrualRate: settings?.accrualRate ?? DEFAULT_SETTINGS.accrualRate,
    maxBalance: settings?.maxBalance ?? DEFAULT_SETTINGS.maxBalance,
  };
}

export function generateAccrualEvents(
  startDate: string,
  endDate: string,
  settings: PTOCalcSettings = DEFAULT_SETTINGS
): Partial<TimelineEvent>[] {
  const events: Partial<TimelineEvent>[] = [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  let iter = startOfMonth(start);
  while (isBefore(iter, end) || isSameDay(iter, end)) {
    const day1 = startOfMonth(iter);
    const day15 = addDays(day1, 14);

    [day1, day15].forEach(date => {
      if ((isAfter(date, start) || isSameDay(date, start)) && 
          (isBefore(date, end) || isSameDay(date, end))) {
        events.push({
          type: 'accrual',
          date: format(date, 'yyyy-MM-dd'),
          amount: settings.accrualRate,
          description: `Accrual for ${format(date, 'MMM d')}`
        });
      }
    });

    iter = addMonths(iter, 1);
  }

  return events.sort((a, b) => a.date!.localeCompare(b.date!));
}

export function calculateProjectedBalance(
  reset: BalanceReset,
  entries: PTOEntry[],
  targetDate: string,
  settings: PTOCalcSettings = DEFAULT_SETTINGS
) {
  let currentBalance = reset.balance;
  let totalLost = 0;
  const timeline: TimelineEvent[] = [];

  const rawEvents: Partial<TimelineEvent>[] = [
    ...generateAccrualEvents(reset.asOfDate, targetDate, settings)
  ];

  entries.forEach(entry => {
    const start = parseISO(entry.startDate);
    const end = parseISO(entry.endDate);
    
    const resetDate = parseISO(reset.asOfDate);
    const target = parseISO(targetDate);

    if (isBefore(end, resetDate)) return;

    eachDayOfInterval({ start, end }).forEach(date => {
      if (isBefore(date, resetDate)) return;
      if (isAfter(date, target)) return;
      
      if (isWeekend(date)) return;

      rawEvents.push({
        type: 'pto',
        date: format(date, 'yyyy-MM-dd'),
        amount: entry.hoursPerDay,
        description: entry.description || 'PTO'
      });
    });
  });

  rawEvents.sort((a, b) => {
    if (a.date !== b.date) return a.date!.localeCompare(b.date!);
    if (a.type === 'accrual' && b.type === 'pto') return -1;
    if (a.type === 'pto' && b.type === 'accrual') return 1;
    return 0;
  });

  rawEvents.forEach(event => {
    if (event.type === 'accrual') {
      const added = event.amount!;
      const potentialBalance = currentBalance + added;
      let lost = 0;
      if (potentialBalance > settings.maxBalance) {
        lost = potentialBalance - settings.maxBalance;
        currentBalance = settings.maxBalance;
      } else {
        currentBalance = potentialBalance;
      }
      totalLost += lost;
      
      timeline.push({
        ...event,
        balanceAfter: currentBalance,
        lostAmount: lost
      } as TimelineEvent);
    } else if (event.type === 'pto') {
      currentBalance -= event.amount!;
      timeline.push({
        ...event,
        balanceAfter: currentBalance
      } as TimelineEvent);
    }
  });

  return {
    finalBalance: currentBalance,
    totalLost,
    timeline
  };
}

export function forecastCapDate(
  reset: BalanceReset,
  entries: PTOEntry[],
  settings: PTOCalcSettings = DEFAULT_SETTINGS
) {
  const maxDate = addMonths(parseISO(reset.asOfDate), 60);
  const targetDateStr = format(maxDate, 'yyyy-MM-dd');
  
  const { timeline } = calculateProjectedBalance(reset, entries, targetDateStr, settings);
  
  const capEvent = timeline.find(e => e.type === 'accrual' && (e.lostAmount || 0) > 0);
  return capEvent ? capEvent.date : null;
}
