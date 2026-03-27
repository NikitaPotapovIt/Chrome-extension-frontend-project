import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      local: {
        get: vi.fn().mockResolvedValue({}),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined),
      },
    },
    runtime: {
      sendMessage: vi.fn().mockResolvedValue({ success: true, data: {} }),
      onMessage: { addListener: vi.fn() },
      onInstalled: { addListener: vi.fn() },
    },
  },
}));

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
  },
});

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});
