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
import type { TimelineEvent, BalanceReset, PTOEntry } from '../types/pto';

export const ACCRUAL_RATE = 8.3333333333;
export const MAX_BALANCE = 240;

export function generateAccrualEvents(startDate: string, endDate: string): Partial<TimelineEvent>[] {
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
          amount: ACCRUAL_RATE,
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
  targetDate: string
) {
  let currentBalance = reset.balance;
  let totalLost = 0;
  const timeline: TimelineEvent[] = [];

  const rawEvents: Partial<TimelineEvent>[] = [
    ...generateAccrualEvents(reset.asOfDate, targetDate)
  ];

  entries.forEach(entry => {
    const start = parseISO(entry.startDate);
    const end = parseISO(entry.endDate);
    
    // Check if entry is within reset date and target date range
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

  // Sort by date, then by type (accrual first)
  rawEvents.sort((a, b) => {
    if (a.date !== b.date) return a.date!.localeCompare(b.date!);
    // Same day: accrual comes before pto
    if (a.type === 'accrual' && b.type === 'pto') return -1;
    if (a.type === 'pto' && b.type === 'accrual') return 1;
    return 0;
  });

  rawEvents.forEach(event => {
    if (event.type === 'accrual') {
      const added = event.amount!;
      const potentialBalance = currentBalance + added;
      let lost = 0;
      if (potentialBalance > MAX_BALANCE) {
        lost = potentialBalance - MAX_BALANCE;
        currentBalance = MAX_BALANCE;
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

export function forecastCapDate(reset: BalanceReset, entries: PTOEntry[]) {
  const maxDate = addMonths(parseISO(reset.asOfDate), 60); // 5 years
  const targetDateStr = format(maxDate, 'yyyy-MM-dd');
  
  const { timeline } = calculateProjectedBalance(reset, entries, targetDateStr);
  
  const capEvent = timeline.find(e => e.type === 'accrual' && (e.lostAmount || 0) > 0);
  return capEvent ? capEvent.date : null;
}
