import { useState, useCallback, useEffect } from 'react';
import { orderService, OrderFilters } from '../services/orderService';
import type { Order } from '../models/Order';

export interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useOrders(filters?: OrderFilters): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.getOrders(filters);
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
