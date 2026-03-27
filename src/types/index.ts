// API types
export interface RateLimit {
  per_minute_remaining: number;
  per_day_remaining: number;
  per_minute_total: number;
  per_day_total: number;
}

export interface ImproveRequest {
  text: string;
  installation_id: string;
  client: 'extension';
  client_version: string;
  client_ts: number;
}

export interface ImproveResponse {
  request_id: string;
  improved_text: string;
  rate_limit: RateLimit;
}

export interface SavePromptRequest {
  installation_id: string;
  client: 'extension';
  client_version: string;
  original_text: string;
  improved_text: string;
  meta: { source: 'popup' | 'sidebar' };
}

export interface SavePromptResponse {
  prompt_id: string;
}

// Extension storage types
export interface LibraryItem {
  id: string;
  original_text: string;
  improved_text: string;
  created_at: number;
  source?: string;
}

export interface StorageData {
  library: LibraryItem[];
  installation_id: string;
}

// UI State types
export type Tab = 'improve' | 'library';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppError {
  type: 'rate_limit' | 'network' | 'auth' | 'validation' | 'unknown';
  message: string;
}

export interface AppState {
  tab: Tab;
  originalPrompt: string;
  improvedPrompt: string;
  loadingState: LoadingState;
  error: AppError | null;
  rateLimit: RateLimit | null;
}

// Background message types
export type BgMessage =
  | { type: 'IMPROVE'; payload: { text: string } }
  | { type: 'GET_LIMITS' }
  | { type: 'SAVE_PROMPT'; payload: { original: string; improved: string } };

export type BgResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: AppError };
