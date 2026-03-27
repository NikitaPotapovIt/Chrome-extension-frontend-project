import { useState, useCallback } from 'react';
import browser from 'webextension-polyfill';
import type { AppError, ImproveResponse, RateLimit, LoadingState, BgResponse } from '../types';

interface UseImproveReturn {
  improvedText: string;
  loadingState: LoadingState;
  error: AppError | null;
  rateLimit: RateLimit | null;
  improve: (text: string) => Promise<void>;
  clearError: () => void;
}

export function useImprove(): UseImproveReturn {
  const [improvedText, setImprovedText] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);

  const improve = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setLoadingState('loading');
    setError(null);
    const response = await browser.runtime.sendMessage({
      type: 'IMPROVE',
      payload: { text },
    }) as BgResponse<ImproveResponse>;
    if (response.success) {
      setImprovedText(response.data.improved_text);
      setRateLimit(response.data.rate_limit);
      setLoadingState('success');
    } else {
      setError(response.error);
      setLoadingState('error');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { improvedText, loadingState, error, rateLimit, improve, clearError };
}
