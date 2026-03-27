import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RateBadge } from '../components/RateBadge';
import { Toast } from '../components/Toast';
import type { RateLimit, AppError } from '../types';

describe('RateBadge', () => {
  const makeRL = (remaining: number): RateLimit => ({
    per_day_remaining: remaining,
    per_day_total: 50,
    per_minute_remaining: 9,
    per_minute_total: 10,
  });

  it('renders "— / — today" when rateLimit is null', () => {
    render(<RateBadge rateLimit={null} />);
    expect(screen.getByText(/— \/ —/)).toBeTruthy();
  });

  it('shows used/total correctly', () => {
    render(<RateBadge rateLimit={makeRL(47)} />);
    expect(screen.getByText(/3\/50/)).toBeTruthy();
  });

  it('has warning class when ≤20% remaining', () => {
    const { container } = render(<RateBadge rateLimit={makeRL(5)} />);
    expect(container.querySelector('.rate-badge--warning')).toBeTruthy();
  });

  it('has exhausted class when 0 remaining', () => {
    const { container } = render(<RateBadge rateLimit={makeRL(0)} />);
    expect(container.querySelector('.rate-badge--exhausted')).toBeTruthy();
  });
});

describe('Toast', () => {
  const networkError: AppError = { type: 'network', message: 'Connection failed. Check your internet and try again.' };
  const rateLimitError: AppError = { type: 'rate_limit', message: "Rate limit exceeded. You've used all 50 requests today." };

  it('calls onClose when × is clicked', () => {
    const onClose = vi.fn();
    render(<Toast error={networkError} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows Retry button for network errors', () => {
    const onRetry = vi.fn();
    render(<Toast error={networkError} onClose={vi.fn()} onRetry={onRetry} />);
    const retryBtn = screen.getByText('Retry');
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('does not show Retry for rate limit errors', () => {
    render(<Toast error={rateLimitError} onClose={vi.fn()} />);
    expect(screen.queryByText('Retry')).toBeNull();
  });

  it('shows correct title for rate limit error', () => {
    render(<Toast error={rateLimitError} onClose={vi.fn()} />);
    expect(screen.getByText('Rate limit exceeded.')).toBeTruthy();
  });
});
