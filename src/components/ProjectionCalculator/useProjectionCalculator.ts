import { useState } from 'react';
import { useProjectedBalance } from '@/data/projection/useProjectedBalance';
import { format, addMonths } from 'date-fns';
import type { ProjectedBalance } from '@/data/projection/useProjectedBalance';

export interface ProjectionCalculatorData {
  targetDate: string;
  setTargetDate: (date: string) => void;
  status: 'loading' | 'success' | 'error';
  error: Error | null;
  data: ProjectedBalance | null;
}

export function useProjectionCalculator(): ProjectionCalculatorData {
  const [targetDate, setTargetDate] = useState<string>(() =>
    format(addMonths(new Date(), 3), 'yyyy-MM-dd')
  );

  const projectionState = useProjectedBalance(targetDate);

  return {
    targetDate,
    setTargetDate,
    status: projectionState.status,
    error: projectionState.error,
    data: projectionState.data,
  };
}
