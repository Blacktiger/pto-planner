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

  const startEdit = (id: number) => dispatch({ type: 'START_EDIT', id });
  const cancelEdit = () => dispatch({ type: 'CANCEL_EDIT' });
  const startDelete = (id: number) => dispatch({ type: 'START_DELETE', id });
  const cancelDelete = () => dispatch({ type: 'CANCEL_DELETE' });

  const confirmDelete = async () => {
    if (uiState.deletingId == null) return;
    try {
      await db.entries.delete(uiState.deletingId);
      dispatch({ type: 'CANCEL_DELETE' });
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Failed to delete entry.' });
    }
  };

  return {
    status: queryState.status,
    entries: queryState.data,
    queryError: queryState.error,
    uiState,
    startEdit,
    cancelEdit,
    startDelete,
    cancelDelete,
    confirmDelete,
  };
}
