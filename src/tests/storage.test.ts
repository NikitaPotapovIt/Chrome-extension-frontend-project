import { describe, it, expect, vi, beforeEach } from 'vitest';
import browser from 'webextension-polyfill';
import {
  getLibrary,
  saveToLibrary,
  deleteFromLibrary,
  getStorageSize,
  getInstallationId,
} from '../services/storage';

const mockGet = browser.storage.local.get as ReturnType<typeof vi.fn>;
const mockSet = browser.storage.local.set as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getInstallationId', () => {
  it('returns existing installation_id from storage', async () => {
    mockGet.mockResolvedValueOnce({ installation_id: 'existing-id' });
    const id = await getInstallationId();
    expect(id).toBe('existing-id');
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('generates and stores a new id if none exists', async () => {
    mockGet.mockResolvedValueOnce({});
    const id = await getInstallationId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(mockSet).toHaveBeenCalledWith({ installation_id: id });
  });
});

describe('getLibrary', () => {
  it('returns empty array when storage is empty', async () => {
    mockGet.mockResolvedValueOnce({});
    const lib = await getLibrary();
    expect(lib).toEqual([]);
  });

  it('returns stored library items', async () => {
    const items = [{ id: '1', original_text: 'a', improved_text: 'b', created_at: 1000 }];
    mockGet.mockResolvedValueOnce({ library: items });
    const lib = await getLibrary();
    expect(lib).toEqual(items);
  });
});

describe('saveToLibrary', () => {
  it('prepends new item and trims to 200', async () => {
    mockGet.mockResolvedValueOnce({ library: [] });
    const item = await saveToLibrary('original', 'improved', 'popup');
    expect(item.original_text).toBe('original');
    expect(item.improved_text).toBe('improved');
    expect(item.source).toBe('popup');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        library: expect.arrayContaining([expect.objectContaining({ id: item.id })]),
      })
    );
  });

  it('limits library to 200 items', async () => {
    const existing = Array.from({ length: 200 }, (_, i) => ({
      id: `id-${i}`,
      original_text: `o${i}`,
      improved_text: `i${i}`,
      created_at: i,
    }));
    mockGet.mockResolvedValueOnce({ library: existing });
    await saveToLibrary('new-original', 'new-improved');
    const [call] = mockSet.mock.calls;
    expect(call[0].library).toHaveLength(200);
    expect(call[0].library[0].original_text).toBe('new-original');
  });
});

describe('deleteFromLibrary', () => {
  it('removes item with matching id', async () => {
    const items = [
      { id: 'a', original_text: 'x', improved_text: 'y', created_at: 1 },
      { id: 'b', original_text: 'p', improved_text: 'q', created_at: 2 },
    ];
    mockGet.mockResolvedValueOnce({ library: items });
    await deleteFromLibrary('a');
    expect(mockSet).toHaveBeenCalledWith({
      library: [items[1]],
    });
  });
});

describe('getStorageSize', () => {
  it('returns B for small data', () => {
    const items = [{ id: '1', original_text: 'a', improved_text: 'b', created_at: 0 }];
    const size = getStorageSize(items);
    expect(size).toMatch(/B$/);
  });

  it('returns KB for larger data', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      id: `id-${i}`,
      original_text: 'a'.repeat(50),
      improved_text: 'b'.repeat(100),
      created_at: i,
    }));
    const size = getStorageSize(items);
    expect(size).toMatch(/KB$/);
  });
});
