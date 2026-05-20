import React, { useReducer } from 'react';
import { db } from '@/lib/db';

export interface UIState {
  isExporting: boolean;
  isImporting: boolean;
  error: string | null;
}

export type UIAction =
  | { type: 'EXPORT_START' }
  | { type: 'EXPORT_SUCCESS' }
  | { type: 'EXPORT_ERROR'; payload: string }
  | { type: 'IMPORT_START' }
  | { type: 'IMPORT_SUCCESS' }
  | { type: 'IMPORT_ERROR'; payload: string };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'EXPORT_START':
      return { ...state, isExporting: true, error: null };
    case 'EXPORT_SUCCESS':
      return { ...state, isExporting: false };
    case 'EXPORT_ERROR':
      return { ...state, isExporting: false, error: action.payload };
    case 'IMPORT_START':
      return { ...state, isImporting: true, error: null };
    case 'IMPORT_SUCCESS':
      return { ...state, isImporting: false };
    case 'IMPORT_ERROR':
      return { ...state, isImporting: false, error: action.payload };
    default:
      return state;
  }
}

export function useImportExport() {
  const [state, dispatch] = useReducer(uiReducer, {
    isExporting: false,
    isImporting: false,
    error: null,
  });

  const handleExport = async () => {
    dispatch({ type: 'EXPORT_START' });
    try {
      const data = {
        entries: await db.entries.toArray(),
        resets: await db.resets.toArray(),
        settings: await db.settings.toArray(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pto-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch({ type: 'EXPORT_SUCCESS' });
    } catch {
      dispatch({ type: 'EXPORT_ERROR', payload: 'Failed to export data.' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Importing will overwrite your current data. Continue?')) return;

    dispatch({ type: 'IMPORT_START' });
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        await db.transaction('rw', db.entries, db.resets, db.settings, async () => {
          await db.entries.clear();
          await db.resets.clear();
          await db.settings.clear();
          
          if (data.entries) await db.entries.bulkAdd(data.entries);
          if (data.resets) await db.resets.bulkAdd(data.resets);
          if (data.settings) await db.settings.bulkAdd(data.settings);
        });
        
        dispatch({ type: 'IMPORT_SUCCESS' });
        alert('Import successful!');
        window.location.reload();
      } catch {
        dispatch({ type: 'IMPORT_ERROR', payload: 'Import failed: Invalid file format.' });
        alert('Import failed: Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return {
    ...state,
    handleExport,
    handleImport,
  };
}
