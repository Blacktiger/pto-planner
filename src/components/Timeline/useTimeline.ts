import { useProjectedBalance } from '@/data/projection/useProjectedBalance';
import { format, addMonths } from 'date-fns';
import type { TimelineEvent } from '@/types/pto';

export interface TimelineData {
  status: 'loading' | 'success' | 'error';
  error: Error | null;
  timeline: TimelineEvent[];
}

export function useTimeline(): TimelineData {
  const targetDate = format(addMonths(new Date(), 6), 'yyyy-MM-dd');
  const projectionState = useProjectedBalance(targetDate);

  if (projectionState.status === 'error') {
    return {
      status: 'error',
      error: projectionState.error,
      timeline: [],
    };
  }

  if (projectionState.status === 'loading') {
    return {
      status: 'loading',
      error: null,
      timeline: [],
    };
  }

  return {
    status: 'success',
    error: null,
    timeline: projectionState.data?.timeline || [],
  };
}
