import { useState, useCallback, useEffect } from 'react';
import { catalogService } from '../services/catalogService';
import type { Category } from '../models';

export interface UseCatalogCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCatalogCategories(): UseCatalogCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await catalogService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, isLoading, error, refresh };
}
