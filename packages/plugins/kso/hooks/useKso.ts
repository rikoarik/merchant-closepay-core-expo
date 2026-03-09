import { useState, useCallback, useEffect } from 'react';
import { ksoService } from '../services/ksoService';
import type { KsoAgreement } from '../models';

export interface UseKsoReturn {
  kso: KsoAgreement | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useKso(id: string | null): UseKsoReturn {
  const [kso, setKso] = useState<KsoAgreement | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!id) {
      setKso(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await ksoService.getKso(id);
      setKso(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load KSO'));
      setKso(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { kso, isLoading, error, refresh };
}
