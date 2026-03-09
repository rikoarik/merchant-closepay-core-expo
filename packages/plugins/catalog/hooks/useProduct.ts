import { useState, useCallback, useEffect } from 'react';
import { catalogService } from '../services/catalogService';
import type { Product } from '../models';

export interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useProduct(id: string | null): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!id) {
      setProduct(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await catalogService.getProduct(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load product'));
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { product, isLoading, error, refresh };
}
