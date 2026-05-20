import React, { useReducer } from 'react';
import { db } from '@/lib/db';
import { format } from 'date-fns';

export interface UIState {
  balance: string;
  asOfDate: string;
  isSubmitting: boolean;
  error: string | null;
}

export type UIAction =
  | { type: 'SET_BALANCE'; payload: string }
  | { type: 'SET_AS_OF_DATE'; payload: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_BALANCE':
      return { ...state, balance: action.payload, error: null };
    case 'SET_AS_OF_DATE':
      return { ...state, asOfDate: action.payload, error: null };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.payload };
    default:
      return state;
  }
}

export interface UseBalanceSetupProps {
  onSuccess: () => void;
}

export function useBalanceSetup({ onSuccess }: UseBalanceSetupProps) {
  const [state, dispatch] = useReducer(uiReducer, {
    balance: '',
    asOfDate: format(new Date(), 'yyyy-MM-dd'),
    isSubmitting: false,
    error: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.balance || !state.asOfDate) return;

    dispatch({ type: 'SUBMIT_START' });
    try {
      await db.resets.clear(); // Only keep one reset for now
      await db.resets.add({
        balance: parseFloat(state.balance),
        asOfDate: state.asOfDate,
        createdAt: Date.now(),
      });
      dispatch({ type: 'SUBMIT_SUCCESS' });
      onSuccess();
    } catch {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Failed to save balance.' });
    }
  };

  return {
    ...state,
    setBalance: (val: string) => dispatch({ type: 'SET_BALANCE', payload: val }),
    setAsOfDate: (val: string) => dispatch({ type: 'SET_AS_OF_DATE', payload: val }),
    handleSubmit,
  };
}
