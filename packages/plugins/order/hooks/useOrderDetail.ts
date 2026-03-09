import { useState, useCallback, useEffect } from 'react';
import { orderService } from '../services/orderService';
import type { Order } from '../models/Order';

export interface UseOrderDetailReturn {
  order: Order | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useOrderDetail(id: string | null): UseOrderDetailReturn {
  const [order, setOrder] = useState<Order | null>(null);
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
      const data = await orderService.getOrder(id);
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
