import { useEffect, useReducer } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { resolveSettings, type PTOCalcSettings } from '@/utils/pto-calc';
import { queryReducer, type QueryState } from '../types';

export function useAppSettings(): QueryState<PTOCalcSettings> {
  const [state, dispatch] = useReducer(queryReducer<PTOCalcSettings>, {
    status: 'loading',
    data: null,
    error: null,
  });

  const result = useLiveQuery(async () => {
    try {
      const stored = await db.settings.orderBy('id').last();
      const data = resolveSettings(stored);
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  });

  useEffect(() => {
    if (result === undefined) {
      dispatch({ type: 'FETCH_START' });
    } else if (result.error) {
      dispatch({ type: 'FETCH_ERROR', error: result.error });
    } else {
      dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
    }
  }, [result]);

  return state;
}
