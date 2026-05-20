import { useEffect, useReducer } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { BalanceReset } from '@/types/pto';
import { queryReducer, type QueryState } from '../types';

export function useBalanceReset(): QueryState<BalanceReset | null> {
  const [state, dispatch] = useReducer(queryReducer<BalanceReset | null>, {
    status: 'loading',
    data: null,
    error: null,
  });

  const result = useLiveQuery(async () => {
    try {
      const stored = await db.resets.orderBy('id').last();
      return { data: stored || null, error: null };
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
