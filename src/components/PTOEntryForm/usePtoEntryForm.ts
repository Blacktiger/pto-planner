import React, { useReducer } from 'react';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { calculateTotalHours } from '@/utils/pto-calc';

export interface UIState {
  startDate: string;
  endDate: string;
  hoursPerDay: string;
  description: string;
  isSubmitting: boolean;
  error: string | null;
}

export type UIAction =
  | { type: 'SET_FIELD'; field: keyof Omit<UIState, 'isSubmitting' | 'error'>; value: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET_FORM' };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value, error: null };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.payload };
    case 'RESET_FORM':
      return {
        ...state,
        description: '',
        error: null,
      };
    default:
      return state;
  }
}

export interface UsePtoEntryFormProps {
  onSuccess: () => void;
}

export function usePtoEntryForm({ onSuccess }: UsePtoEntryFormProps) {
  const [state, dispatch] = useReducer(uiReducer, {
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    hoursPerDay: '8',
    description: '',
    isSubmitting: false,
    error: null,
  });

  const total = calculateTotalHours(state.startDate, state.endDate, parseFloat(state.hoursPerDay || '0'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total <= 0) return;

    dispatch({ type: 'SUBMIT_START' });
    try {
      await db.entries.add({
        startDate: state.startDate,
        endDate: state.endDate,
        hoursPerDay: parseFloat(state.hoursPerDay),
        totalHours: total,
        description: state.description,
        isFullDay: parseFloat(state.hoursPerDay) >= 8,
        createdAt: Date.now(),
      });
      dispatch({ type: 'SUBMIT_SUCCESS' });
      dispatch({ type: 'RESET_FORM' });
      onSuccess();
    } catch {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Failed to add entry.' });
    }
  };

  return {
    ...state,
    total,
    setStartDate: (val: string) => dispatch({ type: 'SET_FIELD', field: 'startDate', value: val }),
    setEndDate: (val: string) => dispatch({ type: 'SET_FIELD', field: 'endDate', value: val }),
    setHoursPerDay: (val: string) => dispatch({ type: 'SET_FIELD', field: 'hoursPerDay', value: val }),
    setDescription: (val: string) => dispatch({ type: 'SET_FIELD', field: 'description', value: val }),
    handleSubmit,
  };
}
