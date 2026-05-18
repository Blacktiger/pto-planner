import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { DEFAULT_SETTINGS, resolveSettings, type PTOCalcSettings } from '@/utils/pto-calc';

export function useAppSettings(): PTOCalcSettings {
  const stored = useLiveQuery(() => db.settings.orderBy('id').last());
  if (stored === undefined) {
    return DEFAULT_SETTINGS;
  }
  return resolveSettings(stored);
}
