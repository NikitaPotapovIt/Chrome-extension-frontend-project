import React, { useState, useCallback } from 'react';
import { useImprove } from '../hooks/useImprove';
import { SkeletonLoader } from './SkeletonLoader';
import { Toast } from './Toast';
import type { RateLimit } from '../types';

interface ImprovePanelProps {
  onSave: (original: string, improved: string) => Promise<void>;
  onRateLimitUpdate: (rl: RateLimit) => void;
  draft: { original: string; improved: string };
  onDraftChange: (d: { original: string; improved: string }) => void;
}

export function ImprovePanel({ onSave, onRateLimitUpdate, draft, onDraftChange }: ImprovePanelProps) {
  const { improvedText, loadingState, error, rateLimit, improve, clearError } = useImprove();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync improved text into parent draft
  React.useEffect(() => {
    if (improvedText) onDraftChange({ ...draft, improved: improvedText });
  }, [improvedText]);

  React.useEffect(() => {
    if (rateLimit) onRateLimitUpdate(rateLimit);
  }, [rateLimit]);

  const handleImprove = useCallback(() => {
    improve(draft.original);
  }, [draft.original, improve]);

  const handleCopy = useCallback(async () => {
    const text = draft.improved || improvedText;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [draft.improved, improvedText]);

  const handleSave = useCallback(async () => {
    const imp = draft.improved || improvedText;
    if (!draft.original || !imp) return;
    await onSave(draft.original, imp);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [draft, improvedText, onSave]);

  const displayImproved = draft.improved || improvedText;
  const isLoading = loadingState === 'loading';
  const hasImproved = Boolean(displayImproved);

  return (
    <>
      {error && (
        <div className="toast-stack">
          <Toast
            error={error}
            onClose={clearError}
            onRetry={error.type === 'network' ? handleImprove : undefined}
          />
        </div>
      )}

      <div className="improve-panel">
        <div>
          <label className="field-label">Original Prompt</label>
          <textarea
            className="prompt-textarea"
            placeholder="Type or paste your prompt here..."
            value={draft.original}
            onChange={(e) => onDraftChange({ ...draft, original: e.target.value })}
            rows={4}
            disabled={isLoading}
          />
        </div>

        <button
          className="improve-btn"
          onClick={handleImprove}
          disabled={isLoading || !draft.original.trim()}
        >
          {isLoading ? (
            <>
              <div className="spinner" />
              Improving...
            </>
          ) : (
            <>✨ Improve ✨</>
          )}
        </button>

        <div>
          <label className="field-label">Improved Prompt</label>
          {isLoading ? (
            <div className="bento-card">
              <SkeletonLoader />
            </div>
          ) : (
            <textarea
              className="prompt-textarea"
              placeholder="Improved prompt will appear here..."
              value={displayImproved}
              readOnly
              rows={4}
            />
          )}
        </div>

        <div className="action-row">
          <button
            className={`action-btn ${copied ? 'action-btn--copied' : ''}`}
            onClick={handleCopy}
            disabled={!hasImproved || isLoading}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button
            className="action-btn"
            onClick={handleSave}
            disabled={!hasImproved || isLoading}
          >
            {saved ? '✓ Saved!' : '🗒 Save to Library'}
          </button>
        </div>
      </div>
    </>
  );
}
