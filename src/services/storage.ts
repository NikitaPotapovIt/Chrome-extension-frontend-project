import browser from 'webextension-polyfill';
import type { LibraryItem } from '../types';

const MAX_ITEMS = 200;
const STORAGE_KEY = 'library';
const INSTALLATION_KEY = 'installation_id';

export async function getInstallationId(): Promise<string> {
  const result = await browser.storage.local.get(INSTALLATION_KEY);
  if (result[INSTALLATION_KEY]) return result[INSTALLATION_KEY] as string;
  const id = crypto.randomUUID();
  await browser.storage.local.set({ [INSTALLATION_KEY]: id });
  return id;
}

export async function getLibrary(): Promise<LibraryItem[]> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as LibraryItem[]) ?? [];
}

export async function saveToLibrary(
  original: string,
  improved: string,
  source = 'popup'
): Promise<LibraryItem> {
  const library = await getLibrary();
  const item: LibraryItem = {
    id: crypto.randomUUID(),
    original_text: original,
    improved_text: improved,
    created_at: Date.now(),
    source,
  };
  const updated = [item, ...library].slice(0, MAX_ITEMS);
  await browser.storage.local.set({ [STORAGE_KEY]: updated });
  return item;
}

export async function deleteFromLibrary(id: string): Promise<void> {
  const library = await getLibrary();
  await browser.storage.local.set({
    [STORAGE_KEY]: library.filter((item) => item.id !== id),
  });
}

export function getStorageSize(items: LibraryItem[]): string {
  const bytes = new TextEncoder().encode(JSON.stringify(items)).length;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
