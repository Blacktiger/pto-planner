import { useEffect, useReducer } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { PTOEntry } from '@/types/pto';
import { queryReducer, type QueryState } from '../types';

export function useSortedPtoEvents(): QueryState<PTOEntry[]> {
  const [state, dispatch] = useReducer(queryReducer<PTOEntry[]>, {
    status: 'loading',
    data: null,
    error: null,
  });

  const result = useLiveQuery(async () => {
    try {
      const data = await db.entries.orderBy('startDate').toArray();
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
