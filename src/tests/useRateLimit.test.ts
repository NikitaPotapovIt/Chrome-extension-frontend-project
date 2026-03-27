import { describe, it, expect } from 'vitest';
import { getRateLimitState } from '../hooks/useRateLimit';
import type { RateLimit } from '../types';

const make = (remaining: number, total = 50): RateLimit => ({
  per_day_remaining: remaining,
  per_day_total: total,
  per_minute_remaining: 9,
  per_minute_total: 10,
});

describe('getRateLimitState', () => {
  it('returns normal when null', () => {
    expect(getRateLimitState(null)).toBe('normal');
  });

  it('returns normal when plenty remaining', () => {
    expect(getRateLimitState(make(40))).toBe('normal');
  });

  it('returns warning when ≤20% remaining', () => {
    expect(getRateLimitState(make(10))).toBe('warning');
    expect(getRateLimitState(make(5))).toBe('warning');
  });

  it('returns exhausted when 0 remaining', () => {
    expect(getRateLimitState(make(0))).toBe('exhausted');
  });
});
