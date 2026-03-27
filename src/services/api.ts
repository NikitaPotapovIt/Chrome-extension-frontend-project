import type {
  ImproveRequest,
  ImproveResponse,
  RateLimit,
  SavePromptRequest,
  SavePromptResponse,
  AppError,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const CLIENT_VERSION = '0.1.0';

function parseError(status: number, body: unknown): AppError {
  if (status === 403) return { type: 'auth', message: 'Your login is invalid' };
  if (status === 429) return { type: 'rate_limit', message: 'Rate limit exceeded. You\'ve used all 50 requests today.' };
  if (status === 422) {
    const msg = typeof body === 'object' && body !== null && 'detail' in body
      ? String((body as { detail: unknown }).detail)
      : 'Validation error';
    return { type: 'validation', message: msg };
  }
  return { type: 'unknown', message: 'An unexpected error occurred' };
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    const body = await res.json().catch(() => null);
    if (!res.ok) throw parseError(res.status, body);
    return body as T;
  } catch (e) {
    if (e && typeof e === 'object' && 'type' in e) throw e as AppError;
    throw { type: 'network', message: 'Connection failed. Check your internet and try again.' } as AppError;
  }
}

export async function improvePrompt(
  text: string,
  installationId: string
): Promise<ImproveResponse> {
  const body: ImproveRequest = {
    text,
    installation_id: installationId,
    client: 'extension',
    client_version: CLIENT_VERSION,
    client_ts: Math.floor(Date.now() / 1000),
  };
  return apiFetch<ImproveResponse>(`${BASE_URL}/v1/improve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function getLimits(installationId: string): Promise<RateLimit> {
  return apiFetch<RateLimit>(
    `${BASE_URL}/v1/limits?installation_id=${encodeURIComponent(installationId)}`
  );
}

export async function savePromptToBackend(
  installationId: string,
  original: string,
  improved: string,
  source: 'popup' | 'sidebar' = 'popup'
): Promise<SavePromptResponse> {
  const body: SavePromptRequest = {
    installation_id: installationId,
    client: 'extension',
    client_version: CLIENT_VERSION,
    original_text: original,
    improved_text: improved,
    meta: { source },
  };
  return apiFetch<SavePromptResponse>(`${BASE_URL}/v1/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
