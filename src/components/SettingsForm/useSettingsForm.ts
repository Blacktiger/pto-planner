import React, { useReducer, useEffect } from 'react';
import { db } from '@/lib/db';
import { useAppSettings } from '@/data/settings/useAppSettings';
import { DEFAULT_SETTINGS } from '@/utils/pto-calc';

export interface UIState {
  accrualRate: string;
  maxBalance: string;
  isSaving: boolean;
  saved: boolean;
  submissionError: string | null;
}

export type UIAction =
  | { type: 'SET_FIELD'; field: 'accrualRate' | 'maxBalance'; value: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; payload: string }
  | { type: 'RESET_SAVED' }
  | { type: 'SYNC_DATA'; payload: { accrualRate: string; maxBalance: string } };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value, submissionError: null, saved: false };
    case 'SAVE_START':
      return { ...state, isSaving: true, submissionError: null };
    case 'SAVE_SUCCESS':
      return { ...state, isSaving: false, saved: true };
    case 'SAVE_ERROR':
      return { ...state, isSaving: false, submissionError: action.payload };
    case 'RESET_SAVED':
      return { ...state, saved: false };
    case 'SYNC_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function useSettingsForm() {
  const settingsState = useAppSettings();
  const [state, dispatch] = useReducer(uiReducer, {
    accrualRate: DEFAULT_SETTINGS.accrualRate.toString(),
    maxBalance: DEFAULT_SETTINGS.maxBalance.toString(),
    isSaving: false,
    saved: false,
    submissionError: null,
  });

  useEffect(() => {
    if (settingsState.status === 'success' && settingsState.data) {
      dispatch({
        type: 'SYNC_DATA',
        payload: {
          accrualRate: settingsState.data.accrualRate.toString(),
          maxBalance: settingsState.data.maxBalance.toString(),
        },
      });
    }
  }, [settingsState.status, settingsState.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAccrualRate = parseFloat(state.accrualRate);
    const parsedMaxBalance = parseFloat(state.maxBalance);

    if (!Number.isFinite(parsedAccrualRate) || parsedAccrualRate <= 0) {
      return;
    }
    if (!Number.isFinite(parsedMaxBalance) || parsedMaxBalance <= 0) {
      return;
    }

    dispatch({ type: 'SAVE_START' });
    try {
      await db.settings.clear();
      await db.settings.add({
        accrualRate: parsedAccrualRate,
        maxBalance: parsedMaxBalance,
      });
      dispatch({ type: 'SAVE_SUCCESS' });
      setTimeout(() => dispatch({ type: 'RESET_SAVED' }), 2000);
    } catch {
      dispatch({ type: 'SAVE_ERROR', payload: 'Failed to save settings.' });
    }
  };

  return {
    ...state,
    status: settingsState.status,
    error: settingsState.error,
    setAccrualRate: (val: string) => dispatch({ type: 'SET_FIELD', field: 'accrualRate', value: val }),
    setMaxBalance: (val: string) => dispatch({ type: 'SET_FIELD', field: 'maxBalance', value: val }),
    handleSubmit,
  };
}
