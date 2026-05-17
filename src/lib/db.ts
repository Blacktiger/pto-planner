import Dexie, { type Table } from 'dexie';
import { PTOEntry, BalanceReset, AppSettings } from '../types/pto';

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
