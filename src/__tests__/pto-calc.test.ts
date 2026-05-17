import { describe, it, expect } from 'vitest';
import { generateAccrualEvents, calculateProjectedBalance, forecastCapDate } from '../utils/pto-calc';
import type { BalanceReset, PTOEntry } from '../types/pto';

describe('Accrual Logic', () => {
  it('should generate accruals for a partial month (starting from 1st)', () => {
    const start = '2026-05-01';
    const end = '2026-05-31';
    const accruals = generateAccrualEvents(start, end);
    
    expect(accruals).toHaveLength(2);
    expect(accruals[0].date).toBe('2026-05-01');
    expect(accruals[1].date).toBe('2026-05-15');
  });

  it('should generate accruals across multiple months', () => {
    const start = '2026-05-16';
    const end = '2026-06-15';
    const accruals = generateAccrualEvents(start, end);
    
    expect(accruals).toHaveLength(2);
    expect(accruals[0].date).toBe('2026-06-01');
    expect(accruals[1].date).toBe('2026-06-15');
  });

  it('should include accrual ON the start date if it is 1st or 15th', () => {
    const start = '2026-05-15';
    const end = '2026-05-15';
    const accruals = generateAccrualEvents(start, end);
    expect(accruals).toHaveLength(1);
    expect(accruals[0].date).toBe('2026-05-15');
  });
});

describe('Balance Projection', () => {
  it('should calculate balance with accruals only', () => {
    const reset: BalanceReset = { balance: 10, asOfDate: '2026-05-01', createdAt: Date.now() };
    const result = calculateProjectedBalance(reset, [], '2026-05-31');
    
    expect(result.finalBalance).toBeCloseTo(26.666666, 5);
  });

  it('should handle same-day ordering (accrual before deduction)', () => {
    const reset: BalanceReset = { balance: 235, asOfDate: '2026-05-01', createdAt: Date.now() };
    const entries: PTOEntry[] = [{ 
      startDate: '2026-05-01', 
      endDate: '2026-05-01', 
      hoursPerDay: 8, 
      totalHours: 8, 
      isFullDay: true, 
      createdAt: Date.now() 
    }];
    
    const result = calculateProjectedBalance(reset, entries, '2026-05-01');
    expect(result.finalBalance).toBe(232);
    expect(result.totalLost).toBeCloseTo(3.333333, 5);
  });
});

describe('Cap Forecast', () => {
  it('should forecast the date when cap is hit', () => {
    const reset: BalanceReset = { balance: 230, asOfDate: '2026-05-01', createdAt: Date.now() };
    // 230 + 8.33 (May 1) = 238.33
    // 238.33 + 8.33 (May 15) = 246.66 -> CAP HIT on May 15
    const capDate = forecastCapDate(reset, []);
    expect(capDate).toBe('2026-05-15');
  });

  it('should return null if cap is not hit within 5 years', () => {
    const reset: BalanceReset = { balance: 10, asOfDate: '2026-05-01', createdAt: Date.now() };
    const entries: PTOEntry[] = [{ 
      startDate: '2026-05-01', 
      endDate: '2030-12-31', 
      hoursPerDay: 8, 
      totalHours: 8000, 
      isFullDay: true, 
      createdAt: Date.now() 
    }];
    const capDate = forecastCapDate(reset, entries);
    expect(capDate).toBeNull();
  });
});
