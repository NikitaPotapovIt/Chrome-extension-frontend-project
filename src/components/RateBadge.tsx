import React from 'react';
import type { RateLimit } from '../types';
import { getRateLimitState } from '../hooks/useRateLimit';

interface RateBadgeProps {
  rateLimit: RateLimit | null;
}

export function RateBadge({ rateLimit }: RateBadgeProps) {
  if (!rateLimit) return <span className="rate-badge">— / — today</span>;

  const state = getRateLimitState(rateLimit);
  const used = rateLimit.per_day_total - rateLimit.per_day_remaining;
  const total = rateLimit.per_day_total;

  return (
    <span className={`rate-badge rate-badge--${state === 'normal' ? '' : state}`}>
      🗒 {used}/{total} today
    </span>
  );
}
