import Dexie, { type Table } from 'dexie';
import type { PTOEntry, BalanceReset, AppSettings } from '../types/pto';

export class PTODatabase extends Dexie {
  entries!: Table<PTOEntry>;
  resets!: Table<BalanceReset>;
  settings!: Table<AppSettings>;

  constructor() {
    super('PTODatabase');
    this.version(1).stores({
      entries: '++id, startDate, endDate',
      resets: '++id, asOfDate',
      settings: '++id'
    });
  }
}

export const db = new PTODatabase();

export async function importBackupData(fileContent: string): Promise<void> {
  const data = JSON.parse(fileContent);

  if (!data || typeof data !== 'object' || (!data.entries && !data.resets && !data.settings)) {
    throw new Error('Invalid backup file format');
  }

  await db.transaction('rw', db.entries, db.resets, db.settings, async () => {
    await db.entries.clear();
    await db.resets.clear();
    await db.settings.clear();

    if (data.entries && Array.isArray(data.entries)) {
      await db.entries.bulkAdd(data.entries);
    }
    if (data.resets && Array.isArray(data.resets)) {
      await db.resets.bulkAdd(data.resets);
    }
    if (data.settings && Array.isArray(data.settings)) {
      await db.settings.bulkAdd(data.settings);
    }
  });
}

