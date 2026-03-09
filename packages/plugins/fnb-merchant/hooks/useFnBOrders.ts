import { useState, useCallback, useEffect } from 'react';
import { fnbMerchantService } from '../services/fnbMerchantService';
import type { FnBOrderFilters } from '../models/FnBOrder';
import type { FnBOrder } from '../models/FnBOrder';

export interface UseFnBOrdersReturn {
  orders: FnBOrder[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFnBOrders(filters?: FnBOrderFilters): UseFnBOrdersReturn {
  const [orders, setOrders] = useState<FnBOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fnbMerchantService.getOrders(filters);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load orders'));
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.limit, filters?.offset]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, isLoading, error, refresh };
}
