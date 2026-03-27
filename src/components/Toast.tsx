import React from 'react';
import type { AppError } from '../types';

interface ToastProps {
  error: AppError;
  onClose: () => void;
  onRetry?: () => void;
}

export function Toast({ error, onClose, onRetry }: ToastProps) {
  const isRateLimit = error.type === 'rate_limit';
  const isNetwork = error.type === 'network';

  return (
    <div className={`toast ${isNetwork ? 'toast--network' : 'toast--error'}`} role="alert">
      <span className="toast-icon">{isNetwork ? '📡' : '⚠'}</span>
      <div className="toast-body">
        <div className="toast-title">
          {isRateLimit ? 'Rate limit exceeded.' : isNetwork ? 'Connection failed.' : 'Error'}
        </div>
        <div className="toast-msg">{error.message}</div>
        {isNetwork && onRetry && (
          <button className="toast-retry" onClick={onRetry}>Retry</button>
        )}
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
}
