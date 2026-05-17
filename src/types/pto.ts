export type EntryType = 'pto' | 'accrual' | 'cap_loss';

export interface PTOEntry {
  id?: number;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  hoursPerDay: number;
  totalHours: number;
  description?: string;
  isFullDay: boolean;
  createdAt: number;
}

export interface BalanceReset {
  id?: number;
  balance: number;
  asOfDate: string; // ISO date
  createdAt: number;
}

export interface AppSettings {
  id?: number;
  accrualRate: number; // default 8.333333
  maxBalance: number;  // default 240
}

export interface TimelineEvent {
  type: EntryType;
  date: string;
  amount: number;
  description: string;
  balanceAfter: number;
  lostAmount?: number;
}
