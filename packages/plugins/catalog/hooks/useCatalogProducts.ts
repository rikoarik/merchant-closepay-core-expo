import { useState, useCallback, useEffect } from 'react';
import { catalogService } from '../services/catalogService';
import type { Product, ProductFilters } from '../models';

export interface UseCatalogProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCatalogProducts(filters?: ProductFilters): UseCatalogProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await catalogService.getProducts(filters);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load products'));
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.categoryId, filters?.isActive, filters?.search, filters?.limit, filters?.offset]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, isLoading, error, refresh };
}
