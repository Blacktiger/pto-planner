import { calculateProjectedBalance } from '@/utils/pto-calc';
import { useBalanceReset } from '../balance/useBalanceReset';
import { useSortedPtoEvents } from '../ptoEvents/useSortedPtoEvents';
import { useAppSettings } from '../settings/useAppSettings';
import type { QueryStatus } from '../types';
import type { TimelineEvent } from '@/types/pto';

export interface ProjectedBalance {
  finalBalance: number;
  totalLost: number;
  timeline: TimelineEvent[];
}

export function useProjectedBalance(targetDate: string) {
  const resetsState = useBalanceReset();
  const entriesState = useSortedPtoEvents();
  const settingsState = useAppSettings();

  const isError =
    resetsState.status === 'error' ||
    entriesState.status === 'error' ||
    settingsState.status === 'error';

  const isLoading =
    resetsState.status === 'loading' ||
    entriesState.status === 'loading' ||
    settingsState.status === 'loading';

  const error =
    resetsState.error || entriesState.error || settingsState.error;

  const status: QueryStatus = isError
    ? 'error'
    : isLoading
      ? 'loading'
      : 'success';

  let projection: ProjectedBalance | null = null;
  if (status === 'success' && resetsState.data && settingsState.data) {
    projection = calculateProjectedBalance(
      resetsState.data,
      entriesState.data || [],
      targetDate,
      settingsState.data
    );
  }

  return {
    status,
    data: projection,
    error,
  };
}
