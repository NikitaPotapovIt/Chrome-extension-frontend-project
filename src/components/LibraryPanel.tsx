import React, { useState } from 'react';
import type { UseLibraryReturn } from '../hooks/useLibrary';
import type { LibraryItem } from '../types';

interface LibraryPanelProps {
  library: UseLibraryReturn;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

function LibraryCard({ item, onDelete }: { item: LibraryItem; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.improved_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sourceName = item.source ?? 'popup';
  const sourceCapitalized = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);

  return (
    <div className="library-card">
      <div className="library-card-header">
        <div className="library-card-source">
          <span className="source-dot" />
          {sourceCapitalized}
        </div>
        <span className="library-card-time">{timeAgo(item.created_at)}</span>
      </div>
      <p className="library-card-text library-card-original">
        Original: {item.original_text}
      </p>
      <p className="library-card-text library-card-improved">
        Improved: {item.improved_text}
      </p>
      <div className="library-card-actions">
        <button className="icon-btn" onClick={handleCopy} title="Copy improved prompt">
          {copied ? '✓' : '📋'}
        </button>
        <button className="icon-btn icon-btn--danger" onClick={() => onDelete(item.id)} title="Delete">
          🗑
        </button>
      </div>
    </div>
  );
}

export function LibraryPanel({ library }: LibraryPanelProps) {
  const { filteredItems, items, search, setSearch, storageSize, remove } = library;
  const [activeFilter] = useState('All');

  return (
    <div className="library-panel">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => setSearch('')}
          >
            ×
          </button>
        )}
      </div>

      <div className="filter-chips">
        {['All', 'ChatGPT', 'Claude', 'Perplexity', 'Groq'].map((f) => (
          <button key={f} className={`chip ${activeFilter === f ? 'chip--active' : ''}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="library-list">
        {filteredItems.length === 0 ? (
          <div className="library-empty">
            <div className="library-empty-icon">📚</div>
            <p className="library-empty-text">
              {search
                ? 'No prompts match your search.'
                : 'Your library is empty. Improve a prompt to get started.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <LibraryCard key={item.id} item={item} onDelete={remove} />
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="library-footer">
          {items.length} prompt{items.length !== 1 ? 's' : ''} · {storageSize} used
        </div>
      )}
    </div>
  );
}
