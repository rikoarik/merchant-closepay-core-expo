import { useState, useCallback, useEffect } from 'react';
import { fnbMerchantService } from '../services/fnbMerchantService';
import type { FnBOrder } from '../models/FnBOrder';

export interface UseFnBOrderDetailReturn {
  order: FnBOrder | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFnBOrderDetail(id: string | null): UseFnBOrderDetailReturn {
  const [order, setOrder] = useState<FnBOrder | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!id) {
      setOrder(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await fnbMerchantService.getOrder(id);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load order'));
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { order, isLoading, error, refresh };
}
