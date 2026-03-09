import { useState, useCallback, useEffect } from 'react';
import { fnbMerchantService } from '../services/fnbMerchantService';
import type { FnBMenuItem } from '../models';

export interface UseFnBMenuReturn {
  menu: FnBMenuItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFnBMenu(): UseFnBMenuReturn {
  const [menu, setMenu] = useState<FnBMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fnbMerchantService.getMenu();
      setMenu(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load menu'));
      setMenu([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { menu, isLoading, error, refresh };
}
