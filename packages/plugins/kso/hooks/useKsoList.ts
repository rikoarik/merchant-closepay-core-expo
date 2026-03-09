import { useState, useCallback, useEffect } from 'react';
import { ksoService } from '../services/ksoService';
import type { KsoAgreement, KsoAgreementFilters } from '../models';

export interface UseKsoListReturn {
  agreements: KsoAgreement[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useKsoList(filters?: KsoAgreementFilters): UseKsoListReturn {
  const [agreements, setAgreements] = useState<KsoAgreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ksoService.getKsoList(filters);
      setAgreements(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load KSO list'));
      setAgreements([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.type, filters?.search, filters?.limit, filters?.offset]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { agreements, isLoading, error, refresh };
}
