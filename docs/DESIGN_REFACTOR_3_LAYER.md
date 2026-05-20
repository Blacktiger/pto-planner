# Design Specification: 3-Layer Architecture & State Management Refactor

This document details the architecture, state transition rules, and design choices for refactoring the PTO Planner to a 3-layer architecture with structured loading/UI state management.

---

## 1. Understanding Summary

* **What**: Refactoring the codebase to adhere to a strict 3-layer pattern:
  1. **Data Layer**: Centralized hooks under `src/data/` for IndexedDB queries.
  2. **Integration Layer**: Custom hooks colocated in feature folders to orchestrate state, actions, and math.
  3. **Component Layer**: Pure presentation and styling.
* **Why**: To prevent database persistence and raw Dexie queries from cluttering presentation components, and to establish clean, testable state management.
* **State Management**: Using React's built-in `useReducer` in two separate areas:
  1. **Database Queries**: Unifying `status` (`loading` | `success` | `error`), `data`, and `error` states.
  2. **Feature UI Flows**: Tracking active edits, deletes, and user validation states.
* **Scope of Phase 1**: Extract settings/resets/entries hooks, build a shared `useProjectedBalance` hook, and migrate the `PTOList` feature to the colocated feature folder pattern.

---

## 2. Assumptions

1. **Reactivity**: We will continue using `useLiveQuery` from `dexie-react-hooks` to ensure real-time UI updates.
2. **Error Isolation**: Database queries will capture errors using `try/catch` inside the query functions to prevent React tree crashes.
3. **Data Writes**: Writes/mutations will be initiated by components invoking callbacks from integration hooks, which talk to Dexie directly.

---

## 3. Decision Log

| Decision | Alternatives Considered | Why Chosen |
|:---|:---|:---|
| **Approach 1 (Reactive Syncing)** | Promise-based fetching (Approach 2) | Keeps Dexie’s simple, live reactivity while exposing clean status flags. |
| **Two-Layer Reducers** | Single global state store | Keeps local UI flow states (forms, modal toggle) separated from database query status. |
| **Error Precedence** | Loading over Error | Surfacing errors immediately prevents the UI from freezing in a loading loop. |
| **Mutual State Exclusivity** | Allowing overlapping edit/delete states | Canceling active edits on delete, and blocking edits during deletes, keeps the UI simple and bug-free. |

---

## 4. Final Design Specification

### A. Generic Database Query Reducer

A reusable state machine for data-fetching hooks:

```typescript
// src/data/types.ts
export type QueryStatus = 'loading' | 'success' | 'error';

export interface QueryState<T> {
  status: QueryStatus;
  data: T | null;
  error: Error | null;
}

export type QueryAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; error: Error };

export function queryReducer<T>(state: QueryState<T>, action: QueryAction<T>): QueryState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading' };
    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.payload, error: null };
    case 'FETCH_ERROR':
      return { status: 'error', data: null, error: action.error };
    default:
      return state;
  }
}
```

### B. Reactive Data Hook Pattern (e.g., `useSortedPtoEvents`)

```typescript
// src/data/ptoEvents/useSortedPtoEvents.ts
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
```

### C. Shared Projection Hook (`useProjectedBalance`)

```typescript
// src/data/projection/useProjectedBalance.ts
import { calculateProjectedBalance } from '@/utils/pto-calc';
import { useBalanceReset } from '../balance/useBalanceReset';
import { useSortedPtoEvents } from '../ptoEvents/useSortedPtoEvents';
import { useAppSettings } from '../settings/useAppSettings';
import type { QueryState, QueryStatus } from '../types';

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

  let projection = null;
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
```

### D. Feature UI Reducer & Integration Hook (`usePtoList`)

```typescript
// src/components/PTOList/usePtoList.ts
import { useReducer } from 'react';
import { db } from '@/lib/db';
import { useSortedPtoEvents } from '@/data/ptoEvents/useSortedPtoEvents';

export interface UIState {
  editingId: number | null;
  deletingId: number | null;
  error: string | null;
}

export type UIAction =
  | { type: 'START_EDIT'; id: number }
  | { type: 'CANCEL_EDIT' }
  | { type: 'START_DELETE'; id: number }
  | { type: 'CANCEL_DELETE' }
  | { type: 'SET_ERROR'; error: string | null };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'START_EDIT':
      if (state.deletingId !== null) return state; // Block edit start while delete modal is open
      return { ...state, editingId: action.id, error: null };
    case 'CANCEL_EDIT':
      return { ...state, editingId: null };
    case 'START_DELETE':
      return { ...state, deletingId: action.id, editingId: null, error: null };
    case 'CANCEL_DELETE':
      return { ...state, deletingId: null };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

export function usePtoList() {
  const [uiState, dispatch] = useReducer(uiReducer, {
    editingId: null,
    deletingId: null,
    error: null,
  });

  const queryState = useSortedPtoEvents();

  return {
    status: queryState.status,
    entries: queryState.data,
    queryError: queryState.error,
    uiState,
    startEdit: (id: number) => dispatch({ type: 'START_EDIT', id }),
    cancelEdit: () => dispatch({ type: 'CANCEL_EDIT' }),
    startDelete: (id: number) => dispatch({ type: 'START_DELETE', id }),
    cancelDelete: () => dispatch({ type: 'CANCEL_DELETE' }),
    confirmDelete: async () => {
      if (uiState.deletingId == null) return;
      try {
        await db.entries.delete(uiState.deletingId);
        dispatch({ type: 'CANCEL_DELETE' });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: 'Failed to delete entry.' });
      }
    },
  };
}
```
