import { useState, useEffect, useCallback } from 'react';
import { getLibrary, deleteFromLibrary, saveToLibrary, getStorageSize } from '../services/storage';
import type { LibraryItem } from '../types';

export interface UseLibraryReturn {
  items: LibraryItem[];
  search: string;
  setSearch: (s: string) => void;
  filteredItems: LibraryItem[];
  storageSize: string;
  save: (original: string, improved: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLibrary(): UseLibraryReturn {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    const lib = await getLibrary();
    setItems(lib);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (original: string, improved: string) => {
    await saveToLibrary(original, improved);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteFromLibrary(id);
    await refresh();
  }, [refresh]);

  const q = search.toLowerCase();
  const filteredItems = search
    ? items.filter(
        (i) =>
          i.original_text.toLowerCase().includes(q) ||
          i.improved_text.toLowerCase().includes(q)
      )
    : items;

  return {
    items,
    search,
    setSearch,
    filteredItems,
    storageSize: getStorageSize(items),
    save,
    remove,
    refresh,
  };
}