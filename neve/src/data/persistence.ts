import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY } from '@/config/app';
import type { AppData } from '@/types';
import { migrate } from './migrations';

/**
 * Persistence abstraction so the storage engine can be swapped (AsyncStorage,
 * SQLite, encrypted store) without touching the rest of the app.
 */
export interface PersistenceService {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
  clear(): Promise<void>;
}

class AsyncStoragePersistence implements PersistenceService {
  async load(): Promise<AppData | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw));
    } catch {
      // Corrupt payload: treat as no data rather than crashing on launch.
      return null;
    }
  }

  async save(data: AppData): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

/** In-memory implementation for tests and previews. */
export class MemoryPersistence implements PersistenceService {
  private value: AppData | null = null;
  async load() {
    return this.value;
  }
  async save(data: AppData) {
    this.value = data;
  }
  async clear() {
    this.value = null;
  }
}

export const persistence: PersistenceService = new AsyncStoragePersistence();
