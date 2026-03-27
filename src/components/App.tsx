import React, { useState, useCallback } from 'react';
import { RateBadge } from './RateBadge';
import { ImprovePanel } from './ImprovePanel';
import { LibraryPanel } from './LibraryPanel';
import { SiteIcons } from './SiteIcons';
import { useRateLimit } from '../hooks/useRateLimit';
import { useLibrary } from '../hooks/useLibrary';
import type { RateLimit, Tab } from '../types';

interface AppProps {
  isSidebar?: boolean;
}

export function App({ isSidebar = false }: AppProps) {
  const [tab, setTab] = useState<Tab>('improve');
  const [draft, setDraft] = useState({ original: '', improved: '' });
  const { rateLimit, setRateLimit } = useRateLimit();
  const library = useLibrary();

  const handleRateLimitUpdate = useCallback(
    (rl: RateLimit) => setRateLimit(rl),
    [setRateLimit]
  );

  const handleSave = useCallback(
    async (original: string, improved: string) => {
      await library.save(original, improved);
    },
    [library.save]
  );

  const toggleLayout = useCallback(async () => {
    try {
      if (isSidebar) {
        window.close();
      } else {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.windowId) {
          await chrome.sidePanel.open({ windowId: activeTab.windowId });
          window.close();
        }
      }
    } catch {
      // sidePanel API unavailable
    }
  }, [isSidebar]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <span className="header-logo-icon">✨</span>
          PromptTune
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="layout-toggle"
            onClick={toggleLayout}
            title={isSidebar ? 'Switch to popup' : 'Switch to sidebar'}
          >
            {isSidebar ? '⬛ Popup' : '◻ Sidebar'}
          </button>
          <RateBadge rateLimit={rateLimit} />
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${tab === 'improve' ? 'tab-btn--active' : ''}`}
          onClick={() => setTab('improve')}
        >
          ✨ Improve
        </button>
        <button
          className={`tab-btn ${tab === 'library' ? 'tab-btn--active' : ''}`}
          onClick={() => setTab('library')}
        >
          🗒 Library
          {library.items.length > 0 && (
            <span className="tab-badge">{library.items.length}</span>
          )}
        </button>
      </div>
      <div className="tab-divider" />

      {tab === 'improve' ? (
        <>
          <ImprovePanel
            onSave={handleSave}
            onRateLimitUpdate={handleRateLimitUpdate}
            draft={draft}
            onDraftChange={setDraft}
          />
          <SiteIcons />
        </>
      ) : (
        <LibraryPanel library={library} />
      )}

      <footer className="footer">Powered by AI · v1.2.0</footer>
    </div>
  );
}
