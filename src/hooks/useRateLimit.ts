import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import type { RateLimit, BgResponse } from '../types';

export function useRateLimit() {
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);

  useEffect(() => {
    browser.runtime
      .sendMessage({ type: 'GET_LIMITS' })
      .then((res: BgResponse<RateLimit>) => {
        if (res.success) setRateLimit(res.data);
      })
      .catch(() => {});
  }, []);

  return { rateLimit, setRateLimit };
}

export function getRateLimitState(rl: RateLimit | null): 'normal' | 'warning' | 'exhausted' {
  if (!rl) return 'normal';
  const ratio = rl.per_day_remaining / rl.per_day_total;
  if (rl.per_day_remaining === 0) return 'exhausted';
  if (ratio <= 0.2) return 'warning';
  return 'normal';
}
