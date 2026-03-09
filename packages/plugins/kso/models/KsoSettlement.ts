/**
 * KSO Plugin - KsoSettlement model
 */
export type KsoSettlementType = 'payout' | 'adjustment';
export type KsoSettlementStatus = 'pending' | 'paid' | 'cancelled';

export interface KsoSettlement {
  id: string;
  ksoId: string;
  amount: number;
  type: KsoSettlementType;
  status: KsoSettlementStatus;
  periodStart: Date;
  periodEnd: Date;
  description?: string;
  createdAt: Date;
}
