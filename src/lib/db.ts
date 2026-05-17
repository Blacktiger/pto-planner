import Dexie, { type Table } from 'dexie';
import type { PTOEntry, BalanceReset, AppSettings } from '../types/pto';

export class PTODatabase extends Dexie {
  entries!: Table<PTOEntry>;
  resets!: Table<BalanceReset>;
  settings!: Table<AppSettings>;

  constructor() {
    super('PTODatabase');
    console.log('DB: Initializing PTODatabase...');
    this.version(1).stores({
      entries: '++id, startDate, endDate',
      resets: '++id, asOfDate',
      settings: '++id'
    });

    this.on('ready', () => {
      console.log('DB: Database is ready');
    });

    this.on('error', (err) => {
      console.error('DB: Database error:', err);
    });
  }
}

export const db = new PTODatabase();
