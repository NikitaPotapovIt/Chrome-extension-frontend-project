# PromptTune — AI Prompt Chrome Extension

A Chrome Manifest V3 extension that improves your prompts with AI, built with WXT + React + TypeScript.

## Stack

- **WXT** — Chrome extension framework (Manifest V3)
- **React 18** — UI components
- **TypeScript** — strict typing throughout
- **webextension-polyfill** — cross-browser extension APIs
- **Plain CSS** — Glassmorphism + Bento Grid design system
- **Vitest** — unit & component tests

## Quick start

```bash
npm install
npm run dev      # WXT dev mode — loads extension in Chrome automatically
npm run build    # Production build → .output/chrome-mv3/
npm run test     # Run all tests
npm run lint     # ESLint
```

## Loading into Chrome

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select `.output/chrome-mv3`

## Environment

Create a `.env.local` file (optional — defaults shown):

```
VITE_API_BASE_URL=http://localhost:8000
VITE_BACKEND_MODE=fastapi
```

## Project structure

```
src/
├── entrypoints/
│   ├── background.ts        # Service worker — handles API calls, storage
│   ├── popup/               # Popup UI entry
│   └── sidepanel/           # Sidebar UI entry (bonus feature)
├── components/
│   ├── App.tsx              # Root component — tabs, header, layout toggle
│   ├── ImprovePanel.tsx     # Improve tab — textarea, button, results
│   ├── LibraryPanel.tsx     # Library tab — search, filter chips, cards
│   ├── RateBadge.tsx        # Header usage badge (normal/warning/exhausted)
│   ├── SkeletonLoader.tsx   # Shimmer skeleton for loading state
│   ├── SiteIcons.tsx        # "Open & Paste" quick-launch icons
│   └── Toast.tsx            # Error notifications with optional Retry
├── hooks/
│   ├── useImprove.ts        # POST /v1/improve via background message
│   ├── useLibrary.ts        # storage.local CRUD + search/filter
│   └── useRateLimit.ts      # GET /v1/limits on mount
├── services/
│   ├── api.ts               # Typed fetch wrappers for all endpoints
│   └── storage.ts           # browser.storage.local helpers
├── types/
│   └── index.ts             # All shared TypeScript types
├── styles/
│   └── main.css             # Design system — Glassmorphism + Bento Grid
└── tests/
    ├── setup.ts             # vitest globals + browser API mocks
    ├── api.test.ts          # API service — all endpoints + error cases
    ├── storage.test.ts      # Storage service — CRUD, 200-item cap
    ├── useRateLimit.test.ts # getRateLimitState logic
    └── components.test.tsx  # RateBadge, Toast rendering + interactions
```

## Architecture decisions

### Background service worker as API proxy
All network requests go through the background service worker via `browser.runtime.sendMessage`. This keeps API keys and installation IDs in a single secure context, avoids CORS issues in popup context, and lets the sidebar and popup share the same request logic.

### Draft state preservation for sidebar toggle
The `draft` state (original + improved text) lives in `App.tsx`. When switching from popup → sidebar, the popup closes but draft is intentionally not persisted to storage on each keystroke (avoids write churn). For full persistence across layout switches, you could `storage.session.set` the draft before `window.close()`.

### storage.local for the library
`browser.storage.local` gives ~10MB and is synchronous to write. Items are capped at 200 (newest first) to keep reads fast. Sync storage is intentionally avoided — it has a 100KB quota which is too small for prompt pairs.

### No content-script required
The "Open & Paste" buttons open AI websites in new tabs. Full auto-paste into AI inputs would require content scripts per site — this is listed as not required.

### Glassmorphism + Bento Grid design
CSS variables + layered `rgba` backgrounds + `backdrop-filter: blur()` provide the glassmorphism effect. Cards are laid out in a single-column bento pattern with consistent border-radius and gap rhythm. DM Sans (body) + Space Mono (numeric badges) give a distinctive technical feel without generic AI aesthetics.

## Tradeoffs

| Decision | Tradeoff |
|---|---|
| Background as API proxy | Adds one message round-trip per request; worth it for security |
| Plain CSS (no Tailwind/CSS-in-JS) | More verbose but zero runtime overhead, per spec requirement |
| vitest + jsdom | Fast, but requires mocking browser APIs; no real extension context |
| 200-item cap hard-coded | Simple and fast; could be user-configurable in settings |
| Draft not persisted to storage | Avoids write churn; lost on extension reload (acceptable) |
