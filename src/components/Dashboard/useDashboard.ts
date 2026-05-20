import { useAppSettings } from '@/data/settings/useAppSettings';
import { useBalanceReset } from '@/data/balance/useBalanceReset';
import { useSortedPtoEvents } from '@/data/ptoEvents/useSortedPtoEvents';
import { calculateProjectedBalance, forecastCapDate } from '@/utils/pto-calc';
import { format, isAfter, parseISO } from 'date-fns';
import type { PTOEntry } from '@/types/pto';
import type { PTOCalcSettings } from '@/utils/pto-calc';

export interface DashboardData {
  status: 'loading' | 'success' | 'error';
  error: Error | null;
  finalBalance: number;
  capDate: string | null;
  relevantEntries: PTOEntry[];
  settings: PTOCalcSettings | null;
}

export function useDashboard(): DashboardData {
  const settingsState = useAppSettings();
  const resetsState = useBalanceReset();
  const entriesState = useSortedPtoEvents();

  // Determine error priority first
  if (settingsState.status === 'error' || resetsState.status === 'error' || entriesState.status === 'error') {
    return {
      status: 'error',
      error: settingsState.error || resetsState.error || entriesState.error,
      finalBalance: 0,
      capDate: null,
      relevantEntries: [],
      settings: null,
    };
  }

  // Determine loading state next
  if (
    settingsState.status === 'loading' ||
    resetsState.status === 'loading' ||
    entriesState.status === 'loading'
  ) {
    return {
      status: 'loading',
      error: null,
      finalBalance: 0,
      capDate: null,
      relevantEntries: [],
      settings: null,
    };
  }

  const settings = settingsState.data;
  const reset = resetsState.data;
  const entries = entriesState.data || [];

  // If there's no reset in the database, return early with empty/default data.
  // Note: App.tsx will handle the onboarding gate, but this hook remains safe.
  if (!settings || !reset) {
    return {
      status: 'success',
      error: null,
      finalBalance: 0,
      capDate: null,
      relevantEntries: [],
      settings: settings || null,
    };
  }

  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');

  const { finalBalance } = calculateProjectedBalance(reset, entries, today, settings);
  const capDate = forecastCapDate(reset, entries, settings);

  // Split entries into upcoming and past
  const upcomingEntries = entries
    .filter((e) => isAfter(parseISO(e.startDate), now))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  const pastEntries = entries
    .filter((e) => !isAfter(parseISO(e.startDate), now))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 2);

  // Combine and sort chronologically for the display
  const relevantEntries = [...pastEntries, ...upcomingEntries].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  return {
    status: 'success',
    error: null,
    finalBalance,
    capDate,
    relevantEntries,
    settings,
  };
}
