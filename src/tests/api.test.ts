import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { improvePrompt, getLimits, savePromptToBackend } from '../services/api';
import type { AppError } from '../types';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function mockResponse(status: number, body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('improvePrompt', () => {
  it('returns improved text on success', async () => {
    const payload = {
      request_id: 'uuid-1',
      improved_text: 'Better prompt',
      rate_limit: { per_minute_remaining: 9, per_day_remaining: 49, per_minute_total: 10, per_day_total: 50 },
    };
    mockResponse(200, payload);
    const result = await improvePrompt('original text', 'install-id');
    expect(result.improved_text).toBe('Better prompt');
    expect(result.rate_limit.per_day_remaining).toBe(49);
  });

  it('throws rate_limit error on 429', async () => {
    mockResponse(429, {});
    await expect(improvePrompt('text', 'id')).rejects.toMatchObject<AppError>({
      type: 'rate_limit',
      message: expect.stringContaining('Rate limit'),
    });
  });

  it('throws auth error on 403', async () => {
    mockResponse(403, {});
    await expect(improvePrompt('text', 'id')).rejects.toMatchObject<AppError>({
      type: 'auth',
      message: 'Your login is invalid',
    });
  });

  it('throws network error when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(improvePrompt('text', 'id')).rejects.toMatchObject<AppError>({
      type: 'network',
    });
  });

  it('throws validation error on 422', async () => {
    mockResponse(422, { detail: 'text is required' });
    await expect(improvePrompt('', 'id')).rejects.toMatchObject<AppError>({
      type: 'validation',
      message: 'text is required',
    });
  });
});

describe('getLimits', () => {
  it('returns rate limit data', async () => {
    const payload = { per_minute_remaining: 5, per_day_remaining: 30, per_minute_total: 10, per_day_total: 50 };
    mockResponse(200, payload);
    const result = await getLimits('install-id');
    expect(result.per_day_remaining).toBe(30);
  });
});

describe('savePromptToBackend', () => {
  it('returns prompt_id on success', async () => {
    mockResponse(200, { prompt_id: 'prompt-uuid' });
    const result = await savePromptToBackend('id', 'original', 'improved', 'popup');
    expect(result.prompt_id).toBe('prompt-uuid');
  });
});
