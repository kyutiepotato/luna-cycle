import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Secure storage hook (for sensitive data like tokens, pins) ───────────────
export function useSecureStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  const load = useCallback(async () => {
    try {
      const raw = await SecureStore.getItemAsync(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {}
  }, [key]);

  const save = useCallback(async (newValue: T) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(newValue));
      setValue(newValue);
    } catch {}
  }, [key]);

  const remove = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(key);
      setValue(initialValue);
    } catch {}
  }, [key, initialValue]);

  return { value, load, save, remove };
}

// ─── Async storage hook (for non-sensitive app state) ────────────────────────
export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const save = useCallback(async (newValue: T) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    } catch {}
  }, [key]);

  const remove = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValue(initialValue);
    } catch {}
  }, [key, initialValue]);

  return { value, isLoading, load, save, remove };
}

// ─── Offline queue hook (queues operations for later sync) ───────────────────
const OFFLINE_QUEUE_KEY = 'luna_offline_queue';

interface QueuedOperation {
  id: string;
  type: 'upsert' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

export function useOfflineQueue() {
  const processQueue = useCallback(async (supabase: any) => {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!raw) return;
      const queue: QueuedOperation[] = JSON.parse(raw);
      const remaining: QueuedOperation[] = [];

      for (const op of queue) {
        try {
          if (op.type === 'upsert') {
            await supabase.from(op.table).upsert(op.data);
          } else if (op.type === 'delete') {
            await supabase.from(op.table).delete().eq('id', op.data.id);
          }
        } catch {
          remaining.push(op);
        }
      }

      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    } catch {}
  }, []);

  const enqueue = useCallback(async (op: Omit<QueuedOperation, 'id' | 'timestamp'>) => {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: QueuedOperation[] = raw ? JSON.parse(raw) : [];
      queue.push({
        ...op,
        id: Date.now().toString(),
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  }, []);

  return { processQueue, enqueue };
}
