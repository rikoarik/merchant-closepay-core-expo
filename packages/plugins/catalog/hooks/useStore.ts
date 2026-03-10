import { useState, useCallback, useEffect } from 'react';
import { catalogService } from '../services/catalogService';
import type { Store } from '../models';

export interface UseStoreReturn {
  store: Store | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useStore(): UseStoreReturn {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await catalogService.getStore();
      setStore(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load store'));
      setStore(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { store, isLoading, error, refresh };
}
