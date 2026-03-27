import React from 'react';

const SITES = [
  { label: 'ChatGPT', icon: '🤖', url: 'https://chat.openai.com' },
  { label: 'Claude', icon: '🅰', url: 'https://claude.ai' },
  { label: 'Perplexity', icon: '✳', url: 'https://www.perplexity.ai' },
  { label: 'Groq', icon: 'g', url: 'https://groq.com' },
  { label: 'Deepseek', icon: '🐋', url: 'https://chat.deepseek.com' },
];

export function SiteIcons() {
  const open = (url: string) => chrome.tabs.create({ url });

  return (
    <div className="open-paste">
      <div className="open-paste-label">Open &amp; Paste</div>
      <div className="site-icons">
        {SITES.map((site) => (
          <button
            key={site.label}
            className="site-icon-btn"
            onClick={() => open(site.url)}
            title={site.label}
          >
            <div className="site-icon">{site.icon}</div>
            <span>{site.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
