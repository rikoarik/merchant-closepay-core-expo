import { useState, useCallback, useEffect } from 'react';
import { ksoService } from '../services/ksoService';
import type { KsoSettlement } from '../models';

export interface UseKsoSettlementsReturn {
  settlements: KsoSettlement[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useKsoSettlements(ksoId?: string | null): UseKsoSettlementsReturn {
  const [settlements, setSettlements] = useState<KsoSettlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ksoService.getSettlements(ksoId);
      setSettlements(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settlements'));
      setSettlements([]);
    } finally {
      setIsLoading(false);
    }
  }, [ksoId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settlements, isLoading, error, refresh };
}
